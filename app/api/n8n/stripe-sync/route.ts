/**
 * API Endpoint pour la synchronisation Stripe via n8n
 * 
 * POST /api/n8n/stripe-sync
 * 
 * Reçoit les événements Stripe parsés par n8n
 * et met à jour la base de données OUTFITY.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        // Vérifier l'autorisation
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            return NextResponse.json(
                { error: 'CRON_SECRET not configured' },
                { status: 500 }
            );
        }

        const providedSecret = authHeader?.replace('Bearer ', '') || '';
        if (providedSecret !== cronSecret) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { eventType, customerId, email, amount, subscriptionId, status, plan } = body;

        console.log(`[Stripe Sync] Event: ${eventType} | Email: ${email} | Amount: ${amount}€`);

        // Trouver l'utilisateur par email
        let user = null;
        if (email) {
            user = await prisma.user.findUnique({
                where: { email },
            });
        }

        if (!user && customerId) {
            // Fallback: chercher par stripeCustomerId
            user = await prisma.user.findFirst({
                where: { stripeCustomerId: customerId },
            });
        }

        if (!user) {
            console.warn(`[Stripe Sync] Utilisateur non trouvé: ${email || customerId}`);
            return NextResponse.json({
                success: false,
                message: 'Utilisateur non trouvé',
            }, { status: 404 });
        }

        // Traiter selon le type d'événement
        switch (eventType) {
            case 'checkout.session.completed':
            case 'customer.subscription.created':
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        stripeCustomerId: customerId || user.stripeCustomerId,
                        subscriptionId: subscriptionId || user.subscriptionId,
                        subscriptionStatus: 'active',
                        plan: plan || 'pro',
                    },
                });
                console.log(`[Stripe Sync] ✅ Abonnement activé pour ${email}`);
                break;

            case 'customer.subscription.updated':
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        subscriptionStatus: status || 'active',
                        plan: plan || user.plan,
                    },
                });
                console.log(`[Stripe Sync] ✅ Abonnement mis à jour pour ${email}`);
                break;

            case 'customer.subscription.deleted':
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        subscriptionStatus: 'canceled',
                        plan: 'free',
                    },
                });
                console.log(`[Stripe Sync] ❌ Abonnement annulé pour ${email}`);
                break;

            case 'invoice.payment_succeeded':
                console.log(`[Stripe Sync] 💰 Paiement ${amount}€ reçu de ${email}`);
                break;

            case 'invoice.payment_failed':
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        subscriptionStatus: 'past_due',
                    },
                });
                console.log(`[Stripe Sync] ⚠️ Paiement échoué pour ${email}`);
                break;

            default:
                console.log(`[Stripe Sync] Event non traité: ${eventType}`);
        }

        return NextResponse.json({
            success: true,
            message: `Event ${eventType} traité`,
            userId: user.id,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('[Stripe Sync] Erreur:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la synchronisation' },
            { status: 500 }
        );
    }
}
