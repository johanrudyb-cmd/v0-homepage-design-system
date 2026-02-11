import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST() {
    try {
        if (!stripe) {
            return NextResponse.json(
                { error: 'Stripe non configuré.' },
                { status: 503 }
            );
        }
        const authUser = await getCurrentUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
            select: { stripeCustomerId: true }
        });

        if (!user?.stripeCustomerId) {
            return NextResponse.json({ error: 'Aucun client Stripe trouvé pour cet utilisateur.' }, { status: 404 });
        }

        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        const returnUrl = `${baseUrl.replace(/\/$/, '')}/settings`;

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: returnUrl,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        console.error('[Stripe portal]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erreur lors de la création du portail' },
            { status: 500 }
        );
    }
}
