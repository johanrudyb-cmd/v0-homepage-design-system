import { prisma, isDatabaseAvailable } from './prisma';
import { unstable_cache } from 'next/cache';
import { getProductBrand, brandsMatch, cleanProductName } from './brand-utils';
import { isExcludedProduct } from './hybrid-radar-scraper';
import { estimateInternalTrendPercent, computeTrendScore } from './trend-product-kpis';
import { Prisma } from '@prisma/client';

const AGE_SOURCE_BRANDS: Record<string, string[]> = {
    '18-24': ['Global Partner', 'Zara'],
    '25-34': ['Zalando', 'Zara'],
};

const SORT_OPTIONS: Record<string, { orderBy: Prisma.TrendProductOrderByWithRelationInput[] }> = {
    best: {
        orderBy: [
            { trendGrowthPercent: 'desc' },
            { trendScoreVisual: 'desc' },
            { trendScore: 'desc' },
            { createdAt: 'desc' },
        ],
    },
};

const getCachedRawTrends = unstable_cache(
    async (where: any, orderBy: any, take: number) => {
        try {
            return await prisma.trendProduct.findMany({ where, orderBy, take });
        } catch (error) {
            console.error('🛡️ [DB SAFEGUARD] Database query failed. Returning empty list to keep site alive.', String(error).substring(0, 100)); // Log partiel pour pas spammer
            return [];
        }
    },
    // Clé changée pour forcer le refresh
    ['raw-trends-query-v3-DEBUG'],
    { revalidate: 300, tags: ['trends'] } // Cache 5 min
);

export async function getFeaturedTrends() {
    if (!isDatabaseAvailable()) {
        return [];
    }

    const combinations = [
        { segment: 'homme', ageRange: '18-24', count: 4 },
        { segment: 'femme', ageRange: '18-24', count: 4 },
        { segment: 'homme', ageRange: '25-34', count: 4 },
        { segment: 'femme', ageRange: '25-34', count: 4 },
    ];

    const featuredTrends = [];

    for (const combo of combinations) {
        const sourceBrands = AGE_SOURCE_BRANDS[combo.ageRange] || AGE_SOURCE_BRANDS['25-34'];

        const where: Prisma.TrendProductWhereInput = {
            sourceBrand: { in: sourceBrands },
            marketZone: 'EU',
            segment: combo.segment,
        };

        // Utilisation du cache pour éviter de saturer la DB
        const products = await getCachedRawTrends(
            where,
            SORT_OPTIONS.best.orderBy,
            50
        );

        let filtered = products.filter((p) => !isExcludedProduct(p.name ?? ''));

        if (combo.segment === 'femme' && sourceBrands.includes('Zalando')) {
            filtered = filtered.filter(
                (p) => p.trendGrowthPercent != null || (p.trendLabel != null && p.trendLabel.trim() !== '')
            );
        }

        if (filtered.length > 0) {
            const groupedByBrand = new Map<string, any[]>();
            for (const p of filtered) {
                const brand = getProductBrand(p.name, p.sourceBrand) || 'Unknown';
                if (!groupedByBrand.has(brand)) groupedByBrand.set(brand, []);
                groupedByBrand.get(brand)!.push(p);
            }

            const brands = Array.from(groupedByBrand.keys());
            const selectedProducts: any[] = [];
            let productIdx = 0;
            let hasMore = true;

            while (selectedProducts.length < combo.count && hasMore) {
                hasMore = false;
                for (let i = 0; i < brands.length; i++) {
                    const list = groupedByBrand.get(brands[i])!;
                    if (productIdx < list.length) {
                        selectedProducts.push(list[productIdx]);
                        hasMore = true;
                        if (selectedProducts.length >= combo.count) break;
                    }
                }
                productIdx++;
            }

            const now = Date.now();
            const selected = selectedProducts.map((p) => {
                const daysInRadar = p.createdAt
                    ? Math.floor((now - p.createdAt.getTime()) / (24 * 60 * 60 * 1000))
                    : 0;
                const trendGrowthPercent =
                    p.trendGrowthPercent ??
                    estimateInternalTrendPercent({
                        trendGrowthPercent: p.trendGrowthPercent ?? null,
                        trendScoreVisual: p.trendScoreVisual ?? null,
                        isGlobalTrendAlert: p.isGlobalTrendAlert ?? false,
                        daysInRadar,
                        recurrenceInCategory: 0,
                    });
                return {
                    id: p.id,
                    name: p.name ?? '',
                    brand: p.productBrand && p.productBrand !== 'Elite'
                        ? p.productBrand
                        : (getProductBrand(p.name, p.sourceBrand) || ''),
                    category: p.category ?? '',
                    style: p.style ?? '',
                    material: p.material ?? '',
                    imageUrl: p.imageUrl,
                    segment: p.segment ?? combo.segment,
                    ageRange: combo.ageRange,
                    zone: 'EU',
                    trendScore: p.trendScore ?? 0,
                    trendGrowthPercent,
                    averagePrice: p.averagePrice ?? null,
                    createdAt: p.createdAt?.getTime() ?? now,
                };
            });

            featuredTrends.push(...selected);
        }
    }

    return featuredTrends;
}

export async function getHybridRadarTrends(params: {
    marketZone?: string;
    segment?: string;
    sortBy?: string;
    limit?: number;
    globalOnly?: boolean;
    brandFilter?: string;
    ageRange?: string;
}) {
    if (!isDatabaseAvailable()) {
        return { trends: [], summary: { total: 0, byZone: {}, bySegment: {}, globalAlertCount: 0 } };
    }

    const {
        marketZone = 'EU',
        segment = 'homme',
        sortBy = 'best',
        limit = 15,
        globalOnly = false,
        brandFilter,
        ageRange = '18-24'
    } = params;

    const sourceBrands = AGE_SOURCE_BRANDS[ageRange] || AGE_SOURCE_BRANDS['25-34'];

    const segmentFilter = segment;

    const where: any = {
        sourceBrand: { in: sourceBrands },
        sourceUrl: { not: null },
        marketZone: marketZone || 'EU',
        segment: segmentFilter,
    };

    if (globalOnly) {
        where.isGlobalTrendAlert = true;
    }

    const sortOptions: Record<string, any> = {
        best: [
            { trendGrowthPercent: 'desc' },
            { trendScoreVisual: 'desc' },
            { trendScore: 'desc' },
            { createdAt: 'desc' },
        ],
        recent: [{ createdAt: 'desc' }],
        priceAsc: [{ averagePrice: 'asc' }],
        priceDesc: [{ averagePrice: 'desc' }],
    };

    const orderBy = sortOptions[sortBy] || sortOptions.best;

    // Utilisation du cache pour éviter de saturer la DB
    const products = await getCachedRawTrends(where, orderBy, limit + 100);

    let filtered = products.filter((p) => !isExcludedProduct(p.name ?? ''));

    if (segment === 'femme' && sourceBrands.includes('Zalando')) {
        filtered = filtered.filter(
            (p) => p.trendGrowthPercent != null || (p.trendLabel != null && p.trendLabel.trim() !== '')
        );
    }

    if (brandFilter) {
        filtered = filtered.filter((p) => brandsMatch(getProductBrand(p.name, p.sourceBrand), brandFilter));
    }

    const recurrenceByKey = new Map<string, number>();
    for (const p of filtered) {
        const key = `${p.category ?? ''}|${p.segment ?? ''}`;
        recurrenceByKey.set(key, (recurrenceByKey.get(key) ?? 0) + 1);
    }

    const now = Date.now();
    const enriched = filtered.map((p) => {
        const daysInRadar = Math.floor((now - new Date(p.createdAt).getTime()) / 86400000);
        const recurrenceInCategory = recurrenceByKey.get(`${p.category ?? ''}|${p.segment ?? ''}`) ?? 0;
        const effectiveTrendGrowthPercent =
            p.trendGrowthPercent ??
            estimateInternalTrendPercent({
                trendGrowthPercent: p.trendGrowthPercent ?? null,
                trendScoreVisual: p.trendScoreVisual ?? null,
                isGlobalTrendAlert: p.isGlobalTrendAlert ?? false,
                daysInRadar,
                recurrenceInCategory,
            });

        const ivsScore = computeTrendScore(
            effectiveTrendGrowthPercent,
            p.trendLabel ?? null,
            p.trendScoreVisual ?? null,
            p.name ?? ''
        );

        // Si productBrand est déjà une vraie marque (pas un placeholder générique), l'utiliser directement
        const genericBrands = ['global partner', 'zalando', 'elite', 'unknown', 'asos', ''];
        const isGenericBrand = !p.productBrand || genericBrands.includes(p.productBrand.toLowerCase().trim());

        // Nettoyer le productBrand via getProductBrand pour gérer les cas encore collés (ex: "AllSaintsNATES" → "AllSaints")
        const rawBrand = isGenericBrand
            ? getProductBrand(p.name, p.sourceBrand)
            : getProductBrand(p.productBrand, p.sourceBrand) || p.productBrand;

        const displayBrand = rawBrand || '';
        const cleanName = cleanProductName(p.name ?? '', displayBrand);

        return {
            ...p,
            name: cleanName,
            effectiveTrendGrowthPercent,
            effectiveTrendLabel: p.trendGrowthPercent == null && effectiveTrendGrowthPercent > 0 ? 'Estimé' : p.trendLabel,
            outfityIVS: ivsScore,
            displayBrand: displayBrand,
            signature: p.productSignature || (p.name ?? '').toLowerCase().replace(/\s+/g, '-').slice(0, 50),
        };
    });

    const validatedEnriched = enriched.filter(p => {
        if (p.outfityIVS < 60) return false;

        const brandLower = (p.displayBrand || '').toLowerCase();
        const nameLower = (p.name || '').toLowerCase();

        // Exclure les fallbacks (Elite, vide, inconnu)
        if (!brandLower || brandLower === 'elite' || brandLower === 'unknown') return false;

        // Exclure si la marque est la même que le nom (souvent un échec de détection)
        if (brandLower === nameLower) return false;

        // Exclure les couleurs comme titres (version plus agressive)
        const colorWords = ['noir', 'blanc', 'bleu', 'rouge', 'vert', 'gris', 'beige', 'rose', 'marron', 'orange', 'violet', 'jaune', 'kaki', 'indigo', 'navy', 'black', 'white', 'grey', 'gray'];
        if (colorWords.some(cw => nameLower === cw || nameLower === `${cw}/${cw}` || nameLower.includes('/') && nameLower.split('/').every(part => colorWords.includes(part.trim())))) return false;

        // Exclure les marques propres des distributeurs
        const isRetailer = brandLower === 'zalando' ||
            brandLower === 'asos' ||
            brandLower.includes('design') || // Catch "ASOS DESIGN"
            brandLower.includes('4505') ||   // Catch "ASOS 4505"
            brandLower.includes('collusion') ||
            brandLower.includes('reclaimed') ||
            brandLower === 'global partner' ||
            brandLower === 'high premium';

        if (isRetailer) return false;

        return true;
    });

    const seenSignatures = new Set<string>();
    const uniqueEnriched = validatedEnriched.filter(p => {
        if (p.signature && seenSignatures.has(p.signature)) return false;
        seenSignatures.add(p.signature);
        return true;
    });

    const groupedByBrand = new Map<string, any[]>();
    for (const p of uniqueEnriched) {
        const b = p.displayBrand;
        if (!groupedByBrand.has(b)) groupedByBrand.set(b, []);
        groupedByBrand.get(b)!.push(p);
    }

    const diversified: any[] = [];
    const brands = Array.from(groupedByBrand.keys());

    // On trie les marques par la meilleure note de leur produit
    brands.sort((a, b) => {
        const bestA = groupedByBrand.get(a)![0].outfityIVS || 0;
        const bestB = groupedByBrand.get(b)![0].outfityIVS || 0;
        return bestB - bestA;
    });

    // On remplit diversified avec les meilleurs de chaque marque d'abord
    const finalLimit = limit;
    for (const b of brands) {
        const list = groupedByBrand.get(b)!;
        if (list.length > 0) {
            diversified.push(list[0]);
            list.shift();
        }
    }

    let hasMore = true;
    while (hasMore && diversified.length < finalLimit) {
        hasMore = false;
        for (const b of brands) {
            const list = groupedByBrand.get(b)!;
            if (list.length > 0) {
                diversified.push(list[0]);
                list.shift();
                hasMore = true;
                if (diversified.length >= finalLimit) break;
            }
        }
    }

    // TRI FINAL PAR SCORE DE VIRALITÉ pour répondre à "mis dans l'ordre" et limiter au Top 15
    const finalSorted = diversified
        .sort((a, b) => (b.outfityIVS || 0) - (a.outfityIVS || 0))
        .slice(0, finalLimit);

    let totalCount = 0;
    try {
        // Only count if we successfully fetched products to avoid hammering DB if down
        if (products.length > 0) {
            totalCount = await prisma.trendProduct.count({ where });
        }
    } catch (e) {
        // Silent fail for count
    }

    return {
        trends: finalSorted,
        summary: {
            total: totalCount,
            byZone: filtered.reduce((acc: any, p) => {
                if (p.marketZone) acc[p.marketZone] = (acc[p.marketZone] || 0) + 1;
                return acc;
            }, {}),
            bySegment: filtered.reduce((acc: any, p) => {
                if (p.segment) acc[p.segment] = (acc[p.segment] || 0) + 1;
                return acc;
            }, {}),
            globalAlertCount: filtered.filter((p) => p.isGlobalTrendAlert).length,
        }
    };
}
