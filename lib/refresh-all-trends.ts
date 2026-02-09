/**
 * Actualisation hebdomadaire des tendances Zalando, ASOS et Zara.
 * Tous les mardis 12h : suppression des anciennes tendances et remplacement par les nouvelles.
 * Couvre tous les filtres : homme, femme, 18-24, 25-34.
 */

import { getAllSources } from '@/lib/hybrid-radar-sources';
import { scrapeHybridSource } from '@/lib/hybrid-radar-scraper';
import { inferCategory } from '@/lib/infer-trend-category';
import { computeSaturability, computeTrendScore } from '@/lib/trend-product-kpis';
import { cleanProductTitle } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import type { HybridRadarSource } from '@/lib/hybrid-radar-sources';
import type { HybridScrapedItem } from '@/lib/hybrid-radar-scraper';

const ACTIVE_CITIES = ['paris', 'berlin', 'milan', 'copenhagen', 'stockholm', 'antwerp', 'zurich', 'london', 'amsterdam', 'warsaw'] as const;
const ACTIVE_HOMME_IDS = ACTIVE_CITIES.map((c) => `zalando-trend-homme-${c}`);
const ACTIVE_FEMME_IDS = ACTIVE_CITIES.map((c) => `zalando-trend-femme-${c}`);

/** Sources actives : Zalando (25-34), ASOS (18-24 + FR), Zara (homme, kids). */
const ACTIVE_SOURCE_IDS = [
  ...ACTIVE_HOMME_IDS,
  ...ACTIVE_FEMME_IDS,
  'asos-homme-fr',
  'asos-femme-fr',
  'asos-18-24-homme',
  'asos-18-24-femme',
  'zara-homme-fr',
  'zara-kids-garcon-fr',
  'zara-kids-fille-fr',
];

function inferProductBrandFromName(name: string): string | null {
  const first = name.trim().split(/\s+/)[0];
  if (!first || first.length < 2 || first.length > 25) return null;
  const lower = first.toLowerCase();
  const productWords = ['sweat', 'hoodie', 't-shirt', 'tee', 'cargo', 'pantalon', 'veste', 'jacket', 'short', 'pull', 'robe', 'blouson', 'polo', 'jean', 'legging'];
  if (productWords.some((w) => lower.includes(w))) return null;
  if (/^\d+$/.test(first) || /^[a-z]{1,2}$/i.test(first)) return null;
  return first;
}

export interface RefreshAllTrendsResult {
  deletedCount: number;
  savedCount: number;
  totalItems: number;
  sourcesCount: number;
  errors: string[];
}

/**
 * Supprime toutes les tendances Zalando, ASOS, Zara puis scrape et enregistre les nouvelles.
 * Couvre : homme, femme, 18-24 (ASOS), 25-34 (Zalando + Zara).
 */
export async function refreshAllTrends(): Promise<RefreshAllTrendsResult> {
  const allSources = getAllSources();
  const sources = allSources.filter(
    (s): s is HybridRadarSource =>
      ACTIVE_SOURCE_IDS.includes(s.id)
  );

  // 1. Supprimer toutes les anciennes tendances (Zalando, ASOS, Zara)
  const deleted = await prisma.trendProduct.deleteMany({
    where: {
      sourceBrand: { in: ['Zalando', 'ASOS', 'Zara'] },
    },
  });
  const deletedCount = deleted.count;
  console.log(`[Refresh All Trends] ${deletedCount} ancienne(s) tendance(s) supprimée(s)`);

  const errors: string[] = [];
  let savedCount = 0;
  let totalItems = 0;

  for (const source of sources) {
    try {
      const items = await scrapeHybridSource(source);
      totalItems += items.length;

      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const item = items[itemIndex] as HybridScrapedItem;
        if (!item.name?.trim()) continue;

        let sourceUrl = (item.sourceUrl ?? '').trim();
        if (source.brand === 'ASOS') {
          sourceUrl = `https://www.asos.com/preview/${encodeURIComponent(String(item.name).slice(0, 80))}-${itemIndex}`;
        }
        if (!sourceUrl) continue;

        const cleanName = source.brand === 'ASOS' ? cleanProductTitle(item.name) : item.name.slice(0, 500);
        const category = inferCategory(cleanName);
        const material = item.composition || 'Non spécifié';
        const descParts: string[] = [];
        if (item.composition) descParts.push(`Composition: ${item.composition}`);
        if (item.careInstructions) descParts.push(`Entretien: ${item.careInstructions}`);
        if (item.color) descParts.push(`Couleur: ${item.color}`);
        if (item.sizes) descParts.push(`Tailles: ${item.sizes}`);
        if (item.countryOfOrigin) descParts.push(`Origine: ${item.countryOfOrigin}`);
        if (item.articleNumber) descParts.push(`Ref: ${item.articleNumber}`);
        const description = descParts.length > 0 ? descParts.join('\n') : null;
        const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;

        const segment = source.segment ?? null;
        let trendGrowthPercent = item.trendGrowthPercent ?? null;
        let trendLabel = item.trendLabel ?? null;
        if (source.id.startsWith('zalando-trend-') && trendGrowthPercent == null && (trendLabel == null || String(trendLabel).trim() === '')) {
          trendLabel = 'Tendance';
        }

        const productBrand =
          item.productBrand ?? (source.brand !== 'Zalando' && source.brand !== 'ASOS' ? source.brand : inferProductBrandFromName(cleanName));
        const scrapedFields = {
          color: item.color ?? null,
          sizes: item.sizes ?? null,
          countryOfOrigin: item.countryOfOrigin ?? null,
          articleNumber: item.articleNumber ?? null,
          careInstructions: item.careInstructions ?? null,
          markdownPercent: item.markdownPercent ?? null,
          stockOutRisk: item.stockOutRisk ?? null,
          productBrand: productBrand ?? null,
        };

        const saturability = computeSaturability(trendGrowthPercent, trendLabel, 0);
        const trendScore = computeTrendScore(trendGrowthPercent, trendLabel);

        await prisma.trendProduct.create({
          data: {
            name: cleanName,
            category,
            style: '',
            material,
            averagePrice: price,
            trendScore,
            saturability,
            imageUrl: item.imageUrl ?? null,
            description,
            marketZone: source.marketZone,
            sourceBrand: source.brand,
            sourceUrl,
            segment,
            trendGrowthPercent,
            trendLabel,
            trendScoreVisual: trendScore,
            ...scrapedFields,
          },
        });
        savedCount++;
      }

      if (items.length > 0) {
        console.log(`[Refresh All Trends] ${source.id}: ${items.length} produits enregistrés`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${source.id}: ${msg}`);
      console.error(`[Refresh All Trends] ${source.id}:`, e);
    }
  }

  if (savedCount > 0) {
    console.log(`[Refresh All Trends] ${savedCount} tendances enregistrées (${sources.length} sources, ${totalItems} items scrapés)`);
  }

  return {
    deletedCount,
    savedCount,
    totalItems,
    sourcesCount: sources.length,
    errors,
  };
}
