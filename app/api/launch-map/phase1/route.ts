import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { NotificationHelpers } from '@/lib/notifications';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { brandId, data } = await request.json();

    // Vérifier que la marque appartient à l'utilisateur
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    // Mettre à jour ou créer le LaunchMap (phase2 = Calculatrice)
    const launchMap = await prisma.launchMap.upsert({
      where: { brandId },
      update: {
        phase2: true,
        phase1Data: data,
      },
      create: {
        brandId,
        phase1: false,
        phase2: true,
        phase3: false,
        phase4: false,
        phase5: false,
        phase1Data: data,
      },
    });

    // Créer une notification pour la phase complétée
    await NotificationHelpers.phaseCompleted(user.id, 2, 'Calcul de rentabilité');

    return NextResponse.json({ success: true, launchMap });
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde Phase 1:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
