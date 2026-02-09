import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/** GET - Liste des articles du fichier (collection) : designs déjà inclus dans collection, + articles calculatrice / UGC */
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
        brand: { userId: user.id },
      },
      include: {
        designs: { orderBy: { createdAt: 'desc' } },
        articles: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
      },
      designs: collection.designs,
      articles: collection.articles,
    });
  } catch (error: unknown) {
    console.error('Erreur dans /api/collections/[id]/articles GET:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

/** POST - Ajouter un article au fichier (calculatrice = rentabilité, ou ugc = script) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: collectionId } = await params;
    const body = await request.json();
    const { type, label, payload } = body;

    if (!type || !['calculator', 'ugc'].includes(type)) {
      return NextResponse.json(
        { error: 'type requis : "calculator" ou "ugc"' },
        { status: 400 }
      );
    }

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        { error: 'payload (objet) requis' },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        brand: { userId: user.id },
      },
      include: { _count: { select: { articles: true } } },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection non trouvée' }, { status: 404 });
    }

    const sortOrder = (collection._count?.articles ?? 0);

    const article = await prisma.collectionArticle.create({
      data: {
        collectionId,
        type,
        label: typeof label === 'string' ? label.trim() || null : null,
        sortOrder,
        payload,
      },
    });

    return NextResponse.json({ success: true, article }, { status: 201 });
  } catch (error: unknown) {
    console.error('Erreur dans /api/collections/[id]/articles POST:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
