import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { recordAIUsage, getFeatureCountThisMonth } from '@/lib/ai-usage';

export const runtime = 'nodejs';

const FREE_ANALYSES_LIMIT = 3;

/**
 * POST /api/trends/record-view
 * Enregistre une vue détail tendance pour les utilisateurs gratuits (limite 3/mois).
 * Body: { trendId: string }
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    if (user.plan !== 'free') {
      return NextResponse.json({ recorded: true }); // Compté nulle part pour les payants
    }

    const { trendId } = await request.json();
    if (!trendId) return NextResponse.json({ error: 'trendId requis' }, { status: 400 });

    const count = await getFeatureCountThisMonth(user.id, 'trends_check_image')
      + await getFeatureCountThisMonth(user.id, 'trends_analyse')
      + await getFeatureCountThisMonth(user.id, 'trends_detail_view');

    if (count >= FREE_ANALYSES_LIMIT) {
      return NextResponse.json({ error: 'Limite atteinte', limit: FREE_ANALYSES_LIMIT }, { status: 403 });
    }

    await recordAIUsage(user.id, 'trends_detail_view', { trendId });
    return NextResponse.json({ recorded: true });
  } catch (e) {
    console.error('[record-view]', e);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
