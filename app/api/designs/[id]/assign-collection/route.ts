import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// PUT - Assigner un design à une collection (ou le retirer)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { collectionId } = body; // null pour retirer de la collection

    // Vérifier que le design appartient à l'utilisateur
    const design = await prisma.design.findFirst({
      where: {
        id,
        brand: {
          userId: user.id,
        },
      },
      include: { brand: true },
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design non trouvé' },
        { status: 404 }
      );
    }

    // Si collectionId fourni, vérifier qu'elle appartient à la même marque
    if (collectionId) {
      const collection = await prisma.collection.findFirst({
        where: {
          id: collectionId,
          brandId: design.brandId,
        },
      });

      if (!collection) {
        return NextResponse.json(
          { error: 'Collection non trouvée ou n\'appartient pas à la même marque' },
          { status: 404 }
        );
      }
    }

    const updated = await prisma.design.update({
      where: { id },
      data: {
        collectionId: collectionId || null,
      },
      include: {
        collection: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erreur dans /api/designs/[id]/assign-collection PUT:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
