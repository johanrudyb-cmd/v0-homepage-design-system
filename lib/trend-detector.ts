/**
 * Détecteur de tendances basé sur l'analyse des grandes marques
 * 
 * Si 3+ leaders ont le même produit → Tendance Confirmée
 */

import { BigBrandProduct } from './big-brands-scraper';
import { prisma } from '@/lib/prisma';

export interface TrendSignal {
  productName: string;
  productType: string;
  cut: string | null;
  material: string | null;
  color: string | null;
  brands: string[];
  averagePrice: number;
  confirmationScore: number;
  isConfirmed: boolean;
  firstSeenAt: Date;
  confirmedAt: Date | null;
  country: string | null;
  /** Marchés où la tendance est présente (ex. FR, UK, DE) */
  countries?: string[];
  style: string | null;
  imageUrl?: string | null;
  /** Segment cible : homme, femme ou enfant (inféré depuis l’URL source) */
  segment?: 'homme' | 'femme' | 'enfant' | null;
}

/** Tendance avec recommandation : à privilégier ou à éviter (déclin / saturé) */
export type TrendWithRecommendation = TrendSignal & {
  recommendation: 'recommended' | 'avoid';
};

/**
 * Normaliser un produit pour le regroupement
 */
function normalizeProduct(product: BigBrandProduct): string {
  // Créer une clé unique basée sur type + coupe + matériau
  const parts = [
    product.type,
    product.cut || '',
    product.material || '',
  ].filter(Boolean);
  
  return parts.join('|').toLowerCase();
}

/**
 * Grouper les produits similaires
 */
function groupSimilarProducts(products: BigBrandProduct[]): Map<string, BigBrandProduct[]> {
  const groups = new Map<string, BigBrandProduct[]>();

  for (const product of products) {
    const key = normalizeProduct(product);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(product);
  }

  return groups;
}

/**
 * Détecter les tendances depuis les produits scrapés
 */
export async function detectTrends(products: BigBrandProduct[]): Promise<TrendSignal[]> {
  // 1. Grouper les produits similaires
  const groups = groupSimilarProducts(products);

  // 2. Filtrer les groupes avec 3+ marques différentes
  const trends: TrendSignal[] = [];

  for (const [key, groupProducts] of groups.entries()) {
    // Compter les marques uniques
    const uniqueBrands = new Set(groupProducts.map(p => p.brand));
    
    if (uniqueBrands.size >= 3) {
      // Tendance confirmée !
      const firstProduct = groupProducts[0];
      const averagePrice = groupProducts.reduce((sum, p) => sum + p.price, 0) / groupProducts.length;
      
      // Déterminer le pays le plus fréquent
      const countries = groupProducts.map(p => p.country);
      const countryCounts = new Map<string, number>();
      countries.forEach(c => countryCounts.set(c, (countryCounts.get(c) || 0) + 1));
      const mostCommonCountry = Array.from(countryCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      
      // Déterminer le style le plus fréquent
      const styles = groupProducts.map(p => p.style).filter(Boolean);
      const styleCounts = new Map<string, number>();
      styles.forEach(s => styleCounts.set(s!, (styleCounts.get(s!) || 0) + 1));
      const mostCommonStyle = Array.from(styleCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      const trend: TrendSignal = {
        productName: firstProduct.name,
        productType: firstProduct.type,
        cut: firstProduct.cut,
        material: firstProduct.material,
        color: firstProduct.color,
        brands: Array.from(uniqueBrands),
        averagePrice,
        confirmationScore: uniqueBrands.size,
        isConfirmed: true,
        firstSeenAt: new Date(),
        confirmedAt: new Date(),
        country: mostCommonCountry,
        style: mostCommonStyle,
      };

      trends.push(trend);
    }
  }

  return trends;
}

/**
 * Sauvegarder les signaux de tendance dans la base
 */
export async function saveTrendSignals(products: BigBrandProduct[]): Promise<{
  created: number;
  updated: number;
  confirmed: number;
}> {
  let created = 0;
  let updated = 0;
  let confirmed = 0;

  // Détecter les tendances
  const trends = await detectTrends(products);

  // Sauvegarder chaque produit comme TrendSignal
  for (const product of products) {
    try {
      // Chercher un signal existant (même produit, même marque)
      const existing = await prisma.trendSignal.findFirst({
        where: {
          productName: product.name,
          brand: product.brand,
          sourceUrl: product.sourceUrl,
        },
      });

      if (existing) {
        // Mettre à jour
        await prisma.trendSignal.update({
          where: { id: existing.id },
          data: {
            appearanceCount: existing.appearanceCount + 1,
            lastSeenAt: new Date(),
            price: product.price, // Mettre à jour le prix
          },
        });
        updated++;
      } else {
        // Créer nouveau signal
        await prisma.trendSignal.create({
          data: {
            productName: product.name,
            productType: product.type,
            cut: product.cut,
            material: product.material,
            color: product.color,
            brand: product.brand,
            sourceUrl: product.sourceUrl,
            sourceSection: product.section,
            price: product.price,
            priceCurrency: product.currency,
            imageUrl: product.imageUrl,
            country: product.country,
            style: product.style,
            appearanceCount: 1,
            firstSeenAt: new Date(),
            lastSeenAt: new Date(),
          },
        });
        created++;
      }
    } catch (error) {
      console.error(`[Trend Detector] Erreur lors de la sauvegarde de "${product.name}":`, error);
    }
  }

  // Mettre à jour les confirmations de tendances
  for (const trend of trends) {
    try {
      // Trouver tous les signaux correspondants
      const signals = await prisma.trendSignal.findMany({
        where: {
          productType: trend.productType,
          cut: trend.cut,
          material: trend.material,
        },
      });

      // Mettre à jour avec confirmation
      for (const signal of signals) {
        if (!signal.isConfirmed) {
          await prisma.trendSignal.update({
            where: { id: signal.id },
            data: {
              isConfirmed: true,
              confirmationScore: trend.confirmationScore,
              confirmedAt: new Date(),
            },
          });
          confirmed++;
        }
      }
    } catch (error) {
      console.error(`[Trend Detector] Erreur lors de la confirmation de tendance:`, error);
    }
  }

  return { created, updated, confirmed };
}

/** Inférer le segment (homme/femme/enfant) depuis l’URL source du produit */
function getSegmentFromUrl(sourceUrl: string): 'homme' | 'femme' | 'enfant' | null {
  const u = sourceUrl.toLowerCase();
  if (/\/(homme|men|mens|man|boys?)\b/.test(u)) return 'homme';
  if (/\/(femme|woman|womens?|ladies|girls?)\b/.test(u)) return 'femme';
  if (/\/(enfant|kids?|child|children)\b/.test(u)) return 'enfant';
  return null;
}

/**
 * Obtenir les tendances confirmées avec filtres optionnels
 */
export async function getConfirmedTrends(
  limit: number = 20,
  filters?: {
    country?: string | null;
    style?: string | null;
    productType?: string | null;
    segment?: 'homme' | 'femme' | 'enfant' | null;
  }
): Promise<TrendSignal[]> {
  const where: any = {
    isConfirmed: true,
  };
  
  if (filters?.country) {
    where.country = filters.country;
  }
  
  if (filters?.style) {
    where.style = filters.style;
  }
  
  if (filters?.productType) {
    where.productType = filters.productType;
  }

  const signals = await prisma.trendSignal.findMany({
    where,
    orderBy: {
      confirmationScore: 'desc',
    },
    take: limit * 3, // Prendre plus pour grouper
  });

  // Grouper par type + coupe + matériau
  const trendsMap = new Map<string, TrendSignal>();

  for (const signal of signals) {
    const key = `${signal.productType}|${signal.cut || ''}|${signal.material || ''}`;
    
    if (!trendsMap.has(key)) {
      const countriesList = signal.country ? [signal.country] : [];
      trendsMap.set(key, {
        productName: signal.productName,
        productType: signal.productType,
        cut: signal.cut,
        material: signal.material,
        color: signal.color,
        brands: [signal.brand],
        averagePrice: signal.price,
        confirmationScore: signal.confirmationScore,
        isConfirmed: signal.isConfirmed,
        firstSeenAt: signal.firstSeenAt,
        confirmedAt: signal.confirmedAt,
        country: signal.country,
        countries: countriesList,
        style: signal.style,
        imageUrl: signal.imageUrl ?? undefined,
      });
    } else {
      const existing = trendsMap.get(key)!;
      if (!existing.brands.includes(signal.brand)) {
        existing.brands.push(signal.brand);
      }
      if (signal.country && existing.countries && !existing.countries.includes(signal.country)) {
        existing.countries.push(signal.country);
      }
      if (!existing.imageUrl && signal.imageUrl) {
        existing.imageUrl = signal.imageUrl;
      }
      // Recalculer le prix moyen
      const allSignalsForTrend = signals.filter(s =>
        `${s.productType}|${s.cut || ''}|${s.material || ''}` === key
      );
      existing.averagePrice = allSignalsForTrend.reduce((sum, s) => sum + s.price, 0) / allSignalsForTrend.length;
      existing.confirmationScore = Math.max(existing.confirmationScore, signal.confirmationScore);
    }
  }

  // S'assurer qu'on a une image et un segment pour chaque tendance
  for (const [key, trend] of trendsMap.entries()) {
    if (!trend.imageUrl) {
      const firstWithImage = signals.find(
        (s) => `${s.productType}|${s.cut || ''}|${s.material || ''}` === key && s.imageUrl
      );
      if (firstWithImage?.imageUrl) trend.imageUrl = firstWithImage.imageUrl;
    }
    const groupSignals = signals.filter((s) => `${s.productType}|${s.cut || ''}|${s.material || ''}` === key);
    const segments = groupSignals.map((s) => getSegmentFromUrl(s.sourceUrl)).filter(Boolean) as ('homme' | 'femme' | 'enfant')[];
    const segmentCounts = { femme: 0, homme: 0, enfant: 0 };
    segments.forEach((seg) => { segmentCounts[seg]++; });
    const maxSegment = (['femme', 'homme', 'enfant'] as const).reduce((a, b) =>
      segmentCounts[a] >= segmentCounts[b] ? a : b
    );
    trend.segment = segmentCounts[maxSegment] > 0 ? maxSegment : null;
  }

  let sortedTrends = Array.from(trendsMap.values());
  if (filters?.segment) {
    sortedTrends = sortedTrends.filter((t) => t.segment === filters.segment);
  }
  // Trier : d’abord par segment (femme, homme, enfant), puis par confirmationScore décroissant
  const segmentOrder = { femme: 0, homme: 1, enfant: 2 };
  sortedTrends.sort((a, b) => {
    const segA = a.segment ? segmentOrder[a.segment] : 3;
    const segB = b.segment ? segmentOrder[b.segment] : 3;
    if (segA !== segB) return segA - segB;
    if (a.isConfirmed !== b.isConfirmed) return a.isConfirmed ? -1 : 1;
    return b.confirmationScore - a.confirmationScore;
  });

  // Limiter
  sortedTrends = sortedTrends
    .slice(0, limit);

  return sortedTrends;
}

/**
 * Obtenir les tendances avec une recommandation : à privilégier ou à éviter.
 * "À éviter" = phase déclin ou marché très saturé (5+ marques).
 */
export async function getTrendsWithRecommendation(
  limit: number = 30,
  filters?: {
    country?: string | null;
    style?: string | null;
    productType?: string | null;
    segment?: 'homme' | 'femme' | 'enfant' | null;
  }
): Promise<TrendWithRecommendation[]> {
  const { predictTrends } = await import('@/lib/trend-predictor');

  const [trends, predictions] = await Promise.all([
    getConfirmedTrends(Math.min(limit * 2, 100), filters),
    predictTrends(100),
  ]);

  const phaseByKey = new Map(predictions.map((p) => [p.productKey, p.trendPhase]));

  const withRec: TrendWithRecommendation[] = trends.map((t) => {
    const key = `${t.productType}|${t.cut || ''}|${t.material || ''}`;
    const phase = phaseByKey.get(key);
    const declining = phase === 'declining';
    const saturated = t.confirmationScore >= 5;
    const recommendation: 'recommended' | 'avoid' = declining || saturated ? 'avoid' : 'recommended';
    return { ...t, recommendation };
  });

  // Recommandés en premier, puis à éviter ; dans chaque groupe tri par score décroissant
  withRec.sort((a, b) => {
    if (a.recommendation !== b.recommendation) {
      return a.recommendation === 'recommended' ? -1 : 1;
    }
    return b.confirmationScore - a.confirmationScore;
  });

  return withRec.slice(0, limit * 2);
}
