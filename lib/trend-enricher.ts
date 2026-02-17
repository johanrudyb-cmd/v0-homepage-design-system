/**
 * Enrichissement des tendances après scrape :
 * 1. Infos scrapées → GPT (conseils + note 1-10 + prompt image)
 * 2. Prompt image → Higgsfield (génération image vêtement)
 * 3. Sauvegarde en base (GeneratedProductImage) → affichage dans l'app
 */

import { prisma } from '@/lib/prisma';
import { getTrendsWithRecommendation } from '@/lib/trend-detector';
import type { TrendWithRecommendation } from '@/lib/trend-detector';
import { generateTrendAdviceAndImagePrompt } from '@/lib/api/chatgpt';
import { generateDesignImage, isIdeogramConfigured } from '@/lib/api/ideogram';
import { isChatGptConfigured } from '@/lib/api/chatgpt';

export function buildTrendKey(
  productType: string,
  cut?: string | null,
  material?: string | null
): string {
  return `${productType}|${cut ?? ''}|${material ?? ''}`;
}

/**
 * Enrichit jusqu'à `limit` tendances qui n'ont pas encore advice + rating.
 * Mission : GPT (conseils + note) et utilise l'image réelle du produit si présente.
 */
export async function enrichTrends(limit: number = 10, skipImageGeneration: boolean = true): Promise<{
  enriched: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let enriched = 0;

  if (!isChatGptConfigured()) {
    return { enriched: 0, errors: ['CHATGPT_API_KEY non configurée'] };
  }

  // On ne vérifie l'Ideogram que si on a explicitement besoin de générer des images
  if (!skipImageGeneration && !isIdeogramConfigured()) {
    return { enriched: 0, errors: ['IDEogram_API_KEY non configurée pour la génération'] };
  }

  const trends = await getTrendsWithRecommendation(Math.min(limit * 3, 60), {});
  const trendKeys = trends.map((t) => buildTrendKey(t.productType, t.cut, t.material));
  const existing = await prisma.generatedProductImage.findMany({
    where: { trendKey: { in: trendKeys } },
  });
  const existingByKey = new Map(existing.map((e) => [e.trendKey, e]));

  const toEnrich: TrendWithRecommendation[] = [];
  for (const t of trends) {
    const key = buildTrendKey(t.productType, t.cut, t.material);
    const row = existingByKey.get(key);
    // On enrichit si pas de conseils ou pas de rating
    if (!row || row.adviceText == null) {
      toEnrich.push(t);
      if (toEnrich.length >= limit) break;
    }
  }

  for (const trend of toEnrich) {
    const key = buildTrendKey(trend.productType, trend.cut, trend.material);
    try {
      // 1. Génération des conseils et de la note via GPT
      const { advice, rating, imagePrompt } = await generateTrendAdviceAndImagePrompt({
        productName: trend.productName,
        productType: trend.productType,
        cut: trend.cut,
        material: trend.material,
        color: trend.color,
        style: trend.style,
        brands: trend.brands,
        averagePrice: trend.averagePrice,
        confirmationScore: trend.confirmationScore,
        country: trend.country,
      });

      // 2. Gestion de l'image : on privilégie l'image réelle scrapée
      let imageUrl = trend.imageUrl || '';

      // Si pas d'image réelle et qu'on autorise la génération
      if (!imageUrl && !skipImageGeneration) {
        imageUrl = await generateDesignImage(imagePrompt, { aspect_ratio: '1:1', transparent: false });
      }

      // 3. Sauvegarde
      await prisma.generatedProductImage.upsert({
        where: { trendKey: key },
        create: {
          trendKey: key,
          promptText: imagePrompt,
          imageUrl: imageUrl || '', // On garde l'image réelle
          adviceText: advice,
          rating,
        },
        update: {
          promptText: imagePrompt,
          imageUrl: imageUrl || undefined, // Ne pas écraser par du vide si update
          adviceText: advice,
          rating,
        },
      });
      enriched++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${key}: ${msg}`);
      console.error('[trend-enricher]', key, err);
    }
  }

  return { enriched, errors };
}
