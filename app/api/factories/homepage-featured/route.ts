import { NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/factories/homepage-featured
 * Retourne 3 fournisseurs pour la page d'accueil : un de Chine, un du Portugal, un de Turquie
 */
export async function GET() {
  try {
    // Return empty data gracefully when DATABASE_URL is not configured
    if (!isDatabaseAvailable()) {
      console.warn('[Homepage Featured Factories] DATABASE_URL is not set. Returning empty factories.');
      return NextResponse.json({ factories: [] });
    }

    const [chinaFactory, portugalFactory, turkeyFactory] = await Promise.all([
      prisma.factory.findFirst({
        where: { country: 'China' },
        orderBy: { rating: 'desc' },
      }),
      prisma.factory.findFirst({
        where: { country: 'Portugal' },
        orderBy: { rating: 'desc' },
      }),
      prisma.factory.findFirst({
        where: { country: 'Turkey' },
        orderBy: { rating: 'desc' },
      }),
    ]);

    // Mapper les noms de pays pour l'affichage français
    const factories = [
      chinaFactory ? { ...chinaFactory, country: 'Chine' } : null,
      portugalFactory ? { ...portugalFactory, country: 'Portugal' } : null,
      turkeyFactory ? { ...turkeyFactory, country: 'Turquie' } : null,
    ].filter((f) => f !== null) as any[];

    return NextResponse.json({ factories });
  } catch (error: any) {
    console.error('[Homepage Featured Factories] Erreur:', error);
    return NextResponse.json({ error: 'Une erreur est survenue', factories: [] }, { status: 500 });
  }
}
