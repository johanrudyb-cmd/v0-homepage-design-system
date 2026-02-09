import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/** GET - Liste des fournisseurs favoris de la marque (avec infos usine) */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: brandId } = await params;

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const favorites = await prisma.brandFavoriteFactory.findMany({
      where: { brandId },
      include: { factory: true },
      orderBy: { createdAt: 'desc' },
    });

    const factories = favorites.map((f) => ({
      id: f.factory.id,
      name: f.factory.name,
      country: f.factory.country,
      moq: f.factory.moq,
      leadTime: f.factory.leadTime,
      specialties: f.factory.specialties,
      certifications: f.factory.certifications,
      contactEmail: f.factory.contactEmail,
      contactPhone: f.factory.contactPhone,
      rating: f.factory.rating,
    }));

    return NextResponse.json({ factories, favoriteIds: factories.map((x) => x.id) });
  } catch (error: unknown) {
    console.error('Erreur GET favorite-factories:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

/** POST - Ajouter un fournisseur aux favoris (body: { factoryId }) ou retirer (body: { factoryId, favorite: false }) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: brandId } = await params;
    const body = await request.json();
    const { factoryId, favorite = true } = body;

    if (!factoryId || typeof factoryId !== 'string') {
      return NextResponse.json({ error: 'factoryId requis' }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const factory = await prisma.factory.findUnique({
      where: { id: factoryId },
    });
    if (!factory) {
      return NextResponse.json({ error: 'Usine non trouvée' }, { status: 404 });
    }

    if (favorite) {
      await prisma.brandFavoriteFactory.upsert({
        where: {
          brandId_factoryId: { brandId, factoryId },
        },
        create: { brandId, factoryId },
        update: {},
      });
      return NextResponse.json({ success: true, favorite: true });
    } else {
      await prisma.brandFavoriteFactory.deleteMany({
        where: { brandId, factoryId },
      });
      return NextResponse.json({ success: true, favorite: false });
    }
  } catch (error: unknown) {
    console.error('Erreur POST favorite-factories:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
