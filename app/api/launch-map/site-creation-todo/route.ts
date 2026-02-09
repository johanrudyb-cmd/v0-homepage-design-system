/**
 * PATCH /api/launch-map/site-creation-todo
 * Met à jour la to-do création du site (cocher / décocher les étapes).
 * Body: { brandId, siteCreationTodo: { steps: { id, label, done }[] } }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const brandId = typeof body.brandId === 'string' ? body.brandId.trim() : '';
    const siteCreationTodo = body.siteCreationTodo;

    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: { launchMap: true },
    });
    if (!brand) return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });

    const steps =
      siteCreationTodo?.steps && Array.isArray(siteCreationTodo.steps)
        ? siteCreationTodo.steps.map(
            (s: { id?: string; label?: string; done?: boolean }) => ({
              id: typeof s.id === 'string' ? s.id : String(s.id),
              label: typeof s.label === 'string' ? s.label : '',
              done: Boolean(s.done),
            })
          )
        : [];

    await prisma.launchMap.upsert({
      where: { brandId },
      update: { siteCreationTodo: { steps } },
      create: { brandId, siteCreationTodo: { steps } },
    });

    return NextResponse.json({ siteCreationTodo: { steps } });
  } catch (e) {
    console.error('[site-creation-todo] PATCH', e);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
