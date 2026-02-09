import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { NotificationHelpers } from '@/lib/notifications';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    // Vérifier que la marque appartient à l'utilisateur
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const quotes = await prisma.quote.findMany({
      where: { brandId },
      include: {
        factory: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ quotes });
  } catch (error: any) {
    console.error('Erreur dans /api/quotes GET:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { brandId, factoryId, designId, message } = await request.json();

    // Vérifier que la marque appartient à l'utilisateur
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    // Vérifier que l'usine existe
    const factory = await prisma.factory.findUnique({
      where: { id: factoryId },
    });

    if (!factory) {
      return NextResponse.json({ error: 'Usine non trouvée' }, { status: 404 });
    }

    // Vérifier si un devis existe déjà
    const existingQuote = await prisma.quote.findFirst({
      where: { brandId, factoryId },
    });

    if (existingQuote) {
      return NextResponse.json(
        { error: 'Un devis a déjà été demandé à cette usine' },
        { status: 400 }
      );
    }

    // Créer le devis
    const quote = await prisma.quote.create({
      data: {
        brandId,
        factoryId,
        designId: designId || null,
        message: message || null,
        status: 'sent',
      },
      include: {
        factory: true,
      },
    });

    // Créer une notification pour le devis envoyé
    await NotificationHelpers.quoteSent(user.id, factory.name, quote.id);

    // Vérifier si au moins 2 devis ont été envoyés pour valider Phase 3
    const quoteCount = await prisma.quote.count({
      where: { brandId, status: 'sent' },
    });

    if (quoteCount >= 2) {
      // Marquer la Phase 4 (Sourcing) comme complétée
      await prisma.launchMap.updateMany({
        where: { brandId },
        data: { phase4: true },
      });
      // Notification pour phase complétée
      await NotificationHelpers.phaseCompleted(user.id, 4, 'Contact avec les usines');
    }

    return NextResponse.json({ success: true, quote });
  } catch (error: any) {
    console.error('Erreur dans /api/quotes POST:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
