import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET - Récupérer une collection avec ses designs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;

    const collection = await prisma.collection.findFirst({
      where: {
        id,
        brand: {
          userId: user.id,
        },
      },
      include: {
        designs: {
          orderBy: { createdAt: 'desc' },
        },
        articles: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
        brand: true,
        _count: {
          select: { designs: true, articles: true },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error: any) {
    console.error('Erreur dans /api/collections/[id] GET:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une collection
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
    const { name, description, coverImage } = body;

    // Vérifier que la collection appartient à l'utilisateur
    const existingCollection = await prisma.collection.findFirst({
      where: {
        id,
        brand: {
          userId: user.id,
        },
      },
    });

    if (!existingCollection) {
      return NextResponse.json(
        { error: 'Collection non trouvée' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (coverImage !== undefined) updateData.coverImage = coverImage || null;

    const updated = await prisma.collection.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { designs: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erreur dans /api/collections/[id] PUT:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que la collection appartient à l'utilisateur
    const collection = await prisma.collection.findFirst({
      where: {
        id,
        brand: {
          userId: user.id,
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection non trouvée' },
        { status: 404 }
      );
    }

    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur dans /api/collections/[id] DELETE:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
