/**
 * Historique des designs générés (phase Design) — conservés 7 jours.
 * GET ?brandId=xxx → liste des brouillons (plus récents en premier)
 * POST body: { brandId, imageUrl, placement?, source? } → enregistre un brouillon
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const RETENTION_DAYS = 7;

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

    const since = new Date();
    since.setDate(since.getDate() - RETENTION_DAYS);

    const drafts = await prisma.launchMapDesignDraft.findMany({
      where: { brandId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ drafts });
  } catch (e) {
    console.error('[launch-map/design/history GET]', e);
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
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
    const placement = typeof body.placement === 'string' ? body.placement.trim() || null : null;
    const source = typeof body.source === 'string' && /^(ai|logo_only|logo_plus_ai)$/.test(body.source) ? body.source : null;

    if (!brandId || !imageUrl) {
      return NextResponse.json(
        { error: 'brandId et imageUrl requis' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    await prisma.launchMapDesignDraft.create({
      data: { brandId, imageUrl, placement, source },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[launch-map/design/history POST]', e);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement' },
      { status: 500 }
    );
  }
}
