/**
 * PATCH /api/trends/products/[id]
 * Met à jour les indicateurs de tendance (pourcentage, libellé) et recalcule score + saturabilité.
 * Body: { trendGrowthPercent?: number | null, trendLabel?: string | null }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { computeSaturability, computeTrendScore } from '@/lib/trend-product-kpis';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const trendGrowthPercent =
      body.trendGrowthPercent === undefined
        ? undefined
        : body.trendGrowthPercent === null
          ? null
          : typeof body.trendGrowthPercent === 'number'
            ? body.trendGrowthPercent
            : parseInt(String(body.trendGrowthPercent), 10);
    const trendLabel =
      body.trendLabel === undefined
        ? undefined
        : body.trendLabel === null || body.trendLabel === ''
          ? null
          : String(body.trendLabel).trim().slice(0, 100) || null;

    const product = await prisma.trendProduct.findUnique({
      where: { id },
    });
    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    const updates: {
      trendGrowthPercent?: number | null;
      trendLabel?: string | null;
      trendScore?: number;
      trendScoreVisual?: number;
      saturability?: number;
    } = {};

    if (trendGrowthPercent !== undefined) {
      const value =
        trendGrowthPercent === null
          ? null
          : Math.min(999, Math.max(0, Math.round(trendGrowthPercent)));
      updates.trendGrowthPercent = value;
    }
    if (trendLabel !== undefined) updates.trendLabel = trendLabel;

    const finalGrowth =
      updates.trendGrowthPercent !== undefined
        ? updates.trendGrowthPercent
        : product.trendGrowthPercent;
    const finalLabel =
      updates.trendLabel !== undefined ? updates.trendLabel : product.trendLabel;

    const trendScore = computeTrendScore(finalGrowth ?? null, finalLabel ?? null);
    const daysInRadar = Math.floor(
      (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const saturability = computeSaturability(
      finalGrowth ?? null,
      finalLabel ?? null,
      daysInRadar
    );

    updates.trendScore = trendScore;
    updates.trendScoreVisual = trendScore;
    updates.saturability = saturability;

    await prisma.trendProduct.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      trendGrowthPercent: finalGrowth,
      trendLabel: finalLabel,
      trendScore,
      saturability,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur';
    console.error('[PATCH /api/trends/products/[id]]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
