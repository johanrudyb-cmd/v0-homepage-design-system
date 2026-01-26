import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Vérifier si des usines existent, sinon créer des données de test
    const count = await prisma.factory.count();

    if (count === 0) {
      // Créer des usines de test
      const testFactories = [
        {
          name: 'Textile Portugal Pro',
          country: 'Portugal',
          moq: 50,
          specialties: ['Jersey', 'Coton 400GSM+', 'T-shirt'],
          leadTime: 21,
          certifications: ['OEKO-TEX', 'GOTS'],
          contactEmail: 'contact@textileportugal.pt',
          contactPhone: '+351 123 456 789',
          rating: 4.8,
        },
        {
          name: 'Istanbul Fashion Factory',
          country: 'Turquie',
          moq: 100,
          specialties: ['Hoodie', 'Sweatshirt', 'Coton 500GSM'],
          leadTime: 30,
          certifications: ['OEKO-TEX'],
          contactEmail: 'info@istanbulfashion.tr',
          contactPhone: '+90 212 123 4567',
          rating: 4.6,
        },
        {
          name: 'Shenzhen Garment Co',
          country: 'Chine',
          moq: 200,
          specialties: ['Pantalon', 'Cargo', 'Denim'],
          leadTime: 45,
          certifications: [],
          contactEmail: 'sales@shenzhengarment.cn',
          contactPhone: '+86 755 1234 5678',
          rating: 4.4,
        },
        {
          name: 'Lisbon Textile Works',
          country: 'Portugal',
          moq: 30,
          specialties: ['T-shirt', 'Polo', 'Coton 300GSM'],
          leadTime: 18,
          certifications: ['GOTS', 'Fair Trade'],
          contactEmail: 'hello@lisbontextile.pt',
          contactPhone: '+351 987 654 321',
          rating: 4.9,
        },
        {
          name: 'Ankara Production Hub',
          country: 'Turquie',
          moq: 75,
          specialties: ['Hoodie', 'Veste', 'Jersey'],
          leadTime: 25,
          certifications: ['OEKO-TEX'],
          contactEmail: 'contact@ankarahub.tr',
          contactPhone: '+90 312 987 6543',
          rating: 4.7,
        },
        {
          name: 'Guangzhou Fashion Factory',
          country: 'Chine',
          moq: 150,
          specialties: ['Short', 'Pantalon', 'Polyester'],
          leadTime: 35,
          certifications: [],
          contactEmail: 'info@guangzhoufashion.cn',
          contactPhone: '+86 20 8765 4321',
          rating: 4.3,
        },
      ];

      await prisma.factory.createMany({
        data: testFactories,
      });
    }

    const factories = await prisma.factory.findMany({
      orderBy: { rating: 'desc' },
    });

    return NextResponse.json({ factories });
  } catch (error: any) {
    console.error('Erreur dans /api/factories:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
