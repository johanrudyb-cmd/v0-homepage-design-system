import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
    try {
        // 1. Récupérer TOUS les produits récents pour pouvoir les grouper
        const products = await prisma.trendProduct.findMany({
            include: {
                matchedSupplier: true
            },
            where: {
                trendScore: { gt: 0 }
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 100, // On en prend pas mal pour faire des clusters pertinents
        });

        if (products.length === 0) {
            return NextResponse.json({ products: [] });
        }

        // 2. GROUPER PAR SIGNATURE (Style Ensemble)
        const clusters: Record<string, any[]> = {};
        products.forEach((p: any) => {
            const sig = p.productSignature || (p.category ? p.category.toUpperCase().replace(' ', '_') : 'AUTRE');
            if (!clusters[sig]) clusters[sig] = [];
            clusters[sig].push(p);
        });

        // 3. TRANSFORMER LES CLUSTERS EN "ASSETS" DE TRADING
        const formattedAssets = Object.entries(clusters).map(([sig, items]) => {
            // On prend l'item le plus récent pour les détails IA (supplier, catalysts, etc.)
            const latest = items[0];
            const avgScore = items.reduce((acc, curr) => acc + (curr.trendScore || 0), 0) / items.length;
            const avgGrowth = items.reduce((acc, curr) => acc + (curr.trendGrowthPercent || 0), 0) / items.length;
            const avgPrice = items.reduce((acc, curr) => acc + (curr.averagePrice || 0), 0) / items.length;

            // Calcul du temps relatif pour lastScan
            const now = new Date();
            const lastUpdate = new Date(latest.updatedAt);
            const diffMs = now.getTime() - lastUpdate.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMins / 60);

            let lastScanStr = "À l'instant";
            if (diffHours > 0) lastScanStr = `Il y a ${diffHours}h`;
            else if (diffMins > 0) lastScanStr = `Il y a ${diffMins}m`;

            return {
                id: sig, // On utilise la signature comme ID unique du cluster
                name: sig.replace(/_/g, ' '),
                segment: latest.segment || latest.category,
                price: Math.round(avgPrice),
                change: parseFloat(avgGrowth.toFixed(1)), // On garde la décimale pour le réalisme (ex: -0.2%)
                volum24h: items.length > 5 ? 'Explosif' : 'Fort',
                count: items.length, // Nombre d'articles détectés dans ce style
                saturation: Math.round(latest.saturability || 0),
                dominance: avgScore > 80 ? 'Haute' : 'Moyenne',
                signal: avgScore > 80 ? 'ACCÉLÉRER PROD' : (avgScore > 50 ? 'SURVEILLER' : 'NE PAS PRODUIRE'),
                theme: avgScore > 80 ? 'success' : (avgScore > 50 ? 'warning' : 'danger'),
                advice: latest.trendLabel || `Tendance de style détectée chez ${items.length} articles.`,
                risk: (latest.saturability || 0) > 70 ? 'Élevé' : 'Faible',
                potential: Math.round(avgScore),
                predictedScore60d: latest.predictedScore60d || 75,
                productionSafety: latest.productionSafety || 'SÛR',
                marketRegion: latest.marketZone || 'Europe',
                weatherSignal: latest.weatherSignal || 'Stable',
                lastScan: lastScanStr,
                aiConfidence: latest.aiConfidence || 90,
                upcomingCatalysts: latest.upcomingCatalysts || [],
                opportunityReason: latest.opportunityReason || `Regroupement de ${items.length} articles similaires identifiés comme opportunité de marché.`,
                retailPriceEst: latest.suggestedRetailPrice ? `${Math.round(latest.suggestedRetailPrice * 0.9)}€ - ${Math.round(latest.suggestedRetailPrice * 1.1)}€` : `${Math.round(avgPrice * 1.2)}€ - ${Math.round(avgPrice * 1.8)}€`,
                suggestedPrice: latest.suggestedRetailPrice || avgPrice * 1.4,
                matchedSupplier: latest.matchedSupplier ? {
                    name: latest.matchedSupplier.name,
                    country: latest.matchedSupplier.country,
                    moq: latest.matchedSupplier.moq
                } : null,
                markup: latest.suggestedRetailPrice ? `x${(latest.suggestedRetailPrice / (avgPrice * 0.3)).toFixed(1)}` : "x4.5",
                conversionRate: "4.8%",
                demandGrowth: `${avgGrowth > 0 ? '+' : ''}${avgGrowth.toFixed(1)}%`,
                competitionLevel: items.length > 10 ? "Haute" : "Modérée"
            };
        });

        // 4. Trier par potentiel et renvoyer
        const sortedAssets = formattedAssets.sort((a, b) => b.potential - a.potential).slice(0, 10);

        return NextResponse.json({ products: sortedAssets });
    } catch (error: any) {
        console.error('[Trading Signals API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch trading signals' }, { status: 500 });
    }
}
