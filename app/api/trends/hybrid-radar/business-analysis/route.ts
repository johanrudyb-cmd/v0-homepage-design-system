/**
 * Génère l’analyse business IA pour une tendance (Trend Radar Hybride)
 * POST /api/trends/hybrid-radar/business-analysis
 * Body: { productId: string }
 */

import { NextResponse } from 'next/server';
import { sanitizeErrorMessage } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generateBusinessAnalysisForZones, isChatGptConfigured } from '@/lib/api/chatgpt';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!isChatGptConfigured()) {
      return NextResponse.json(
        { error: 'Clé API requise.' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const productId = body.productId;
    if (!productId) {
      return NextResponse.json(
        { error: 'productId requis' },
        { status: 400 }
      );
    }

    const product = await prisma.trendProduct.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    const sameSignature = await prisma.trendProduct.findMany({
      where: {
        productSignature: product.productSignature,
        marketZone: { not: null },
      },
      select: { marketZone: true, trendScoreVisual: true },
    });

    const zones = [...new Set(sameSignature.map((s) => s.marketZone).filter(Boolean))] as string[];
    const trendScoresByZone: Record<string, number> = {};
    for (const s of sameSignature) {
      if (s.marketZone) {
        trendScoresByZone[s.marketZone] = Math.max(
          trendScoresByZone[s.marketZone] ?? 0,
          s.trendScoreVisual ?? 0
        );
      }
    }

    const analysis = await generateBusinessAnalysisForZones(
      product.name,
      zones,
      trendScoresByZone,
      product.averagePrice
    );

    await prisma.trendProduct.update({
      where: { id: productId },
      data: { businessAnalysis: analysis },
    });

    return NextResponse.json({
      productId,
      businessAnalysis: analysis,
      zones,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur';
    console.error('[Business Analysis]', e);
    return NextResponse.json({ error: sanitizeErrorMessage(message) }, { status: 500 });
  }
}
