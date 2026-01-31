import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les préférences de l'utilisateur
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });

    // Si pas de préférences, créer des préférences par défaut
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: user.id,
          preferredCountry: 'France',
          preferredCountries: ['France'],
          preferredCategories: [],
          preferredStyles: [],
          preferredSourcingCountries: [],
          preferredMarkets: [],
          language: 'fr',
          currency: 'EUR',
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les préférences
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();

    // Mettre à jour ou créer les préférences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        preferredCountry: body.preferredCountry,
        preferredCountries: body.preferredCountries || [],
        preferredCategories: body.preferredCategories || [],
        preferredStyles: body.preferredStyles || [],
        priceRangeMin: body.priceRangeMin,
        priceRangeMax: body.priceRangeMax,
        preferredSourcingCountries: body.preferredSourcingCountries || [],
        preferredMOQ: body.preferredMOQ,
        maxLeadTime: body.maxLeadTime,
        preferredMarkets: body.preferredMarkets || [],
        language: body.language || 'fr',
        currency: body.currency || 'EUR',
        timezone: body.timezone,
      },
      create: {
        userId: user.id,
        preferredCountry: body.preferredCountry || 'France',
        preferredCountries: body.preferredCountries || ['France'],
        preferredCategories: body.preferredCategories || [],
        preferredStyles: body.preferredStyles || [],
        priceRangeMin: body.priceRangeMin,
        priceRangeMax: body.priceRangeMax,
        preferredSourcingCountries: body.preferredSourcingCountries || [],
        preferredMOQ: body.preferredMOQ,
        maxLeadTime: body.maxLeadTime,
        preferredMarkets: body.preferredMarkets || [],
        language: body.language || 'fr',
        currency: body.currency || 'EUR',
        timezone: body.timezone,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
