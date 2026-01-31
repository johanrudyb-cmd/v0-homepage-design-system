/**
 * Liste les tendances confirmées avec indication de la source des données :
 * - scraped = vraies données (issues du scan des marques)
 * - seed = données de test (script seed-trend-signals)
 *
 * GET /api/trends/sources?limit=50
 */

import { NextResponse } from 'next/server';
import { getTrendsWithRecommendation } from '@/lib/trend-detector';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function buildTrendKey(productType: string, cut?: string | null, material?: string | null): string {
  return `${productType}|${cut ?? ''}|${material ?? ''}`;
}

/** URLs du script seed sont courtes et sans ID produit (ex. /fr/fr/hoodie-oversized). */
function looksLikeScrapedUrl(sourceUrl: string): boolean {
  if (!sourceUrl || sourceUrl.length < 20) return false;
  const u = sourceUrl.toLowerCase();
  // URLs scrapées réelles ont souvent : IDs (chiffres, -p-, /p/, .html avec long path)
  if (u.includes('/p/') || u.includes('-p-')) return true;
  if (/\d{6,}/.test(u)) return true;
  if (u.includes('.html') && u.length > 70) return true;
  // Path avec plusieurs segments (ex. /fr/femme/category/product-12345678.html)
  const path = u.replace(/^https?:\/\/[^/]+/, '');
  if (path.split('/').filter(Boolean).length >= 4 && path.length > 50) return true;
  return false;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const trends = await getTrendsWithRecommendation(limit, {});

    const trendKeys = trends.map((t) => buildTrendKey(t.productType, t.cut, t.material));
    const uniqueKeys = [...new Set(trendKeys)];

    const sourceByKey = new Map<string, 'scraped' | 'seed'>();
    for (const key of uniqueKeys) {
      const [productType, cut, material] = key.split('|');
      const signals = await prisma.trendSignal.findMany({
        where: {
          isConfirmed: true,
          productType,
          cut: cut || null,
          material: material || null,
        },
        select: { sourceUrl: true },
        take: 10,
      });
      const hasScrapedUrl = signals.some((s) => looksLikeScrapedUrl(s.sourceUrl));
      sourceByKey.set(key, hasScrapedUrl ? 'scraped' : 'seed');
    }

    const withSource = trends.map((t) => {
      const key = buildTrendKey(t.productType, t.cut, t.material);
      return {
        ...t,
        dataSource: sourceByKey.get(key) ?? 'seed',
      };
    });

    const fromScraped = withSource.filter((t) => t.dataSource === 'scraped').length;
    const fromSeed = withSource.filter((t) => t.dataSource === 'seed').length;

    return NextResponse.json({
      trends: withSource,
      summary: {
        total: withSource.length,
        fromScraped,
        fromSeed,
      },
      legend: {
        scraped: 'Données réelles (scan des sites Zara, ASOS, H&M, etc.)',
        seed: 'Données de test (script seed-trend-signals)',
      },
    });
  } catch (error: unknown) {
    console.error('[Trends Sources]', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
