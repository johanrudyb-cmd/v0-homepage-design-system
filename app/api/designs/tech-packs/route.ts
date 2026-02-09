/**
 * GET /api/designs/tech-packs?brandId=xxx
 * Liste les designs avec tech pack pour la marque de l'utilisateur.
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const allDesigns = await prisma.design.findMany({
      where: { brandId },
      orderBy: { updatedAt: 'desc' },
      include: {
        brand: { select: { name: true, logo: true } },
        collection: { select: { id: true, name: true } },
      },
    });

    const filtered = allDesigns.filter((d) => {
      const tp = d.techPack as Record<string, unknown> | null;
      return tp && typeof tp === 'object' && (tp.speedDemon || tp.measurementsTable);
    });

    // Tri par collection : "Sans collection" en premier, puis par nom de collection, puis par date
    const designs = [...filtered].sort((a, b) => {
      const nameA = a.collection?.name ?? '';
      const nameB = b.collection?.name ?? '';
      const cmp = nameA.localeCompare(nameB);
      if (cmp !== 0) return cmp;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return NextResponse.json({ designs });
  } catch (error: unknown) {
    console.error('[designs/tech-packs]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
