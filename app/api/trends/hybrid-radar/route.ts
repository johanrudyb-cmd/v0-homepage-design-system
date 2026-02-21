
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const segment = searchParams.get('segment');
    // On ignore ageRange volontairement pour tout afficher
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Conditions de base
    const where: any = {};
    if (segment) {
      where.segment = segment;
    }

    // Récupération simple et directe
    const products = await prisma.trendProduct.findMany({
      where,
      orderBy: { trendScore: 'desc' }, // Les plus "hot" en premier
      take: limit,
      // Pas de select restrictif, on prend tout pour l'instant
    });

    console.log(`API Hybrid Radar: Found ${products.length} products for segment ${segment}`);

    return NextResponse.json({
      trends: products,
      summary: {
        total: products.length,
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ trends: [], error: 'Failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
