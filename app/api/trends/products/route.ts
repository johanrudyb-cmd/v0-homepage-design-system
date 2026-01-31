import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const style = searchParams.get('style') || '';
    const material = searchParams.get('material') || '';
    const sortBy = searchParams.get('sortBy') || 'saturability';

    // Récupérer les préférences utilisateur si connecté
    let preferences = null;
    try {
      const user = await getCurrentUser();
      if (user) {
        preferences = await prisma.userPreferences.findUnique({
          where: { userId: user.id },
        });
      }
    } catch (error) {
      // Ignorer les erreurs d'authentification
    }

    // Construire les filtres avec préférences intelligentes
    const where: any = {};
    
    // Utiliser les préférences si aucun filtre n'est spécifié
    if (category) {
      where.category = category;
    } else if (preferences?.preferredCategories && preferences.preferredCategories.length > 0) {
      where.category = { in: preferences.preferredCategories };
    }
    
    if (style) {
      where.style = style;
    } else if (preferences?.preferredStyles && preferences.preferredStyles.length > 0) {
      where.style = { in: preferences.preferredStyles };
    }
    
    if (material) where.material = material;
    
    // Filtrer par prix si préférences définies
    if (preferences?.priceRangeMin || preferences?.priceRangeMax) {
      where.averagePrice = {};
      if (preferences.priceRangeMin) where.averagePrice.gte = preferences.priceRangeMin;
      if (preferences.priceRangeMax) where.averagePrice.lte = preferences.priceRangeMax;
    }

    // Construire le tri
    let orderBy: any = {};
    if (sortBy === 'saturability') {
      orderBy = { saturability: 'asc' }; // Moins saturé en premier
    } else if (sortBy === 'trendScore') {
      orderBy = { trendScore: 'desc' }; // Plus tendance en premier
    } else if (sortBy === 'price') {
      orderBy = { averagePrice: 'asc' }; // Prix croissant
    }

    const products = await prisma.trendProduct.findMany({
      where,
      orderBy,
      take: 50, // Limiter à 50 produits
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
