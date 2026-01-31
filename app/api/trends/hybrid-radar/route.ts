/**
 * Trend Radar Hybride - Liste des tendances par zone et segment
 * Uniquement données réelles (Zalando, ASOS, Zara) et marchés FR / EU.
 * GET /api/trends/hybrid-radar?marketZone=FR|EU&segment=homme|femme&sortBy=...&limit=50
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

/** Marques qu'on scrape réellement (pas de données fictives / seed). */
const REAL_SOURCE_BRANDS = ['Zalando', 'ASOS', 'Zara'];
/** Marchés qu'on fait actuellement (pas US/ASIA). */
const ACTIVE_MARKET_ZONES = ['FR', 'EU'];
/** Segments valides (homme / femme). */
const VALID_SEGMENTS = ['homme', 'femme'];
/** Tri : meilleures tendances (score), plus récents, prix. */
type SortKey = 'trendScoreVisual' | 'createdAt' | 'averagePrice';
const SORT_OPTIONS: Record<string, { orderBy: Prisma.TrendProductOrderByWithRelationInput[] }> = {
  best: { orderBy: [{ trendScoreVisual: 'desc' }, { trendScore: 'desc' }, { createdAt: 'desc' }] },
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

    const where: {
      marketZone?: string | { in: string[] };
      segment?: string;
      isGlobalTrendAlert?: boolean;
      sourceBrand?: { in: string[] };
      sourceUrl?: { not: null };
    } = {
      sourceBrand: { in: REAL_SOURCE_BRANDS },
      sourceUrl: { not: null },
    };
    if (marketZone && ACTIVE_MARKET_ZONES.includes(marketZone)) {
      where.marketZone = marketZone;
    } else {
      where.marketZone = { in: ACTIVE_MARKET_ZONES };
    }
    if (segment && VALID_SEGMENTS.includes(segment)) {
      where.segment = segment;
    }
    if (globalOnly) {
      where.isGlobalTrendAlert = true;
    }

    const sortConfig = SORT_OPTIONS[sortBy] ?? SORT_OPTIONS.best;

    const products = await prisma.trendProduct.findMany({
      where,
      orderBy: sortConfig.orderBy,
      take: limit,
    });

    const summary = {
      total: products.length,
      byZone: {} as Record<string, number>,
      bySegment: {} as Record<string, number>,
      globalAlertCount: products.filter((p) => p.isGlobalTrendAlert).length,
    };
    for (const p of products) {
      if (p.marketZone) {
        summary.byZone[p.marketZone] = (summary.byZone[p.marketZone] || 0) + 1;
      }
      if (p.segment) {
        summary.bySegment[p.segment] = (summary.bySegment[p.segment] || 0) + 1;
      }
    }

    return NextResponse.json({
      trends: products,
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
