import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const style = searchParams.get('style') || '';
    const material = searchParams.get('material') || '';
    const sortBy = searchParams.get('sortBy') || 'saturability';

    // Construire les filtres
    const where: any = {};
    if (category) where.category = category;
    if (style) where.style = style;
    if (material) where.material = material;

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
