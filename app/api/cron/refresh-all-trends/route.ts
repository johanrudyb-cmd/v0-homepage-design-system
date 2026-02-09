/**
 * CRON : actualisation hebdomadaire des tendances Zalando, ASOS et Zara.
 *
 * GET /api/cron/refresh-all-trends
 *
 * Tous les mardis 12h : suppression des anciennes tendances et remplacement par les nouvelles.
 * Couvre tous les filtres : homme, femme, 18-24, 25-34.
 */

import { NextResponse } from 'next/server';
import { refreshAllTrends } from '@/lib/refresh-all-trends';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error('[CRON Refresh All Trends] CRON_SECRET non configuré');
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }

    const providedSecret = request.headers.get('authorization')?.replace('Bearer ', '') || request.headers.get('x-cron-secret');
    if (providedSecret !== cronSecret) {
      console.warn('[CRON Refresh All Trends] Tentative d\'accès non autorisée');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON Refresh All Trends] Début actualisation Zalando, ASOS, Zara...');

    const result = await refreshAllTrends();

    return NextResponse.json({
      message: 'Tendances Zalando, ASOS et Zara actualisées',
      deletedCount: result.deletedCount,
      savedCount: result.savedCount,
      totalItems: result.totalItems,
      sourcesCount: result.sourcesCount,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur';
    console.error('[CRON Refresh All Trends]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
