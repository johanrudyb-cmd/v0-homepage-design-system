/**
 * Actualisation hebdomadaire des tendances Zalando, ASOS et Zara.
 * Tous les mardis 12h : suppression des anciennes tendances et remplacement par les nouvelles.
 * Couvre tous les filtres : homme, femme, 18-24, 25-34.
 */

import { getAllSources } from './hybrid-radar-sources';
import { scrapeHybridSource } from './hybrid-radar-scraper';
import { inferCategory } from './infer-trend-category';
import { computeSaturability, computeTrendScore } from './trend-product-kpis';
import { getProductBrand, cleanProductName } from './brand-utils';
import { prisma } from './prisma';
import type { HybridRadarSource } from './hybrid-radar-sources';
import type { HybridScrapedItem } from './hybrid-radar-scraper';

const ACTIVE_CITIES = ['paris', 'berlin', 'milan', 'copenhagen', 'stockholm', 'antwerp', 'zurich', 'london', 'amsterdam', 'warsaw'] as const;
const ACTIVE_HOMME_IDS = ACTIVE_CITIES.map((c) => `zalando-trend-homme-${c}`);
const ACTIVE_FEMME_IDS = ACTIVE_CITIES.map((c) => `zalando-trend-femme-${c}`);

/** Sources actives : ASOS (18-24 + FR), Zara (homme, femme). */
const ACTIVE_SOURCE_IDS = [
  'asos-homme-fr',
  'asos-femme-fr',
  'asos-18-24-homme',
  'asos-18-24-femme',
  'zara-homme-fr',
  'zara-femme-fr',
];


export interface RefreshAllTrendsResult {
  deletedCount: number;
  savedCount: number;
  totalItems: number;
  sourcesCount: number;
  errors: string[];
}

/**
 * Supprime les anciennes tendances pour les sources sélectionnées, scrape et enregistre les nouvelles.
 * Parfait pour un effet "Live" en découpant le scrape par petits morceaux.
 */
export async function refreshAllTrends(sourceLimit?: number, itemLimitPerSource?: number): Promise<RefreshAllTrendsResult> {
  const allSources = getAllSources();
  let sources = allSources.filter(
    (s): s is HybridRadarSource =>
      ACTIVE_SOURCE_IDS.includes(s.id)
  );

  // Si on veut un effet LIVE, on mélange et on prend un échantillon
  if (sourceLimit && sourceLimit < sources.length) {
    sources = sources.sort(() => 0.5 - Math.random()).slice(0, sourceLimit);
    console.log(`[Refresh All Trends] LIVE MODE: Processing specialized sample of ${sources.length} sources (${sources.map(s => s.id).join(', ')})`);
  }

  // 1. On ne supprime que les tendances vraiment vieilles (> 7 jours)
  // pour garder une "profondeur" de courbe et pouvoir regrouper par style.
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const deleted = await prisma.trendProduct.deleteMany({
    where: {
      createdAt: { lt: sevenDaysAgo }
    },
  });
  const deletedCount = deleted.count;
  console.log(`[Refresh All Trends] Nettoyage : ${deletedCount} anciennes tendances (> 7j) supprimées.`);

  const errors: string[] = [];
  let savedCount = 0;
  let totalItems = 0;

  for (const source of sources) {
    try {
      // Si un itemLimitPerSource est spécifié, on écrase la limite du scraper
      const effectiveSource = itemLimitPerSource ? { ...source, limit: itemLimitPerSource } : source;
      const items = await scrapeHybridSource(effectiveSource);
      totalItems += items.length;

      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const item = items[itemIndex] as HybridScrapedItem;
        if (!item.name?.trim()) {
          console.log(`[Refresh All Trends] Item ${itemIndex} skip: no name`);
          continue;
        }

        let sourceUrl = (item.sourceUrl ?? '').trim();
        if (!sourceUrl) {
          console.log(`[Refresh All Trends] Item ${itemIndex} skip: no url (name=${item.name})`);
          continue;
        }
        console.log(`[Refresh All Trends] Processing item ${itemIndex}: ${item.name} (${item.price})`);


        const currentProductBrand = item.productBrand || getProductBrand(item.name, source.brand);
        const cleanName = cleanProductName(item.name, currentProductBrand);
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

        const productBrand = currentProductBrand;
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

        // RÉCUPÉRER L'ANCIEN PRIX SI EXISTE (Pour signal de déstockage)
        const existing = await prisma.trendProduct.findUnique({
          where: { sourceUrl },
          select: { averagePrice: true, trendLabel: true, saturability: true }
        });

        let finalTrendLabel = trendLabel;
        let finalSaturationReason = '';
        let finalSaturability = saturability;

        if (existing && existing.averagePrice > price) {
          // SIGNAL DE DÉSTOCKAGE !!
          finalTrendLabel = 'DÉSTOCKAGE DÉTECTÉ';
          finalSaturationReason = `Baisse de prix détectée : de ${existing.averagePrice}€ à ${price}€ (Signal de saturation)`;
          finalSaturability = Math.min(100, (existing.saturability || 50) + 20);
        }

        // UPSERT LOGIC : Si l'URL existe déjà, on met à jour les chiffres mais on garde l'id et le createdAt
        await prisma.trendProduct.upsert({
          where: { sourceUrl },
          update: {
            averagePrice: price,
            trendScore,
            saturability: finalSaturability,
            trendGrowthPercent,
            trendLabel: finalTrendLabel,
            saturationReason: finalSaturationReason,
          },
          create: {
            name: cleanName,
            category,
            style: '',
            material,
            averagePrice: price,
            trendScore,
            saturability: finalSaturability,
            imageUrl: item.imageUrl ?? null,
            description,
            marketZone: source.marketZone,
            sourceBrand: source.brand,
            sourceUrl,
            segment,
            trendGrowthPercent,
            trendLabel: finalTrendLabel,
            saturationReason: finalSaturationReason,
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
