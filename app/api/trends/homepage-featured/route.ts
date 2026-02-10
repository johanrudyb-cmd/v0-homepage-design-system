import { NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';
import type { Prisma } from '@prisma/client';
import { getProductBrand, brandsMatch } from '@/lib/brand-utils';
import { isExcludedProduct } from '@/lib/hybrid-radar-scraper';
import { estimateInternalTrendPercent } from '@/lib/trend-product-kpis';

export const runtime = 'nodejs';

const AGE_SOURCE_BRANDS: Record<string, string[]> = {
  '18-24': ['ASOS'],
  '25-34': ['Zalando'],
};

const VALID_SEGMENTS = ['homme', 'femme'];

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

/**
 * Fonction de hash simple pour générer une seed déterministe
 */
function hash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Shuffle déterministe basé sur une seed
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * GET /api/trends/homepage-featured
 * Retourne 8 tendances sélectionnées aléatoirement chaque mois :
 * - 2 homme 18-24 ans
 * - 2 femme 18-24 ans
 * - 2 homme 25-34 ans
 * - 2 femme 25-34 ans
 */
export async function GET(request: Request) {
  try {
    // Return empty data gracefully when DATABASE_URL is not configured
    if (!isDatabaseAvailable()) {
      console.warn('[Homepage Featured] DATABASE_URL is not set. Returning empty trends.');
      return NextResponse.json({ trends: [], monthSeed: '' });
    }

    // Générer une seed basée sur le mois actuel pour la sélection aléatoire mensuelle
    const now = new Date();
    const monthSeed = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const combinations = [
      { segment: 'homme', ageRange: '18-24', count: 2 },
      { segment: 'femme', ageRange: '18-24', count: 2 },
      { segment: 'homme', ageRange: '25-34', count: 2 },
      { segment: 'femme', ageRange: '25-34', count: 2 },
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

      // Filtrer les produits exclus
      let filtered = products.filter((p) => !isExcludedProduct(p.name ?? ''));

      // Femme Zalando : ne garder que les refs du Trend Spotter
      if (combo.segment === 'femme' && sourceBrands.includes('Zalando')) {
        filtered = filtered.filter(
          (p) => p.trendGrowthPercent != null || (p.trendLabel != null && p.trendLabel.trim() !== '')
        );
      }

      if (filtered.length > 0) {
        // Sélectionner aléatoirement basé sur le mois
        const seed = hash(`${monthSeed}-${combo.segment}-${combo.ageRange}`);
        const shuffled = seededShuffle(filtered, seed);
        
        // Prendre les N premiers après shuffle et formater
        const selected = shuffled.slice(0, combo.count).map((p) => {
          const trendGrowthPercent = p.trendGrowthPercent ?? estimateInternalTrendPercent(p);
          const now = Date.now();
          return {
            id: p.id,
            name: p.name ?? '',
            brand: getProductBrand(p.name, p.sourceBrand),
            category: p.category ?? '',
            style: p.style ?? '',
            material: p.material ?? '',
            imageUrl: p.imageUrl,
            segment: p.segment ?? combo.segment,
            ageRange: combo.ageRange, // Ajouter l'âge pour le filtrage
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

    return NextResponse.json({
      trends: featuredTrends,
      monthSeed,
    });
  } catch (error: any) {
    console.error('[Homepage Featured] Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue', trends: [] },
      { status: 500 }
    );
  }
}
