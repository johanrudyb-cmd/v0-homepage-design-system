/**
 * Route API pour obtenir les tendances avec recommandation (à privilégier / à éviter)
 *
 * GET /api/trends/confirmed?limit=30
 * Chaque tendance a recommendation + generatedImageUrl si une image IA a été stockée.
 */

import { NextResponse } from 'next/server';
import { getTrendsWithRecommendation } from '@/lib/trend-detector';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function buildTrendKey(productType: string, cut?: string | null, material?: string | null): string {
  return `${productType}|${cut ?? ''}|${material ?? ''}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const country = searchParams.get('country') || null;
    const style = searchParams.get('style') || null;
    const productType = searchParams.get('productType') || null;
    const segmentParam = searchParams.get('segment');
    const segment = segmentParam === 'homme' || segmentParam === 'femme' || segmentParam === 'enfant' ? segmentParam : null;

    const trends = await getTrendsWithRecommendation(limit, { country, style, productType, segment });

    const trendKeys = trends.map((t) => buildTrendKey(t.productType, t.cut, t.material));
    const generatedImages = await prisma.generatedProductImage.findMany({
      where: { trendKey: { in: trendKeys } },
    });
    const byKey = new Map(
      generatedImages.map((g) => [
        g.trendKey,
        { imageUrl: g.imageUrl, adviceText: g.adviceText, rating: g.rating },
      ])
    );

    const trendsWithGenerated = trends.map((t) => {
      const key = buildTrendKey(t.productType, t.cut, t.material);
      const row = byKey.get(key);
      return {
        ...t,
        generatedImageUrl: row?.imageUrl ?? null,
        aiAdvice: row?.adviceText ?? null,
        aiRating: row?.rating ?? null,
      };
    });

    return NextResponse.json({ trends: trendsWithGenerated });
  } catch (error: unknown) {
    console.error('[Trends Confirmed] Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
