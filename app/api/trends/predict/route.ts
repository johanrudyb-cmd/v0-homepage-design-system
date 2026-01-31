/**
 * Route API pour obtenir les tendances prédites
 * 
 * GET /api/trends/predict?limit=20&phase=emerging
 */

import { NextResponse } from 'next/server';
import { predictTrends, getEmergingTrends, getGrowingTrends } from '@/lib/trend-predictor';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const phase = searchParams.get('phase'); // 'emerging' | 'growing' | null

    let predictions;

    if (phase === 'emerging') {
      predictions = await getEmergingTrends(limit);
    } else if (phase === 'growing') {
      predictions = await getGrowingTrends(limit);
    } else {
      predictions = await predictTrends(limit);
    }

    return NextResponse.json({ predictions });
  } catch (error: any) {
    console.error('[Trends Predict] Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
