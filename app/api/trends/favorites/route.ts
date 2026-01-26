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

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'productId requis' }, { status: 400 });
    }

    // Vérifier que le produit existe
    const product = await prisma.trendProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    // Créer ou mettre à jour le favori
    await prisma.productFavorite.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      create: {
        userId: user.id,
        productId,
      },
      update: {},
    });

    return NextResponse.json({ message: 'Produit ajouté aux favoris' });
  } catch (error: any) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'productId requis' }, { status: 400 });
    }

    await prisma.productFavorite.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    });

    return NextResponse.json({ message: 'Produit retiré des favoris' });
  } catch (error: any) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
