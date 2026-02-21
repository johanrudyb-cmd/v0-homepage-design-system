
import { getAllSources } from './lib/hybrid-radar-sources';
import { scrapeHybridSource } from './lib/hybrid-radar-scraper';
import { inferCategory } from './lib/infer-trend-category';
import { computeTrendScore } from './lib/trend-product-kpis';
import { getProductBrand, cleanProductName } from './lib/brand-utils';
import { PrismaClient } from '@prisma/client';
import type { HybridScrapedItem } from './lib/hybrid-radar-scraper';

const prisma = new PrismaClient();

const ACTIVE_SOURCE_IDS = [
    'zalando-trend-homme-paris',
    'zalando-trend-femme-paris',
];

import { updateMarketSnapshot } from './lib/market-stock-exchange';

async function main() {
    console.log('🔄 Refreshing Zalando (Paris) sources with Market Tracking...');

    const allSources = getAllSources();
    const sourceIds = [
        'zalando-trend-homme-paris',
        'zalando-trend-femme-paris',
    ];
    const sources = allSources.filter(s => sourceIds.includes(s.id));

    // Augmenter la limite pour capturer plus de volume (Market Index)
    for (const s of sources) s.limit = 100;

    const BEAUTY_EXCLUDE = [
        'exfoliant', 'crème', 'creme', 'sérum', 'serum', 'teinte', 'blush',
        'joue', 'lèvre', 'levre', 'fond de teint', 'mascara', 'eyeliner',
        'fard', 'correcteur', 'highlighter', 'bronzer', 'démaquillant',
        'lotion', 'gloss', 'lip ', 'parfum', 'déodorant', 'shampooing',
        'shampoing', 'masque visage', 'gommage', 'vernis', 'nail', 'skincare',
    ];

    for (const source of sources) {
        console.log(`\n📡 Scraping ${source.id}... (limit ${source.limit})`);
        const expectedSegment = source.segment; // 'homme' ou 'femme'

        // Stats pour le Market Index de cette source
        const categoryStats: Record<string, { count: number; totalScore: number; totalSat: number }> = {};

        try {
            const items = await scrapeHybridSource(source);
            console.log(`   Found ${items.length} items.`);

            let savedCount = 0;
            let updatedCount = 0;
            let skippedGender = 0;
            let skippedBeauty = 0;

            for (const item of items) {
                if (!item.name?.trim()) continue;

                const nameLower = item.name.toLowerCase();
                if (BEAUTY_EXCLUDE.some(kw => nameLower.includes(kw))) {
                    skippedBeauty++;
                    continue;
                }

                const itemUrl = (item.sourceUrl ?? '').toLowerCase();
                const urlHasFemme = itemUrl.includes('-femme-') || itemUrl.includes('/femme/') || itemUrl.includes('-women-') || itemUrl.includes('/women/');
                const urlHasHomme = itemUrl.includes('-homme-') || itemUrl.includes('/homme/') || itemUrl.includes('-men-') || itemUrl.includes('/men/') || itemUrl.includes('-herren-') || itemUrl.includes('-man-');

                if (expectedSegment === 'homme' && urlHasFemme && !urlHasHomme) { skippedGender++; continue; }
                if (expectedSegment === 'femme' && urlHasHomme && !urlHasFemme) { skippedGender++; continue; }

                try {
                    const currentProductBrand = item.productBrand ?? getProductBrand(item.name, source.brand);
                    const cleanName = cleanProductName(item.name, currentProductBrand);
                    const category = inferCategory(cleanName);
                    const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
                    const trendScore = 85;

                    // Accumuler stats pour Market Index
                    if (!categoryStats[category]) categoryStats[category] = { count: 0, totalScore: 0, totalSat: 40 };
                    categoryStats[category].count++;
                    categoryStats[category].totalScore += trendScore;
                    categoryStats[category].totalSat += 40; // Default saturability

                    const existingProduct = await prisma.trendProduct.findFirst({
                        where: { sourceUrl: item.sourceUrl, sourceBrand: 'Zalando' }
                    });

                    const now = new Date();

                    if (existingProduct) {
                        // UPDATE: Met à jour le tracking dans visualTags
                        const tags = (existingProduct.visualTags as any) || {};
                        const tracking = tags.market_tracking || {
                            first_seen: existingProduct.createdAt.toISOString(),
                            count: 1
                        };

                        tracking.last_seen = now.toISOString();
                        tracking.count = (tracking.count || 1) + 1;

                        await prisma.trendProduct.update({
                            where: { id: existingProduct.id },
                            data: {
                                visualTags: { ...tags, market_tracking: tracking },
                                trendScoreVisual: trendScore, // Mettre à jour le score si besoin
                                updatedAt: now
                            }
                        });
                        updatedCount++;
                    } else {
                        // CREATE
                        await prisma.trendProduct.create({
                            data: {
                                name: cleanName,
                                category,
                                style: '',
                                averagePrice: price,
                                trendScore,
                                saturability: 40,
                                imageUrl: item.imageUrl ?? null,
                                description: `Marque: ${currentProductBrand}\nVille: Paris`,
                                marketZone: source.marketZone,
                                sourceBrand: source.brand,
                                sourceUrl: item.sourceUrl,
                                segment: source.segment,
                                trendLabel: 'Tendance Locale',
                                trendScoreVisual: trendScore,
                                productBrand: currentProductBrand,
                                material: item.composition || 'Non spécifié',
                                visualTags: {
                                    market_tracking: {
                                        first_seen: now.toISOString(),
                                        last_seen: now.toISOString(),
                                        count: 1
                                    }
                                },
                            },
                        });
                        savedCount++;
                    }
                } catch (itemError) {
                    console.error(`Failed to process item ${item.name}:`, itemError);
                }
            }
            console.log(`   Saved ${savedCount} new, Updated ${updatedCount}. (Skipped: ${skippedGender} gender, ${skippedBeauty} beauty)`);

            // Mettre à jour le Market Index JSON
            console.log('   📊 Updating Market Index...');
            for (const [cat, stats] of Object.entries(categoryStats)) {
                updateMarketSnapshot(
                    cat,
                    expectedSegment ?? 'mixte',
                    source.marketZone ?? 'EU',
                    stats.count,
                    stats.totalScore / stats.count,
                    stats.totalSat / stats.count
                );
            }

        } catch (e) {
            console.error(`Error scraping ${source.id}:`, e);
        }
    }

    console.log(`\n✅ Finished Zalando Refresh.`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
