import { getAllSources } from './lib/hybrid-radar-sources';
import { scrapeHybridSource } from './lib/hybrid-radar-scraper';
import { inferCategory } from './lib/infer-trend-category';
import { getProductBrand, cleanProductName } from './lib/brand-utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seulement Paris pour commencer
const ACTIVE_SOURCE_IDS = [
    'zalando-trend-femme-paris',
    'zalando-trend-homme-paris',
];

const BEAUTY_EXCLUDE = [
    'exfoliant', 'crème', 'creme', 'sérum', 'serum', 'teinte', 'blush',
    'joue', 'lèvre', 'levre', 'fond de teint', 'mascara', 'eyeliner',
    'fard', 'correcteur', 'highlighter', 'bronzer', 'démaquillant',
    'lotion', 'gloss', 'lip ', 'parfum', 'déodorant', 'shampooing',
    'shampoing', 'masque visage', 'gommage', 'vernis', 'nail', 'skincare',
];

async function main() {
    console.log('🔄 Re-scraping Zalando Paris (with full model names)...\n');

    const allSources = getAllSources();
    const sources = allSources.filter(s => ACTIVE_SOURCE_IDS.includes(s.id));

    // Supprimer les anciens articles Zalando Paris
    const deleted = await prisma.trendProduct.deleteMany({
        where: {
            sourceBrand: 'Zalando',
            sourceUrl: { contains: '/paris/' },
        },
    });
    console.log(`🗑️  Deleted ${deleted.count} old Zalando Paris items.\n`);

    for (const s of sources) s.limit = 25;

    for (const source of sources) {
        console.log(`📡 Scraping ${source.id}... (limit ${source.limit})`);
        const expectedSegment = source.segment;

        try {
            const items = await scrapeHybridSource(source);
            console.log(`   Found ${items.length} raw items.`);

            let savedCount = 0;
            let skippedGender = 0;
            let skippedBeauty = 0;

            for (const item of items) {
                if (!item.name?.trim()) continue;

                const nameLower = item.name.toLowerCase();

                // Exclure beauté
                if (BEAUTY_EXCLUDE.some(kw => nameLower.includes(kw))) {
                    skippedBeauty++;
                    continue;
                }

                // Vérifier genre via URL
                const itemUrl = (item.sourceUrl ?? '').toLowerCase();
                const urlHasFemme = itemUrl.includes('/women/') || itemUrl.includes('-femme-');
                const urlHasHomme = itemUrl.includes('/men/') || itemUrl.includes('-homme-') || itemUrl.includes('-herren-');

                if (expectedSegment === 'homme' && urlHasFemme && !urlHasHomme) { skippedGender++; continue; }
                if (expectedSegment === 'femme' && urlHasHomme && !urlHasFemme) { skippedGender++; continue; }

                try {
                    // Extraire la marque depuis le nom brut (ex: "Claudie PierlotTEE - T-shirt")
                    const rawBrand = getProductBrand(item.name, source.brand);
                    // Nettoyer le nom en gardant le modèle (ex: "TEE - T-shirt à manches longues")
                    const cleanName = cleanProductName(item.name, rawBrand);
                    const category = inferCategory(cleanName);
                    const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;

                    console.log(`   RAW: "${item.name}" → CLEAN: "${cleanName}" [${rawBrand}]`);

                    const exists = await prisma.trendProduct.findFirst({
                        where: { sourceUrl: item.sourceUrl, sourceBrand: 'Zalando' }
                    });

                    if (!exists) {
                        await prisma.trendProduct.create({
                            data: {
                                name: cleanName,
                                category,
                                style: '',
                                averagePrice: price,
                                trendScore: 85,
                                saturability: 40,
                                imageUrl: item.imageUrl ?? null,
                                description: `Marque: ${rawBrand}\nVille: Paris`,
                                marketZone: source.marketZone,
                                sourceBrand: source.brand,
                                sourceUrl: item.sourceUrl,
                                segment: source.segment,
                                trendLabel: 'Tendance Locale',
                                trendScoreVisual: 85,
                                productBrand: rawBrand,
                                material: item.composition || 'Non spécifié',
                                color: item.color ?? null,
                                sizes: item.sizes ?? null,
                                countryOfOrigin: item.countryOfOrigin ?? null,
                                articleNumber: item.articleNumber ?? null,
                                careInstructions: item.careInstructions ?? null,
                                markdownPercent: item.markdownPercent ?? null,
                                stockOutRisk: item.stockOutRisk ?? null,
                            },
                        });
                        savedCount++;
                    }
                } catch (e) {
                    console.error(`  ❌ Error saving "${item.name}":`, e);
                }
            }

            console.log(`   ✅ Saved ${savedCount} | skipped: ${skippedGender} wrong gender, ${skippedBeauty} beauty\n`);

        } catch (e) {
            console.error(`Error scraping ${source.id}:`, e);
        }
    }

    console.log('✅ Done.');
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
