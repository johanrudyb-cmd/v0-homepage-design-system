/**
 * Enrichit les tendances sans conseils/note/image : GPT (conseils + note + prompt) puis Higgsfield (image).
 * POST /api/trends/enrich?limit=20
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { enrichTrends } from '@/lib/trend-enricher';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 30);

    const { enriched, errors } = await enrichTrends(limit);

    return NextResponse.json({
      message: `${enriched} tendance(s) enrichie(s) (GPT conseils + note + Higgsfield image)`,
      enriched,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'enrichissement';
    console.error('[trends/enrich]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
