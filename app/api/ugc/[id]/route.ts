import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET - Récupérer un contenu UGC
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

    const content = await prisma.uGCContent.findFirst({
      where: {
        id,
        brand: {
          userId: user.id,
        },
      },
      include: {
        brand: true,
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Contenu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Erreur dans /api/ugc/[id] GET:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un contenu UGC (pour éditer un script)
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
    const { content } = body;

    // Vérifier que le contenu appartient à l'utilisateur
    const existing = await prisma.uGCContent.findFirst({
      where: {
        id,
        brand: {
          userId: user.id,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contenu non trouvé' },
        { status: 404 }
      );
    }

    // Seuls les scripts peuvent être édités
    if (existing.type !== 'script') {
      return NextResponse.json(
        { error: 'Seuls les scripts peuvent être édités' },
        { status: 400 }
      );
    }

    const updated = await prisma.uGCContent.update({
      where: { id },
      data: { content },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erreur dans /api/ugc/[id] PUT:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un contenu UGC
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

    // Vérifier que le contenu appartient à l'utilisateur
    const existing = await prisma.uGCContent.findFirst({
      where: {
        id,
        brand: {
          userId: user.id,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contenu non trouvé' },
        { status: 404 }
      );
    }

    await prisma.uGCContent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur dans /api/ugc/[id] DELETE:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
