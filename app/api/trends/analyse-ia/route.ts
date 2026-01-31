/**
 * API d'analyse IA des tendances
 * GET /api/trends/analyse-ia — rapport global (prévisions France, tendances à venir)
 * POST /api/trends/analyse-ia — analyse individuelle d’un produit
 */

import { NextResponse } from 'next/server';
import { getConfirmedTrends } from '@/lib/trend-detector';
import { generateTrendsAnalysis, generateProductTrendAnalysis } from '@/lib/api/chatgpt';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET() {
  try {
    const [trends, countryStats, styleStats, productTypeStats] = await Promise.all([
      getConfirmedTrends(20, {}),
      prisma.trendSignal.groupBy({
        by: ['country'],
        where: { isConfirmed: true, country: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.trendSignal.groupBy({
        by: ['style'],
        where: { isConfirmed: true, style: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.trendSignal.groupBy({
        by: ['productType'],
        where: { isConfirmed: true },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    const analysis = await generateTrendsAnalysis({
      byCountry: countryStats.map((s) => ({ country: s.country, count: s._count.id })),
      byStyle: styleStats.map((s) => ({ style: s.style, count: s._count.id })),
      byProductType: productTypeStats.map((s) => ({ productType: s.productType, count: s._count.id })),
      topTrends: trends.map((t) => ({
        productName: t.productName,
        productType: t.productType,
        style: t.style,
        country: t.country,
        confirmationScore: t.confirmationScore,
      })),
    });

    return NextResponse.json({ analysis });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Une erreur est survenue';
    console.error('[Trends Analyse IA]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productName,
      productType,
      cut,
      material,
      color,
      style,
      country,
      brands,
      averagePrice,
      confirmationScore,
    } = body;

    if (!productName || !productType || !Array.isArray(brands) || typeof averagePrice !== 'number') {
      return NextResponse.json(
        { error: 'Corps invalide : productName, productType, brands, averagePrice requis' },
        { status: 400 }
      );
    }

    const analysis = await generateProductTrendAnalysis({
      productName,
      productType,
      cut: cut ?? null,
      material: material ?? null,
      color: color ?? null,
      style: style ?? null,
      country: country ?? null,
      brands,
      averagePrice,
      confirmationScore: typeof confirmationScore === 'number' ? confirmationScore : 0,
    });

    return NextResponse.json({ analysis });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Une erreur est survenue';
    console.error('[Trends Analyse IA produit]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
