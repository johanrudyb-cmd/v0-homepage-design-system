import { NextResponse } from 'next/server';
import { sanitizeErrorMessage } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { generateVirtualTryOn } from '@/lib/api/higgsfield';
import { prisma } from '@/lib/prisma';
import { NotificationHelpers } from '@/lib/notifications';
import { withAIUsageLimit } from '@/lib/ai-usage';

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

    // Générer le Virtual Try-On avec Higgsfield (limite 1/mois plan base + budget)
    let imageUrl: string;
    try {
      imageUrl = await withAIUsageLimit(
        user.id,
        user.plan ?? 'free',
        'ugc_virtual_tryon',
        () => generateVirtualTryOn(designUrl, garmentType),
        { brandId }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Quota dépassé';
      if (msg.includes('Virtual try-on') || msg.includes('Quota') || msg.includes('épuisé')) {
        return NextResponse.json({ error: msg }, { status: 403 });
      }
      throw err;
    }

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
      { error: sanitizeErrorMessage(error.message || 'Une erreur est survenue lors de la génération') },
      { status: 500 }
    );
  }
}
