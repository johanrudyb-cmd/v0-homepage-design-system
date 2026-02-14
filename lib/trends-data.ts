import { prisma, isDatabaseAvailable } from './prisma';
import { getProductBrand, brandsMatch } from './brand-utils';
import { isExcludedProduct } from './hybrid-radar-scraper';
import { estimateInternalTrendPercent, computeTrendScore } from './trend-product-kpis';
import { Prisma } from '@prisma/client';

const AGE_SOURCE_BRANDS: Record<string, string[]> = {
    '18-24': ['ASOS', 'Global Partner'],
    '25-34': ['Zalando'],
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
            sourceUrl: { not: null },
            marketZone: 'EU',
            segment: combo.segment,
        };

        const products = await prisma.trendProduct.findMany({
            where,
            orderBy: SORT_OPTIONS.best.orderBy,
            take: 50,
        });

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
                    brand: getProductBrand(p.name, p.sourceBrand) ?? '',
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

    const sourceBrands = (AGE_SOURCE_BRANDS as any)[ageRange] || AGE_SOURCE_BRANDS['25-34'];

    const segmentFilter = segment === 'femme' ? ['femme', 'fille'] : ['homme', 'garcon'];

    const where: any = {
        sourceBrand: { in: sourceBrands },
        sourceUrl: { not: null },
        marketZone: 'EU',
        segment: { in: segmentFilter },
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

    const products = await prisma.trendProduct.findMany({
        where,
        orderBy,
        take: limit + 20,
    });

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
            p.trendGrowthPercent ?? null,
            p.trendLabel ?? null,
            p.trendScoreVisual ?? null
        );

        return {
            ...p,
            name: p.name ?? '',
            effectiveTrendGrowthPercent,
            effectiveTrendLabel: p.trendGrowthPercent == null && effectiveTrendGrowthPercent > 0 ? 'Estimé' : p.trendLabel,
            outfityIVS: ivsScore,
            displayBrand: getProductBrand(p.name, p.sourceBrand) || p.sourceBrand || 'Unknown',
            signature: p.productSignature || p.name.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
        };
    });

    const validatedEnriched = enriched.filter(p => p.outfityIVS >= 70);

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

    brands.sort((a, b) => {
        const bestA = groupedByBrand.get(a)![0].outfityIVS || 0;
        const bestB = groupedByBrand.get(b)![0].outfityIVS || 0;
        return bestB - bestA;
    });

    const finalLimit = limit;
    const topBrands = brands.slice(0, 4);
    for (const b of topBrands) {
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

    const totalCount = await prisma.trendProduct.count({ where });

    return {
        trends: diversified,
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
