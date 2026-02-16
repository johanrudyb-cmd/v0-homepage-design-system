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
    // Sécurisation : Autoriser n8n secret
    const { searchParams } = new URL(request.url);
    const secret = request.headers.get('x-n8n-secret') || searchParams.get('secret');
    const isN8n = secret && secret === process.env.N8N_WEBHOOK_SECRET;

    const user = !isN8n ? await getCurrentUser() : null;
    if (!isN8n && !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

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
