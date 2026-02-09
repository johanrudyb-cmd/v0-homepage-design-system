import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { brandId } = await request.json();

    // Vérifier que la marque appartient à l'utilisateur
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    // Vérifier qu'un design existe
    const design = await prisma.design.findFirst({
      where: { brandId, status: 'completed' },
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Aucun design complété trouvé' },
        { status: 400 }
      );
    }

    // Mettre à jour le LaunchMap (phase3 = Design)
    const launchMap = await prisma.launchMap.upsert({
      where: { brandId },
      update: {
        phase3: true,
      },
      create: {
        brandId,
        phase1: false,
        phase2: false,
        phase3: true,
        phase4: false,
        phase5: false,
      },
    });

    return NextResponse.json({ success: true, launchMap });
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde Phase 2:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
