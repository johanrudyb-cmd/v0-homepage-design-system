import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET - Récupérer toutes les analyses de l'utilisateur
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const analyses = await prisma.brandSpyAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        shopifyUrl: true,
        storeName: true,
        category: true,
        estimatedMonthlyRevenue: true,
        productCount: true,
        country: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ analyses });
  } catch (error: any) {
    console.error('Erreur dans /api/spy/analyses GET:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
