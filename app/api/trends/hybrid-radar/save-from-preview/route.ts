/**
 * Enregistrer en base les produits d'une prévisualisation (sans re-scraper).
 * POST /api/trends/hybrid-radar/save-from-preview
 * Body: { sourceId, brand, marketZone, segment, items: [{ name, price, imageUrl, sourceUrl, trendGrowthPercent?, trendLabel?, ... }] }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

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
    const brand = body.brand as string | undefined;
    const marketZone = body.marketZone as string | undefined;
    const segment = body.segment as string | undefined;
    const items = Array.isArray(body.items) ? body.items : [];

    if (!sourceId || !brand || !marketZone) {
      return NextResponse.json(
        { error: 'sourceId, brand et marketZone requis' },
        { status: 400 }
      );
    }

    const isValidProductUrl = (url: string) =>
      typeof url === 'string' &&
      url.length > 10 &&
      (url.includes('/p/') || url.includes('.html')) &&
      !url.includes('/trend-spotter/trending-items');

    const seenUrls = new Set<string>();
    let savedCount = 0;
    let skippedNoUrl = 0;
    let skippedInvalidUrl = 0;
    let skippedDuplicate = 0;

    for (const item of items) {
      if (!item.name || !item.name.trim()) continue;
      const rawUrl = item.sourceUrl ?? '';
      if (!rawUrl || !rawUrl.trim()) {
        skippedNoUrl++;
        continue;
      }
      if (!isValidProductUrl(rawUrl)) {
        skippedInvalidUrl++;
        continue;
      }
      const url = rawUrl.trim();
      if (seenUrls.has(url)) {
        skippedDuplicate++;
        continue;
      }
      seenUrls.add(url);
      const category = inferCategory(item.name);
      const material = (item.composition as string) || 'Non spécifié';
      const descParts: string[] = [];
      if (item.composition) descParts.push(`Composition: ${item.composition}`);
      if (item.careInstructions) descParts.push(`Entretien: ${item.careInstructions}`);
      if (item.color) descParts.push(`Couleur: ${item.color}`);
      if (item.sizes) descParts.push(`Tailles: ${item.sizes}`);
      if (item.countryOfOrigin) descParts.push(`Origine: ${item.countryOfOrigin}`);
      if (item.articleNumber) descParts.push(`Ref: ${item.articleNumber}`);
      const description = descParts.length > 0 ? descParts.join('\n') : null;
      const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
      const trendGrowthPercent = item.trendGrowthPercent ?? null;
      const trendLabel = item.trendLabel ?? null;

      const existing = await prisma.trendProduct.findFirst({
        where: {
          sourceUrl: url,
          marketZone,
          sourceBrand: brand,
        },
      });
      if (existing) {
        await prisma.trendProduct.update({
          where: { id: existing.id },
          data: {
            name: String(item.name).slice(0, 500),
            category,
            material,
            averagePrice: price,
            imageUrl: item.imageUrl ?? null,
            description,
            segment: segment ?? null,
            trendGrowthPercent,
            trendLabel,
          },
        });
      } else {
        await prisma.trendProduct.create({
          data: {
            name: String(item.name).slice(0, 500),
            category,
            style: '',
            material,
            averagePrice: price,
            trendScore: 50,
            saturability: 50,
            imageUrl: item.imageUrl ?? null,
            description,
            marketZone,
            sourceBrand: brand,
            sourceUrl: url,
            segment: segment ?? null,
            trendGrowthPercent,
            trendLabel,
            trendScoreVisual: 50,
          },
        });
      }
      savedCount++;
    }

    const skippedTotal = skippedNoUrl + skippedInvalidUrl + skippedDuplicate;
    const message =
      savedCount > 0
        ? `${savedCount} tendance(s) enregistrée(s) pour ${sourceId}.`
        : 'Aucune tendance enregistrée.';
    if (skippedTotal > 0) {
      console.log(
        `[Save From Preview] ${sourceId}: saved=${savedCount}, skipped: noUrl=${skippedNoUrl}, invalidUrl=${skippedInvalidUrl}, duplicate=${skippedDuplicate}`
      );
    }

    return NextResponse.json({
      message,
      savedToTrends: savedCount,
      skipped: skippedTotal > 0 ? { total: skippedTotal, noUrl: skippedNoUrl, invalidUrl: skippedInvalidUrl, duplicate: skippedDuplicate } : undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur';
    console.error('[Save From Preview]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
