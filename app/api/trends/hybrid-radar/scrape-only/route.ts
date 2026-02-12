/**
 * Scrape uniquement (sans IA).
 * Option saveToTrends: true → enregistre les produits en base (TrendProduct) pour affichage sur la page Tendances.
 * Sans sourceId + brand Zalando → 10 sources Homme (Paris, Berlin, Milan, Copenhague, Stockholm, Anvers, Zurich, Londres, Amsterdam, Varsovie).
 *
 * POST /api/trends/hybrid-radar/scrape-only
 * Body: { sourceId?: string, brand?: string, saveToTrends?: boolean }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getAllSources, createSourceFromUrl } from '@/lib/hybrid-radar-sources';
import { scrapeHybridSource } from '@/lib/hybrid-radar-scraper';
import { inferCategory } from '@/lib/infer-trend-category';
import { computeSaturability, computeTrendScore } from '@/lib/trend-product-kpis';
import { cleanProductTitle } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

const ACTIVE_CITIES = ['paris', 'berlin', 'milan', 'copenhagen', 'stockholm', 'antwerp', 'zurich', 'london', 'amsterdam', 'warsaw'] as const;
/** Références actives : 10 villes Homme ou 10 villes Femme. */
const ACTIVE_HOMME_IDS = ACTIVE_CITIES.map((c) => `zalando-trend-homme-${c}`);
const ACTIVE_FEMME_IDS = ACTIVE_CITIES.map((c) => `zalando-trend-femme-${c}`);

export const runtime = 'nodejs';
export const maxDuration = 300;

/** Marque de l'article : premier mot du nom si plausible (ex. "Nike Sweat" → Nike), pour Zalando sans page produit. */
function inferProductBrandFromName(name: string): string | null {
  const first = name.trim().split(/\s+/)[0];
  if (!first || first.length < 2 || first.length > 25) return null;
  const lower = first.toLowerCase();
  const productWords = ['sweat', 'hoodie', 't-shirt', 'tee', 'cargo', 'pantalon', 'veste', 'jacket', 'short', 'pull', 'robe', 'blouson', 'polo', 'pantalon', 'jean', 'legging'];
  if (productWords.some((w) => lower.includes(w))) return null;
  if (/^\d+$/.test(first) || /^[a-z]{1,2}$/i.test(first)) return null;
  return first;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const sourceId = body.sourceId as string | undefined;
    const brandFilter = body.brand as string | undefined;
    const saveToTrends = body.saveToTrends === true;
    const customUrl = typeof body.customUrl === 'string' ? body.customUrl.trim() : undefined;
    const segmentParam = body.segment === 'femme' ? 'femme' : 'homme';

    console.log('[Scrape Only] body:', { sourceId, brand: brandFilter, saveToTrends, customUrl: !!customUrl, segment: segmentParam });

    let sources: Awaited<ReturnType<typeof getAllSources>>;
    if (customUrl) {
      const fromUrl = createSourceFromUrl(customUrl);
      if (!fromUrl) {
        return NextResponse.json(
          { error: 'URL non reconnue. Utilisez une page reconnue (ex. Zalando trend-spotter ou ASOS cat.).' },
          { status: 400 }
        );
      }
      sources = [fromUrl];
    } else {
      sources = sourceId
        ? getAllSources().filter((s) => s.id === sourceId)
        : getAllSources();
      if (!sourceId && brandFilter === 'Zalando') {
        sources = sources.filter((s) => s.brand === 'Zalando');
        const activeIds = segmentParam === 'femme' ? ACTIVE_FEMME_IDS : ACTIVE_HOMME_IDS;
        sources = sources.filter((s) => activeIds.includes(s.id));
      }
    }

    const results: {
      sourceId: string;
      brand: string;
      marketZone: string;
      segment: string | null;
      url: string;
      itemCount: number;
      items: Array<{
        name: string;
        price: number;
        imageUrl: string | null;
        sourceUrl: string;
        trendGrowthPercent?: number | null;
        trendLabel?: string | null;
        composition?: string | null;
        careInstructions?: string | null;
        color?: string | null;
        sizes?: string | null;
        countryOfOrigin?: string | null;
        articleNumber?: string | null;
        productBrand?: string | null;
        markdownPercent?: number | null;
        stockOutRisk?: string | null;
      }>;
    }[] = [];
    let totalItems = 0;

    for (const source of sources) {
      const url = `${source.baseUrl}${source.newInPath}`;
      const items = await scrapeHybridSource(source);
      const withPrice = items.filter((i) => (typeof i.price === 'number' ? i.price : parseFloat(String(i.price)) || 0) > 0).length;
      if (items.length > 0) {
        console.log(`[Scrape Only] ${source.brand}: ${items.length} produits, ${withPrice} avec prix`);
      }
      totalItems += items.length;
      results.push({
        sourceId: source.id,
        brand: source.brand,
        marketZone: source.marketZone,
        segment: source.segment ?? null,
        url,
        itemCount: items.length,
        items: items.map((i) => ({
          name: source.brand === 'ASOS' ? cleanProductTitle(i.name) : i.name,
          price: typeof i.price === 'number' ? i.price : parseFloat(String(i.price)) || 0,
          imageUrl: i.imageUrl,
          sourceUrl: i.sourceUrl,
          trendGrowthPercent: i.trendGrowthPercent ?? null,
          trendLabel: i.trendLabel ?? null,
          composition: i.composition ?? null,
          careInstructions: i.careInstructions ?? null,
          color: i.color ?? null,
          sizes: i.sizes ?? null,
          countryOfOrigin: i.countryOfOrigin ?? null,
          articleNumber: i.articleNumber ?? null,
          productBrand: i.productBrand ?? null,
          markdownPercent: i.markdownPercent ?? null,
          stockOutRisk: i.stockOutRisk ?? null,
        })),
      });
    }

    let savedCount = 0;
    if (saveToTrends && results.length > 0) {
      for (const source of results) {
        // ASOS : remplacer les anciens par les nouveaux (supprimer les produits de cette source pour éviter doublons)
        if (source.brand === 'ASOS') {
          const deleted = await prisma.trendProduct.deleteMany({
            where: {
              sourceBrand: 'ASOS',
              marketZone: source.marketZone ?? 'EU',
              segment: source.segment ?? null,
            },
          });
          if (deleted.count > 0) {
            console.log(`[Scrape Only] ASOS: ${deleted.count} ancien(s) produit(s) supprimé(s) avant enregistrement`);
          }
        }
        for (let itemIndex = 0; itemIndex < source.items.length; itemIndex++) {
          const item = source.items[itemIndex];
          let itemSourceUrl = (item.sourceUrl ?? '').trim();
          // ASOS : toujours une URL synthétique unique par article (on ne s'appuie jamais sur l'URL du scraper)
          if (source.brand === 'ASOS') {
            itemSourceUrl = item.name
              ? `https://www.asos.com/preview/${encodeURIComponent(String(item.name).slice(0, 80))}-${itemIndex}`
              : '';
          }
          if (!item.name || !String(item.name).trim() || !itemSourceUrl) continue;
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
          // Pour que les produits Trend Spotter s'affichent dans "Tendances femmes", ils doivent avoir trendGrowthPercent ou trendLabel
          if (source.sourceId.startsWith('zalando-trend-') && trendGrowthPercent == null && (trendLabel == null || String(trendLabel).trim() === '')) {
            trendLabel = 'Tendance';
          }
          const existing = await prisma.trendProduct.findFirst({
            where: {
              sourceUrl: itemSourceUrl,
              marketZone: source.marketZone,
              sourceBrand: source.brand,
            },
          });
          // Marque de l'article : extraite sur la page (Zalando/ASOS) ou = source pour Zara, jamais "Zalando" ni "ASOS" comme marque article
          const productBrand =
            item.productBrand ??
            (source.brand !== 'Zalando' && source.brand !== 'ASOS' ? source.brand : inferProductBrandFromName(item.name));
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
          const cleanName = cleanProductTitle(item.name);
          if (existing) {
            await prisma.trendProduct.update({
              where: { id: existing.id },
              data: {
                name: cleanName,
                category,
                material,
                averagePrice: price,
                imageUrl: item.imageUrl,
                description,
                segment,
                trendGrowthPercent,
                trendLabel,
                ...scrapedFields,
              },
            });
          } else {
            const daysInRadar = 0; // nouveau produit
            const saturability = computeSaturability(trendGrowthPercent, trendLabel, daysInRadar);
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
                imageUrl: item.imageUrl,
                description,
                marketZone: source.marketZone,
                sourceBrand: source.brand,
                sourceUrl: itemSourceUrl,
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
      }
      console.log('[Scrape Only] savedCount=', savedCount, 'after saveToTrends loop');
      if (savedCount > 0) {
        console.log(`[Scrape Only] ${savedCount} tendances enregistrées en base pour la page Tendances`);
      }
    }

    return NextResponse.json({
      message: saveToTrends && savedCount > 0
        ? `Scrape terminé. ${savedCount} tendance(s) enregistrée(s) — affichées dans Tendances de la semaine.`
        : 'Scrape terminé (aucune IA)' + (saveToTrends ? ', aucune nouvelle tendance à enregistrer.' : ''),
      totalItems,
      savedToTrends: saveToTrends ? savedCount : undefined,
      results,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur';
    console.error('[Scrape Only]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
