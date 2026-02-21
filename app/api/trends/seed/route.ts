import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Route pour seed des produits de démonstration
// À utiliser uniquement en développement
export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Non autorisé en production' }, { status: 403 });
  }

  try {
    // Produits de démonstration
    const products = [
      {
        name: 'Hoodie Oversized Streetwear',
        category: 'Hoodie',
        style: 'Streetwear',
        material: 'Coton GSM élevé',
        averagePrice: 89.99,
        trendScore: 85,
        saturability: 25,
        description: 'Hoodie oversized en coton 400GSM, coupe streetwear, logo brodé',
        sourceUrl: 'https://example.com/demo-hoodie-1',
      },
      {
        name: 'T-shirt Minimaliste Premium',
        category: 'T-shirt',
        style: 'Minimaliste',
        material: 'Coton GSM élevé',
        averagePrice: 39.99,
        trendScore: 72,
        saturability: 45,
        description: 'T-shirt basique premium en coton 220GSM, coupe slim',
        sourceUrl: 'https://example.com/demo-tshirt-1',
      },
      {
        name: 'Cargo Pantalon Y2K',
        category: 'Cargo',
        style: 'Y2K',
        material: 'Synthétique',
        averagePrice: 79.99,
        trendScore: 90,
        saturability: 35,
        description: 'Pantalon cargo style Y2K avec poches multiples',
        sourceUrl: 'https://example.com/demo-cargo-1',
      },
      {
        name: 'Hoodie Luxe Premium',
        category: 'Hoodie',
        style: 'Luxe',
        material: 'Coton GSM élevé',
        averagePrice: 149.99,
        trendScore: 68,
        saturability: 20,
        description: 'Hoodie premium en coton 500GSM, finitions luxe',
        sourceUrl: 'https://example.com/demo-hoodie-2',
      },
      {
        name: 'T-shirt Streetwear Graphic',
        category: 'T-shirt',
        style: 'Streetwear',
        material: 'Coton GSM élevé',
        averagePrice: 49.99,
        trendScore: 78,
        saturability: 50,
        description: 'T-shirt avec graphisme streetwear, coton 240GSM',
        sourceUrl: 'https://example.com/demo-tshirt-2',
      },
      {
        name: 'Cargo Short Y2K',
        category: 'Cargo',
        style: 'Y2K',
        material: 'Synthétique',
        averagePrice: 59.99,
        trendScore: 82,
        saturability: 30,
        description: 'Short cargo style Y2K, coupe oversized',
        sourceUrl: 'https://example.com/demo-cargo-2',
      },
      {
        name: 'Hoodie Minimaliste',
        category: 'Hoodie',
        style: 'Minimaliste',
        material: 'Coton GSM élevé',
        averagePrice: 69.99,
        trendScore: 65,
        saturability: 40,
        description: 'Hoodie minimaliste sans logo, coton 350GSM',
        sourceUrl: 'https://example.com/demo-hoodie-3',
      },
      {
        name: 'T-shirt Y2K Vintage',
        category: 'T-shirt',
        style: 'Y2K',
        material: 'Coton GSM élevé',
        averagePrice: 44.99,
        trendScore: 88,
        saturability: 28,
        description: 'T-shirt vintage style Y2K, coupe oversized',
        sourceUrl: 'https://example.com/demo-tshirt-3',
      },
    ];

    // Vérifier si des produits existent déjà
    const existingCount = await prisma.trendProduct.count();
    if (existingCount > 0) {
      return NextResponse.json({ message: 'Produits déjà seedés', count: existingCount });
    }

    // Créer les produits
    await prisma.trendProduct.createMany({
      data: products,
    });

    return NextResponse.json({ message: `${products.length} produits créés` });
  } catch (error: any) {
    console.error('Error seeding products:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
