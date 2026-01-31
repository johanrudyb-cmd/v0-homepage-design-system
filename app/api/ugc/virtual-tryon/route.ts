import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { generateVirtualTryOn } from '@/lib/api/higgsfield';
import { prisma } from '@/lib/prisma';
import { NotificationHelpers } from '@/lib/notifications';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { brandId, designUrl, garmentType } = await request.json();

    // Vérifier que la marque appartient à l'utilisateur
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    // Vérifier les limites selon le plan (Free: 5, Pro: illimité)
    const ugcCount = await prisma.uGCContent.count({
      where: { brandId, type: 'virtual_tryon' },
    });

    if (user.plan === 'free' && ugcCount >= 5) {
      return NextResponse.json(
        { error: 'Limite atteinte. Passez au plan Pro pour générer plus de Virtual Try-On.' },
        { status: 403 }
      );
    }

    // Générer le Virtual Try-On avec Higgsfield
    const imageUrl = await generateVirtualTryOn(designUrl, garmentType);

    // Sauvegarder dans la base de données
    await prisma.uGCContent.create({
      data: {
        brandId,
        type: 'virtual_tryon',
        content: imageUrl,
      },
    });

    // Créer une notification
    await NotificationHelpers.ugcGenerated(user.id, 'virtual_tryon', brandId);

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Erreur lors de la génération Virtual Try-On:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la génération' },
      { status: 500 }
    );
  }
}
