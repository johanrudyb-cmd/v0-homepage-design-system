/**
 * Historique des stratégies générées pour une marque.
 * GET ?brandId=xxx → liste des stratégies (plus récentes en premier)
 * Filtre : chaque stratégie reste consultable 1 mois après sa génération.
 * POST body: { brandId, templateBrandSlug, templateBrandName, strategyText, positioning?, targetAudience? } → enregistre une stratégie
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/** Une stratégie reste visible 1 mois à partir de sa date de génération */
const STRATEGY_VISIBILITY_MONTHS = 1;

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId')?.trim();
    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - STRATEGY_VISIBILITY_MONTHS);

    const list = await prisma.strategyGeneration.findMany({
      where: { brandId, createdAt: { gte: cutoff } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        templateBrandSlug: true,
        templateBrandName: true,
        strategyText: true,
        positioning: true,
        targetAudience: true,
        visualIdentity: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ strategies: list });
  } catch (e) {
    console.error('[Strategy History GET]', e);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const brandId = typeof body.brandId === 'string' ? body.brandId.trim() : '';
    const templateBrandSlug = typeof body.templateBrandSlug === 'string' ? body.templateBrandSlug.trim() : '';
    const templateBrandName = typeof body.templateBrandName === 'string' ? body.templateBrandName.trim() : '';
    const strategyText = typeof body.strategyText === 'string' ? body.strategyText : '';
    const positioning = typeof body.positioning === 'string' ? body.positioning.trim() || null : null;
    const targetAudience = typeof body.targetAudience === 'string' ? body.targetAudience.trim() || null : null;
    const visualIdentity = body.visualIdentity && typeof body.visualIdentity === 'object' ? body.visualIdentity : null;

    if (!brandId || !templateBrandSlug || !templateBrandName || !strategyText) {
      return NextResponse.json(
        { error: 'brandId, templateBrandSlug, templateBrandName et strategyText requis' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const created = await prisma.strategyGeneration.create({
      data: {
        brandId,
        templateBrandSlug,
        templateBrandName,
        strategyText,
        positioning,
        targetAudience,
        visualIdentity: visualIdentity ?? undefined,
      },
    });

    // Invalider le cache de fréquence du calendrier : à la prochaine ouverture, la limite sera ré-extraite de la nouvelle stratégie.
    const launchMap = await prisma.launchMap.findUnique({
      where: { brandId },
    });
    if (launchMap?.contentCalendar && typeof launchMap.contentCalendar === 'object' && !Array.isArray(launchMap.contentCalendar)) {
      const cal = launchMap.contentCalendar as Record<string, unknown>;
      if (cal.meta && typeof cal.meta === 'object' && !Array.isArray(cal.meta)) {
        const meta = { ...(cal.meta as Record<string, unknown>) };
        delete meta.contentStrategyFrequency;
        const updated = { ...cal, meta };
        await prisma.launchMap.update({
          where: { brandId },
          data: { contentCalendar: updated as object },
        });
      }
    }

    return NextResponse.json({
      id: created.id,
      createdAt: created.createdAt,
    });
  } catch (e) {
    console.error('[Strategy History POST]', e);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de la stratégie' },
      { status: 500 }
    );
  }
}
