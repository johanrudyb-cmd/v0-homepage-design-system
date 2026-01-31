import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET - Récupérer les reviews d'une usine
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reviews = await prisma.factoryReview.findMany({
      where: { factoryId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculer la note moyenne
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    return NextResponse.json({
      reviews,
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
      totalReviews: reviews.length,
    });
  } catch (error: any) {
    console.error('Erreur dans /api/factories/[id]/reviews GET:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour une review
export async function POST(
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
    const { rating, comment, photos } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La note doit être entre 1 et 5' },
        { status: 400 }
      );
    }

    // Vérifier que l'usine existe
    const factory = await prisma.factory.findUnique({
      where: { id },
    });

    if (!factory) {
      return NextResponse.json(
        { error: 'Usine non trouvée' },
        { status: 404 }
      );
    }

    // Créer ou mettre à jour la review (upsert)
    const review = await prisma.factoryReview.upsert({
      where: {
        userId_factoryId: {
          userId: user.id,
          factoryId: id,
        },
      },
      update: {
        rating,
        comment: comment?.trim() || null,
        photos: photos || [],
      },
      create: {
        userId: user.id,
        factoryId: id,
        rating,
        comment: comment?.trim() || null,
        photos: photos || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Recalculer la note moyenne de l'usine
    const allReviews = await prisma.factoryReview.findMany({
      where: { factoryId: id },
      select: { rating: true },
    });

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : null;

    // Mettre à jour la note de l'usine
    await prisma.factory.update({
      where: { id },
      data: { rating: averageRating },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur dans /api/factories/[id]/reviews POST:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
