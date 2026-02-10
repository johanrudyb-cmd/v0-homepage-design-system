/**
 * PATCH /api/launch-map/summaries
 * Body: { brandId: string, phaseSummaries: Record<string, string> }
 * Met à jour les résumés modifiables des phases (phaseSummaries sur LaunchMap).
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const brandId = typeof body.brandId === 'string' ? body.brandId.trim() : '';
    const phaseSummaries = body.phaseSummaries;

    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: { launchMap: true },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const summaries =
      phaseSummaries && typeof phaseSummaries === 'object' && !Array.isArray(phaseSummaries)
        ? (phaseSummaries as Record<string, string>)
        : undefined;

    const launchMap = await prisma.launchMap.upsert({
      where: { brandId },
      update: summaries !== undefined ? { phaseSummaries: summaries } : {},
      create: {
        brandId,
        phase1: false,
        phase2: false,
        phase3: false,
        phase4: false,
        phase5: false,
        phaseSummaries: summaries ?? undefined,
      },
      include: { brand: true },
    });

    return NextResponse.json({ success: true, launchMap });
  } catch (e) {
    console.error('[launch-map/summaries PATCH]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}
