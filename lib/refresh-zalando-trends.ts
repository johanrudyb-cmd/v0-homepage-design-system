/**
 * Actualisation hebdomadaire des tendances Zalando (Tendances de la semaine).
 * Scrape toutes les sources Zalando actives (homme + femme) et enregistre en base.
 * Utilisé par le cron /api/cron/refresh-zalando-trends.
 */

import { getAllSources } from '@/lib/hybrid-radar-sources';
import { scrapeHybridSource } from '@/lib/hybrid-radar-scraper';
import { inferCategory } from '@/lib/infer-trend-category';
import { computeSaturability, computeTrendScore } from '@/lib/trend-product-kpis';
import { prisma } from '@/lib/prisma';
import type { HybridRadarSource } from '@/lib/hybrid-radar-sources';
import type { HybridScrapedItem } from '@/lib/hybrid-radar-scraper';

const ACTIVE_CITIES = ['paris', 'berlin', 'milan', 'copenhagen', 'stockholm', 'antwerp', 'zurich', 'london', 'amsterdam', 'warsaw'] as const;
const ACTIVE_HOMME_IDS = ACTIVE_CITIES.map((c) => `zalando-trend-homme-${c}`);
const ACTIVE_FEMME_IDS = ACTIVE_CITIES.map((c) => `zalando-trend-femme-${c}`);

function inferProductBrandFromName(name: string): string | null {
  const first = name.trim().split(/\s+/)[0];
  if (!first || first.length < 2 || first.length > 25) return null;
  const lower = first.toLowerCase();
  const productWords = ['sweat', 'hoodie', 't-shirt', 'tee', 'cargo', 'pantalon', 'veste', 'jacket', 'short', 'pull', 'robe', 'blouson', 'polo', 'jean', 'legging'];
  if (productWords.some((w) => lower.includes(w))) return null;
  if (/^\d+$/.test(first) || /^[a-z]{1,2}$/i.test(first)) return null;
  return first;
}

export interface RefreshZalandoTrendsResult {
  savedCount: number;
  totalItems: number;
  sourcesCount: number;
  errors: string[];
}

/**
 * Scrape toutes les sources Zalando (homme + femme, 10 villes) et enregistre les tendances en base.
 * Les tendances "Tendances de la semaine" s'actualisent ainsi automatiquement.
 */
export async function refreshZalandoTrends(): Promise<RefreshZalandoTrendsResult> {
  const allSources = getAllSources();
  const zalandoSources = allSources.filter(
    (s): s is HybridRadarSource =>
      s.brand === 'Zalando' && (ACTIVE_HOMME_IDS.includes(s.id) || ACTIVE_FEMME_IDS.includes(s.id))
  );

  const errors: string[] = [];
  let savedCount = 0;
  let totalItems = 0;

  for (const source of zalandoSources) {
    try {
      const items = await scrapeHybridSource(source);
      totalItems += items.length;

      for (const item of items as HybridScrapedItem[]) {
        if (!item.name?.trim() || !item.sourceUrl?.trim()) continue;

        const category = inferCategory(item.name);
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
          item.productBrand ?? (source.brand !== 'Zalando' ? source.brand : inferProductBrandFromName(item.name));
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

        const existing = await prisma.trendProduct.findFirst({
          where: {
            sourceUrl: item.sourceUrl,
            marketZone: source.marketZone,
            sourceBrand: source.brand,
          },
        });

        if (existing) {
          await prisma.trendProduct.update({
            where: { id: existing.id },
            data: {
              name: item.name.slice(0, 500),
              category,
              material,
              averagePrice: price,
              imageUrl: item.imageUrl ?? null,
              description,
              segment,
              trendGrowthPercent,
              trendLabel,
              ...scrapedFields,
            },
          });
        } else {
          const saturability = computeSaturability(trendGrowthPercent, trendLabel, 0);
          const trendScore = computeTrendScore(trendGrowthPercent, trendLabel);
          await prisma.trendProduct.create({
            data: {
              name: item.name.slice(0, 500),
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
              sourceUrl: item.sourceUrl,
              segment,
              trendGrowthPercent,
              trendLabel,
              trendScoreVisual: trendScore,
              ...scrapedFields,
            },
          });
        }
        savedCount++;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${source.id}: ${msg}`);
      console.error(`[Refresh Zalando Trends] ${source.id}:`, e);
    }
  }

  if (savedCount > 0) {
    console.log(`[Refresh Zalando Trends] ${savedCount} tendances enregistrées (${zalandoSources.length} sources, ${totalItems} items scrapés)`);
  }

  return {
    savedCount,
    totalItems,
    sourcesCount: zalandoSources.length,
    errors,
  };
}
