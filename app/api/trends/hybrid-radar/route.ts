/**
 * Trend Radar Hybride - Liste des tendances par segment
 * Tendances scrapées : 10 villes EU (Paris, Berlin, Milan, Copenhague, Stockholm, Anvers, Zurich, Londres, Amsterdam, Varsovie).
 * GET /api/trends/hybrid-radar?marketZone=EU&segment=homme|femme&sortBy=...&limit=50
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { getProductBrand, brandsMatch } from '@/lib/brand-utils';
import { isExcludedProduct } from '@/lib/hybrid-radar-scraper';
import { estimateInternalTrendPercent, computeTrendScore } from '@/lib/trend-product-kpis';

export const runtime = 'nodejs';

/** Tranche d'âge : 18-24 = ASOS, 25-34 = Zalando. */
const AGE_SOURCE_BRANDS: Record<string, string[]> = {
  '18-24': ['ASOS'],
  '25-34': ['Zalando'],
};
/** Zone affichée : EU. */
const ACTIVE_MARKET_ZONES = ['EU'];
/** Segments valides (homme / femme). */
const VALID_SEGMENTS = ['homme', 'femme'];
/** Tri : plus tendances en premier (% Zalando puis score), plus récents, prix. */
type SortKey = 'trendGrowthPercent' | 'trendScoreVisual' | 'createdAt' | 'averagePrice';
const SORT_OPTIONS: Record<string, { orderBy: Prisma.TrendProductOrderByWithRelationInput[] }> = {
  best: {
    orderBy: [
      { trendGrowthPercent: 'desc' },
      { trendScoreVisual: 'desc' },
      { trendScore: 'desc' },
      { createdAt: 'desc' },
    ],
  },
  recent: { orderBy: [{ createdAt: 'desc' }] },
  priceAsc: { orderBy: [{ averagePrice: 'asc' }] },
  priceDesc: { orderBy: [{ averagePrice: 'desc' }] },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marketZone = searchParams.get('marketZone');
    const segment = searchParams.get('segment');
    const sortBy = searchParams.get('sortBy') || 'best';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const globalOnly = searchParams.get('globalOnly') === 'true';
    const brandFilter = searchParams.get('brand')?.trim();
    const ageRange = searchParams.get('ageRange')?.trim();
    const sourceBrands = ageRange && AGE_SOURCE_BRANDS[ageRange] ? AGE_SOURCE_BRANDS[ageRange] : AGE_SOURCE_BRANDS['25-34'];

    const where: {
      marketZone?: string | { in: string[] };
      segment?: string;
      isGlobalTrendAlert?: boolean;
      sourceBrand?: { in: string[] };
      sourceUrl?: { not: null };
    } = {
      sourceBrand: { in: sourceBrands },
      sourceUrl: { not: null },
    };
    where.marketZone = 'EU';
    where.segment = segment && VALID_SEGMENTS.includes(segment) ? segment : 'homme';
    if (globalOnly) {
      where.isGlobalTrendAlert = true;
    }

    const sortConfig = SORT_OPTIONS[sortBy] ?? SORT_OPTIONS.best;

    const products = await prisma.trendProduct.findMany({
      where,
      orderBy: sortConfig.orderBy,
      take: limit + 20,
    });

    // Même logique d'exclusion que le scraper : vêtements uniquement (homme + femme)
    let filtered = products.filter((p) => !isExcludedProduct(p.name ?? ''));

    // Femme Zalando : ne garder que les refs du Trend Spotter (trendGrowthPercent ou trendLabel)
    const effectiveSegment = segment && VALID_SEGMENTS.includes(segment) ? segment : 'homme';
    if (effectiveSegment === 'femme' && sourceBrands.includes('Zalando')) {
      filtered = filtered.filter(
        (p) => p.trendGrowthPercent != null || (p.trendLabel != null && p.trendLabel.trim() !== '')
      );
    }

    if (brandFilter) {
      filtered = filtered.filter((p) => brandsMatch(getProductBrand(p.name, p.sourceBrand), brandFilter));
    }

    // Récurrence par (catégorie, segment) pour le calcul interne du % tendance
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
        // Nouveau : Score IVS Outfity
        outfityIVS: ivsScore,
        // Helper pour le regroupement par marque (nécessaire pour le shuffle)
        displayBrand: getProductBrand(p.name, p.sourceBrand) || p.sourceBrand || 'Unknown',
        // Signature pour dédoublonnage multi-sources
        signature: p.productSignature || p.name.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
      };
    });

    // FILTRE STRICT OUTFITY : On ne garde que les produits validés par l'IVS
    // Seuil de 70 pour être considéré comme une "Vraie Tendance" Outfity
    const validatedEnriched = enriched.filter(p => p.outfityIVS >= 70);

    /**
     * DÉDOUBLONNAGE PAR SIGNATURE
     * Si le même produit est présent via plusieurs sources, on ne garde que le meilleur.
     */
    const seenSignatures = new Set<string>();
    const uniqueEnriched = validatedEnriched.filter(p => {
      if (p.signature && seenSignatures.has(p.signature)) return false;
      seenSignatures.add(p.signature);
      return true;
    });

    /** 
     * ALGORITHME DE DIVERSITÉ (Round Robin)
     * On regroupe par marque pour éviter d'avoir 10 fois la même marque d'affilée.
     */
    const groupedByBrand = new Map<string, typeof uniqueEnriched>();
    for (const p of uniqueEnriched) {
      const b = p.displayBrand;
      if (!groupedByBrand.has(b)) groupedByBrand.set(b, []);
      groupedByBrand.get(b)!.push(p);
    }

    const diversified: typeof uniqueEnriched = [];
    const brands = Array.from(groupedByBrand.keys());
    let hasMore = true;
    let index = 0;

    // On limite à 15 produits par bucket (le Top 15 Outfity)
    const finalLimit = 15;

    while (hasMore && diversified.length < finalLimit) {
      hasMore = false;
      for (const b of brands) {
        const list = groupedByBrand.get(b)!;
        if (index < list.length) {
          diversified.push(list[index]);
          hasMore = true;
          if (diversified.length >= finalLimit) break;
        }
      }
      index++;
    }

    const trends = diversified;

    const summary = {
      total: filtered.length,
      byZone: {} as Record<string, number>,
      bySegment: {} as Record<string, number>,
      globalAlertCount: filtered.filter((p) => p.isGlobalTrendAlert).length,
    };
    for (const p of filtered) {
      if (p.marketZone) {
        summary.byZone[p.marketZone] = (summary.byZone[p.marketZone] || 0) + 1;
      }
      if (p.segment) {
        summary.bySegment[p.segment] = (summary.bySegment[p.segment] || 0) + 1;
      }
    }

    return NextResponse.json({
      trends,
      summary,
    });
  } catch (e) {
    console.error('[Hybrid Radar GET]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur' },
      { status: 500 }
    );
  }
}
