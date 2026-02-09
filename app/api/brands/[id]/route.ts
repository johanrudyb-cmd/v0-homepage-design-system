import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// GET - Récupérer une marque avec son identité
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

    const brand = await prisma.brand.findFirst({
      where: { id, userId: user.id },
      include: {
        designs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        launchMap: true,
        _count: {
          select: {
            designs: true,
            ugcContents: true,
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Marque non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la marque' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour l'identité d'une marque
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

    // Vérifier que la marque appartient à l'utilisateur
    const existingBrand = await prisma.brand.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: 'Marque non trouvée' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Mettre à jour les champs d'identité
    if (body.name !== undefined) {
      updateData.name = body.name.trim();
    }
    if (body.logo !== undefined) {
      updateData.logo = body.logo || null;
    }
    if (body.logoVariations !== undefined) {
      updateData.logoVariations = body.logoVariations;
    }
    if (body.colorPalette !== undefined) {
      updateData.colorPalette = body.colorPalette;
    }
    if (body.typography !== undefined) {
      updateData.typography = body.typography;
    }
    if (body.styleGuide !== undefined) {
      updateData.styleGuide = body.styleGuide;
    }
    if (body.domain !== undefined) {
      updateData.domain = body.domain || null;
    }
    if (body.socialHandles !== undefined) {
      updateData.socialHandles = body.socialHandles;
    }
    if (body.templateBrandSlug !== undefined) {
      updateData.templateBrandSlug = typeof body.templateBrandSlug === 'string' ? body.templateBrandSlug.trim() || null : null;
    }
    if (body.creationMode !== undefined) {
      updateData.creationMode = body.creationMode;
    }
    if (body.autoApplyIdentity !== undefined) {
      updateData.autoApplyIdentity = body.autoApplyIdentity;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    const updated = await prisma.brand.update({
      where: { id },
      data: updateData,
      include: {
        launchMap: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la marque' },
      { status: 500 }
    );
  }
}
