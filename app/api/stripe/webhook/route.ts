import { NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_PLAN_ID } from '@/lib/stripe';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { PACK_TO_FEATURES } from '@/lib/surplus-credits';

// Désactiver le body parsing pour recevoir le raw body (requis par Stripe)
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret || !stripe) {
    console.error('[Stripe webhook] Missing signature, STRIPE_WEBHOOK_SECRET or Stripe not configured');
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe!.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Stripe webhook] Signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const packId = session.metadata?.packId;
        const planId = session.metadata?.planId;
        const sessionId = session.id;

        if (!userId) {
          console.warn('[Stripe webhook] Missing userId in metadata');
          break;
        }

        const customerId = session.customer as string;

        // Abonnement plan Créateur (34€/mois)
        if (session.mode === 'subscription' && planId === SUBSCRIPTION_PLAN_ID) {
          const now = new Date();
          // Mettre à jour le plan et la date d'abonnement (reset des quotas mensuels)
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: SUBSCRIPTION_PLAN_ID,
              subscribedAt: now,
              stripeCustomerId: customerId // Sauvegarder l'ID client
            },
          });
          // Supprimer les consommations IA de ce mois pour reset immédiat des quotas
          const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          await prisma.aIUsage.deleteMany({
            where: {
              userId,
              createdAt: { gte: periodStart },
            },
          });
          console.log('[Stripe webhook] Subscription activated + quotas reset:', { userId, planId, customerId });
          break;
        }

        // Cas général : mettre à jour le stripeCustomerId s'il n'existe pas
        if (customerId) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId }
          }).catch(() => { }); // Ignorer si erreur (déjà fait ou concurrent)
        }

        if (!packId) {
          console.warn('[Stripe webhook] Missing packId in metadata');
          break;
        }

        const features = PACK_TO_FEATURES[packId];
        if (!features?.length) {
          console.warn('[Stripe webhook] Unknown packId:', packId);
          break;
        }

        for (const { feature, amount } of features) {
          const existing = await prisma.surplusCredits.findUnique({
            where: { stripeSessionId: `${sessionId}-${feature}` },
          });
          if (existing) {
            console.log('[Stripe webhook] Already credited (idempotent):', sessionId, feature);
            continue;
          }
          await prisma.surplusCredits.create({
            data: {
              userId,
              feature,
              amount,
              consumed: 0,
              stripeSessionId: `${sessionId}-${feature}`,
              packId,
            },
          });
          console.log('[Stripe webhook] Credited:', { userId, packId, feature, amount });
        }
        break;
      }
      default:
        console.log(`[Stripe webhook] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error('[Stripe webhook] Handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
