/**
 * API Endpoint pour les statistiques hebdomadaires (n8n)
 * 
 * GET /api/n8n/weekly-stats
 * 
 * Fournit les statistiques de la semaine pour le rapport
 * hebdomadaire généré par n8n.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET(request: Request) {
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

        // Calculer la date il y a 7 jours
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Total utilisateurs
        const totalUsers = await prisma.user.count();

        // Nouveaux utilisateurs cette semaine
        const newUsers = await prisma.user.count({
            where: {
                createdAt: { gte: weekAgo },
            },
        });

        // Utilisateurs actifs (connectés cette semaine)
        const activeUsers = await prisma.user.count({
            where: {
                updatedAt: { gte: weekAgo },
            },
        });

        // Tendances scrapées
        let trendsScraped = 0;
        let trendsConfirmed = 0;
        try {
            trendsScraped = await prisma.trendProduct.count({
                where: {
                    createdAt: { gte: weekAgo },
                },
            });
            trendsConfirmed = await prisma.trendProduct.count({
                where: {
                    createdAt: { gte: weekAgo },
                    isGlobalTrendAlert: true,
                },
            });
        } catch {
            // Table may not exist yet
        }

        // Designs créés
        let designsCreated = 0;
        let techPacks = 0;
        try {
            designsCreated = await prisma.design.count({
                where: {
                    createdAt: { gte: weekAgo },
                },
            });
            techPacks = await prisma.design.count({
                where: {
                    createdAt: { gte: weekAgo },
                    techPack: { not: Prisma.DbNull },
                },
            });
        } catch {
            // Table may not exist yet
        }

        // Brands créées
        let brandsCreated = 0;
        try {
            brandsCreated = await prisma.brand.count({
                where: {
                    createdAt: { gte: weekAgo },
                },
            });
        } catch {
            // Table may not exist yet
        }

        // Utilisation IA
        let aiRequests = 0;
        let aiCost = 0;
        try {
            // @ts-ignore - Prisma aggregate types can be tricky
            const aiUsage = await prisma.aIUsage.aggregate({
                where: {
                    createdAt: { gte: weekAgo },
                },
                _count: true,
                _sum: {
                    costEur: true,
                },
            });
            aiRequests = aiUsage._count || 0;
            aiCost = Math.round((aiUsage._sum.costEur || 0) * 100) / 100;
        } catch {
            // Table may not exist yet
        }

        // Revenus (approximation via subscriptions)
        const proUsers = await prisma.user.count({
            where: {
                plan: 'pro',
            },
        });
        const enterpriseUsers = await prisma.user.count({
            where: {
                plan: 'enterprise',
            },
        });
        const revenue = (proUsers * 29) + (enterpriseUsers * 99); // MRR estimé

        const newSubscriptions = await prisma.user.count({
            where: {
                createdAt: { gte: weekAgo },
                plan: { not: 'free' },
            },
        });

        return NextResponse.json({
            period: {
                start: weekAgo.toISOString(),
                end: new Date().toISOString(),
            },
            totalUsers,
            newUsers,
            activeUsers,
            trendsScraped,
            trendsConfirmed,
            designsCreated,
            techPacks,
            brandsCreated,
            aiRequests,
            aiCost,
            revenue,
            newSubscriptions,
            proUsers,
            enterpriseUsers,
        });
    } catch (error: any) {
        console.error('[Weekly Stats] Erreur:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la collecte des statistiques' },
            { status: 500 }
        );
    }
}
