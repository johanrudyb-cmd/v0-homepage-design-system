import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * ⚠️ IMPORTANT : Route de seed pour données de DÉMONSTRATION uniquement
 * Les usines créées sont FICTIVES et servent uniquement à tester les fonctionnalités.
 */

// Données des usines à seed
const factories = [
  // PORTUGAL
  {
    name: 'Textile Portugal Premium',
    country: 'Portugal',
    moq: 100,
    specialties: ['Jersey', 'Coton GSM élevé', 'Tricot'],
    leadTime: 30,
    certifications: ['OEKO-TEX', 'GOTS'],
    contactEmail: 'contact@textileportugal.pt',
    contactPhone: '+351 21 123 4567',
    rating: 4.8,
  },
  {
    name: 'Moda Lisboa Manufacturing',
    country: 'Portugal',
    moq: 50,
    specialties: ['Streetwear', 'Hoodie', 'Sweatshirt'],
    leadTime: 25,
    certifications: ['OEKO-TEX'],
    contactEmail: 'info@modalisboa.pt',
    contactPhone: '+351 21 234 5678',
    rating: 4.6,
  },
  {
    name: 'Porto Textile Works',
    country: 'Portugal',
    moq: 200,
    specialties: ['Denim', 'Coton GSM élevé', 'T-shirt'],
    leadTime: 35,
    certifications: ['GOTS', 'OEKO-TEX'],
    contactEmail: 'hello@portotextile.pt',
    contactPhone: '+351 22 345 6789',
    rating: 4.7,
  },
  // TURQUIE
  {
    name: 'Istanbul Fashion Manufacturing',
    country: 'Turquie',
    moq: 200,
    specialties: ['Streetwear', 'Y2K', 'Hoodie'],
    leadTime: 40,
    certifications: ['OEKO-TEX'],
    contactEmail: 'contact@istanbulfashion.tr',
    contactPhone: '+90 212 123 4567',
    rating: 4.6,
  },
  {
    name: 'Bursa Textile Experts',
    country: 'Turquie',
    moq: 300,
    specialties: ['Coton GSM élevé', 'Jersey', 'T-shirt'],
    leadTime: 35,
    certifications: ['OEKO-TEX', 'GOTS'],
    contactEmail: 'info@bursatextile.tr',
    contactPhone: '+90 224 234 5678',
    rating: 4.7,
  },
  // CHINE
  {
    name: 'Guangzhou Fashion Hub',
    country: 'Chine',
    moq: 500,
    specialties: ['Streetwear', 'Y2K', 'Hoodie'],
    leadTime: 45,
    certifications: ['OEKO-TEX'],
    contactEmail: 'contact@guangzhoufashion.cn',
    contactPhone: '+86 20 1234 5678',
    rating: 4.5,
  },
  {
    name: 'Shanghai Premium Textiles',
    country: 'Chine',
    moq: 300,
    specialties: ['Premium', 'Luxe', 'Minimaliste'],
    leadTime: 40,
    certifications: ['OEKO-TEX', 'GOTS'],
    contactEmail: 'info@shanghaipremium.cn',
    contactPhone: '+86 21 2345 6789',
    rating: 4.7,
  },
];

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Non autorisé en production' },
      { status: 403 }
    );
  }

  try {
    // Vérifier si des usines existent déjà
    const existingCount = await prisma.factory.count();

    if (existingCount > 0) {
      return NextResponse.json(
        {
          message: `${existingCount} usine(s) existent déjà. Utilisez le script CLI pour ajouter plus d'usines.`,
          count: existingCount,
        },
        { status: 200 }
      );
    }

    // Créer les usines
    const created = await prisma.factory.createMany({
      data: factories,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: `${created.count} usine(s) créée(s) avec succès`,
      count: created.count,
    });
  } catch (error: any) {
    console.error('Erreur lors du seed des usines:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue', details: error.message },
      { status: 500 }
    );
  }
}
