import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
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
            return NextResponse.json({ invoices: [] });
        }

        const invoices = await stripe.invoices.list({
            customer: user.stripeCustomerId,
            limit: 12,
        });

        return NextResponse.json({
            invoices: invoices.data.map(invoice => ({
                id: invoice.id,
                amount: invoice.total,
                currency: invoice.currency,
                status: invoice.status,
                date: invoice.created,
                pdf: invoice.invoice_pdf,
                number: invoice.number,
            }))
        });
    } catch (error: unknown) {
        console.error('[Stripe invoices]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erreur lors de la récupération des factures' },
            { status: 500 }
        );
    }
}
