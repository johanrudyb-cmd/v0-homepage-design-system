import { NextResponse } from 'next/server';
import { isDatabaseAvailable } from '@/lib/prisma';
import { getFeaturedTrends } from '@/lib/trends-data';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const now = new Date();
  const monthSeed = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ trends: [], monthSeed });
    }

    const featuredTrends = await getFeaturedTrends();

    return NextResponse.json({
      trends: featuredTrends,
      monthSeed,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes('Environment variable not found: DATABASE_URL') ||
      errorMessage.includes('PrismaClientInitializationError') ||
      errorMessage.includes('DATABASE_URL') ||
      errorMessage.includes('Prisma Client')
    ) {
      console.warn('[Homepage Featured] Erreur Prisma/DATABASE_URL. Returning empty trends.');
      return NextResponse.json({ trends: [], monthSeed: '' });
    }

    console.error('[Homepage Featured] Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue', trends: [] },
      { status: 500 }
    );
  }
}
