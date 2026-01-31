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
import { generateProductImage, isHiggsfieldConfigured } from '@/lib/api/higgsfield';
import { isChatGptConfigured } from '@/lib/api/chatgpt';

export function buildTrendKey(
  productType: string,
  cut?: string | null,
  material?: string | null
): string {
  return `${productType}|${cut ?? ''}|${material ?? ''}`;
}

/**
 * Enrichit jusqu'à `limit` tendances qui n'ont pas encore advice + rating + image.
 * Pour chaque tendance : GPT (conseils + note + prompt image) → Higgsfield (image) → sauvegarde.
 */
export async function enrichTrends(limit: number = 10): Promise<{
  enriched: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let enriched = 0;

  if (!isChatGptConfigured()) {
    return { enriched: 0, errors: ['CHATGPT_API_KEY non configurée'] };
  }
  if (!isHiggsfieldConfigured()) {
    return { enriched: 0, errors: ['HIGGSFIELD_API_KEY non configurée'] };
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
    if (!row || row.adviceText == null) {
      toEnrich.push(t);
      if (toEnrich.length >= limit) break;
    }
  }

  for (const trend of toEnrich) {
    const key = buildTrendKey(trend.productType, trend.cut, trend.material);
    try {
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

      const imageUrl = await generateProductImage(imagePrompt, { aspect_ratio: '1:1' });

      await prisma.generatedProductImage.upsert({
        where: { trendKey: key },
        create: {
          trendKey: key,
          promptText: imagePrompt,
          imageUrl,
          adviceText: advice,
          rating,
        },
        update: {
          promptText: imagePrompt,
          imageUrl,
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
