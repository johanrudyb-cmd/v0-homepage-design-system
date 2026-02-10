/**
 * POST /api/launch-map/regenerate-site-todo
 * Régénère la to-do création du site à partir de la stratégie web de la marque.
 * Body: { brandId }
 */

import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generateSiteCreationTodo } from '@/lib/api/claude';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const brandId = typeof body.brandId === 'string' ? body.brandId.trim() : '';

    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: { launchMap: true },
    });
    if (!brand) return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });

    const latestStrategy = await prisma.strategyGeneration.findFirst({
      where: { brandId },
      orderBy: { createdAt: 'desc' },
    });
    if (!latestStrategy?.strategyText) {
      return NextResponse.json(
        { error: 'Aucune stratégie trouvée pour cette marque. Appliquez une stratégie en Phase 1.' },
        { status: 400 }
      );
    }

    const steps = await generateSiteCreationTodo(brand.name, latestStrategy.strategyText);
    const siteCreationTodo = { steps } as unknown as Prisma.InputJsonValue;

    await prisma.launchMap.upsert({
      where: { brandId },
      update: { siteCreationTodo },
      create: { brandId, siteCreationTodo },
    });

    return NextResponse.json({ siteCreationTodo });
  } catch (e) {
    console.error('[regenerate-site-todo]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur lors de la régénération' },
      { status: 500 }
    );
  }
}
