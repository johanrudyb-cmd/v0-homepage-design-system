import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        // Sécurisation avec le même secret n8n
        const { searchParams } = new URL(req.url);
        const secret = req.headers.get('x-n8n-secret') || searchParams.get('secret');

        if (!secret || secret !== process.env.N8N_WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Récupérer les produits les plus "chauds" (High Trend Score)
        const trendingProducts = await prisma.trendProduct.findMany({
            where: {
                trendScore: { gte: 70 }, // Seulement le haut du panier
            },
            select: {
                name: true,
                productBrand: true, // LA MARQUE (Nike, etc.)
                category: true,
                style: true,
                trendScore: true,
                trendGrowthPercent: true,
                marketZone: true,
                // ON NE SELECTIONNE PAS sourceBrand NI sourceUrl
            },
            orderBy: {
                trendScore: 'desc',
            },
            take: 10,
        });

        // 2. Récupérer les catégories en forte croissance
        // On fait un petit calcul d'agrégation simple
        const categories = await prisma.trendProduct.groupBy({
            by: ['category'],
            _avg: {
                trendScore: true,
            },
            _count: {
                id: true,
            },
            orderBy: {
                _avg: {
                    trendScore: 'desc'
                }
            },
            take: 5
        });

        // 3. Récupérer les marques dominantes du moment
        const topBrands = await prisma.trendProduct.groupBy({
            by: ['productBrand'],
            _count: {
                id: true
            },
            where: {
                productBrand: { not: null }
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 5
        });

        // Structure propre pour l'IA de n8n
        const insights = {
            timestamp: new Date().toISOString(),
            topTrendingItems: trendingProducts.map(p => ({
                label: p.name,
                brand: p.productBrand || 'Unknown Specialist',
                category: p.category,
                intensity: `${p.trendScore}/100`,
                growth: p.trendGrowthPercent ? `+${p.trendGrowthPercent}%` : 'Stable',
                zone: p.marketZone
            })),
            marketDynamics: {
                dominantCategories: categories.map(c => ({
                    name: c.category,
                    momentum: Math.round(c._avg.trendScore || 0),
                    volume: c._count.id
                })),
                leadingBrands: topBrands.map(b => b.productBrand)
            },
            editorialGuideline: "Focus sur l'analyse de marché et la stratégie de marque. Ne jamais citer de plateformes de distribution (sites web tiers). Utiliser les données OUTFITY comme source d'autorité."
        };

        return NextResponse.json(insights);

    } catch (error) {
        console.error('[BLOG_TRENDS_DATA_ERROR]', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
