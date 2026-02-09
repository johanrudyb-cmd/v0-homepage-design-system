import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET - Récupérer un design
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

    const design = await prisma.design.findFirst({
      where: {
        id,
        brand: {
          userId: user.id,
        },
      },
      include: {
        brand: true,
        collection: true,
      },
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(design);
  } catch (error: any) {
    console.error('Erreur dans /api/designs/[id] GET:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un design
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
    const { isTemplate, templateName, collectionId } = body;

    // Vérifier que le design appartient à l'utilisateur
    const existingDesign = await prisma.design.findFirst({
      where: {
        id,
        brand: {
          userId: user.id,
        },
      },
    });

    if (!existingDesign) {
      return NextResponse.json(
        { error: 'Design non trouvé' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (isTemplate !== undefined) updateData.isTemplate = isTemplate;
    if (templateName !== undefined) updateData.templateName = templateName?.trim() || null;
    if (collectionId !== undefined) updateData.collectionId = collectionId || null;

    const updated = await prisma.design.update({
      where: { id },
      data: updateData,
      include: {
        collection: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erreur dans /api/designs/[id] PUT:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un design
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

    const design = await prisma.design.findFirst({
      where: {
        id,
        brand: {
          userId: user.id,
        },
      },
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design non trouvé' },
        { status: 404 }
      );
    }

    await prisma.design.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur dans /api/designs/[id] DELETE:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
