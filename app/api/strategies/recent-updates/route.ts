import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

/**
 * API pour récupérer les mises à jour récentes de stratégies
 * pour afficher la bannière dans le dashboard
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Récupérer les marques de l'utilisateur qui ont été mises à jour dans les 7 derniers jours
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const brands = await prisma.brand.findMany({
            where: {
                userId: user.id,
                styleGuide: {
                    path: ['lastAIUpdate'],
                    not: null
                }
            },
            select: {
                id: true,
                name: true,
                styleGuide: true,
                updatedAt: true
            }
        });

        // Filtrer celles mises à jour récemment
        const recentUpdates = brands
            .filter(brand => {
                const styleGuide = brand.styleGuide as any;
                if (!styleGuide?.lastAIUpdate) return false;

                const updateDate = new Date(styleGuide.lastAIUpdate);
                return updateDate >= sevenDaysAgo;
            })
            .map(brand => {
                const styleGuide = brand.styleGuide as any;
                return {
                    id: `${brand.id}-${styleGuide.lastAIUpdate}`,
                    brandId: brand.id,
                    brandName: brand.name,
                    updateDate: styleGuide.lastAIUpdate,
                    source: styleGuide.lastUpdateSource || 'Actualités du secteur'
                };
            })
            .sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime());

        return NextResponse.json({
            success: true,
            updates: recentUpdates,
            count: recentUpdates.length
        });

    } catch (error) {
        console.error('Error fetching recent updates:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
