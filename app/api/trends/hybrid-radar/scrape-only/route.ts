/**
 * Scrape uniquement (sans IA).
 * Option saveToTrends: true → enregistre les produits en base (TrendProduct) pour affichage sur la page Tendances.
 *
 * POST /api/trends/hybrid-radar/scrape-only
 * Body: { sourceId?: string, brand?: string, saveToTrends?: boolean }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getAllSources, createSourceFromUrl } from '@/lib/hybrid-radar-sources';
import { scrapeHybridSource } from '@/lib/hybrid-radar-scraper';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const maxDuration = 300;

function inferCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('hoodie') || n.includes('sweat')) return 'Hoodie';
  if (n.includes('t-shirt') || n.includes('tee')) return 'T-shirt';
  if (n.includes('cargo') || n.includes('pantalon') || n.includes('pant')) return 'Cargo';
  if (n.includes('veste') || n.includes('jacket') || n.includes('bomber')) return 'Veste';
  if (n.includes('short')) return 'Short';
  return 'Autre';
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

    let sources: Awaited<ReturnType<typeof getAllSources>>;
    if (customUrl) {
      const fromUrl = createSourceFromUrl(customUrl);
      if (!fromUrl) {
        return NextResponse.json(
          { error: 'URL non reconnue. Utilisez une page Zalando (ex. trend-spotter/paris?gender=MEN).' },
          { status: 400 }
        );
      }
      sources = [fromUrl];
    } else {
      sources = sourceId
        ? getAllSources().filter((s) => s.id === sourceId)
        : getAllSources();
      if (brandFilter) {
        sources = sources.filter((s) => s.brand === brandFilter);
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
          name: i.name,
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
        })),
      });
    }

    let savedCount = 0;
    if (saveToTrends && results.length > 0) {
      for (const source of results) {
        for (const item of source.items) {
          if (!item.name || !item.sourceUrl) continue;
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
          const trendGrowthPercent = item.trendGrowthPercent ?? null;
          const trendLabel = item.trendLabel ?? null;
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
                imageUrl: item.imageUrl,
                description,
                segment,
                trendGrowthPercent,
                trendLabel,
              },
            });
          } else {
            await prisma.trendProduct.create({
              data: {
                name: item.name.slice(0, 500),
                category,
                style: '',
                material,
                averagePrice: price,
                trendScore: 50,
                saturability: 50,
                imageUrl: item.imageUrl,
                description,
                marketZone: source.marketZone,
                sourceBrand: source.brand,
                sourceUrl: item.sourceUrl,
                segment,
                trendGrowthPercent,
                trendLabel,
                trendScoreVisual: 50,
              },
            });
          }
          savedCount++;
        }
      }
      if (savedCount > 0) {
        console.log(`[Scrape Only] ${savedCount} tendances enregistrées en base pour la page Tendances`);
      }
    }

    return NextResponse.json({
      message: saveToTrends && savedCount > 0
        ? `Scrape terminé. ${savedCount} tendance(s) enregistrée(s) — affichées dans Tendances par marché.`
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
