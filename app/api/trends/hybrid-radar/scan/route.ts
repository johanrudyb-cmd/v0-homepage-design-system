/**
 * Trend Radar Hybride (Mondial) - Scan
 * POST /api/trends/hybrid-radar/scan
 *
 * 1. Collecte image + titre + prix (20 produits "New In" par source)
 * 2. Analyse IA (coupe, attributs, score tendance)
 * 3. Stockage TrendProduct avec marketZone
 * 4. Corrélation multi-zones → badge Global Trend Alert
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { sanitizeErrorMessage } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { getAllSources } from '@/lib/hybrid-radar-sources';
import { scrapeHybridSource } from '@/lib/hybrid-radar-scraper';
import { inferCategory } from '@/lib/infer-trend-category';
import { analyzeProductImage, isVisualAnalysisConfigured } from '@/lib/api/chatgpt';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!isVisualAnalysisConfigured()) {
      return NextResponse.json(
        { error: 'Clé API requise pour l’analyse visuelle.' },
        { status: 503 }
      );
    }

    const sources = getAllSources();
    let totalScraped = 0;
    let totalAnalyzed = 0;
    let totalSaved = 0;
    const errors: string[] = [];

    for (const source of sources) {
      try {
        const items = await scrapeHybridSource(source);
        totalScraped += items.length;

        for (const item of items) {
          if (!item.imageUrl) continue;
          try {
            const analysis = await analyzeProductImage(item.imageUrl, item.name);
            const category = inferCategory(item.name);
            const material = (analysis.attributes?.materialVisible as string) || 'Non spécifié';

            const existing = await prisma.trendProduct.findFirst({
              where: {
                marketZone: source.marketZone,
                sourceBrand: source.brand,
                sourceUrl: item.sourceUrl,
              },
            });

            if (existing) {
              await prisma.trendProduct.update({
                where: { id: existing.id },
                data: {
                  averagePrice: item.price,
                  trendScore: analysis.trendScoreVisual,
                  saturability: Math.max(0, 100 - analysis.trendScoreVisual),
                  cut: analysis.cut,
                  visualTags: analysis.attributes as object,
                  trendScoreVisual: analysis.trendScoreVisual,
                  productSignature: analysis.productSignature,
                },
              });
            } else {
              await prisma.trendProduct.create({
                data: {
                  name: item.name,
                  category,
                  style: '',
                  material,
                  averagePrice: item.price,
                  trendScore: analysis.trendScoreVisual,
                  saturability: Math.max(0, 100 - analysis.trendScoreVisual),
                  imageUrl: item.imageUrl,
                  marketZone: source.marketZone,
                  cut: analysis.cut,
                  visualTags: analysis.attributes as object,
                  trendScoreVisual: analysis.trendScoreVisual,
                  productSignature: analysis.productSignature,
                  sourceBrand: source.brand,
                  sourceUrl: item.sourceUrl,
                },
              });
            }
            totalAnalyzed++;
            totalSaved++;
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`${source.brand} - ${item.name.slice(0, 20)}: ${msg}`);
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${source.brand} (${source.marketZone}): ${msg}`);
      }
    }

    // Corrélation : productSignature présent dans 2+ zones → Global Trend Alert
    const signatures = await prisma.trendProduct.findMany({
      where: { marketZone: { not: null }, productSignature: { not: null } },
      select: { productSignature: true, marketZone: true },
    });
    const bySig = new Map<string, Set<string>>();
    for (const row of signatures) {
      const sig = row.productSignature!;
      const zone = row.marketZone!;
      if (!bySig.has(sig)) bySig.set(sig, new Set());
      bySig.get(sig)!.add(zone);
    }
    for (const [sig, zones] of bySig.entries()) {
      if (zones.size >= 2) {
        await prisma.trendProduct.updateMany({
          where: { productSignature: sig },
          data: { isGlobalTrendAlert: true },
        });
      }
    }

    return NextResponse.json({
      message: 'Scan Trend Radar Hybride terminé',
      totalScraped,
      totalAnalyzed,
      totalSaved,
      errors: errors.length > 0 ? errors.slice(0, 20) : undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur lors du scan';
    console.error('[Hybrid Radar Scan]', e);
    return NextResponse.json({ error: sanitizeErrorMessage(message) }, { status: 500 });
  }
}

