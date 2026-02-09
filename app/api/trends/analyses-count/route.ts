import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/trends/analyses-count
 * Retourne le nombre d'analyses de tendances effectuées ce mois par l'utilisateur.
 * Pour les utilisateurs gratuits : limite de 3 analyses/mois.
 * Utilise AIUsage (trends_check_image + trends_analyse).
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ count: 0 });

    const { getFeatureCountThisMonth } = await import('@/lib/ai-usage');
    const checkImage = await getFeatureCountThisMonth(user.id, 'trends_check_image');
    const analyse = await getFeatureCountThisMonth(user.id, 'trends_analyse');
    const detailView = await getFeatureCountThisMonth(user.id, 'trends_detail_view');
    const count = checkImage + analyse + detailView;

    return NextResponse.json({ count });
  } catch (error: unknown) {
    console.error('[Trends Analyses Count] Erreur:', error);
    return NextResponse.json({ count: 0 });
  }
}
