/**
 * CRON : actualisation hebdomadaire des tendances Zalando (Tendances de la semaine).
 *
 * GET /api/cron/refresh-zalando-trends
 *
 * Scrape toutes les sources Zalando actives (homme + femme, 10 villes) et enregistre
 * les tendances en base. La page "Tendances de la semaine" s'actualise ainsi automatiquement.
 *
 * À appeler chaque semaine (ex. Vercel Cron : 0 9 * * 1 = lundi 9h).
 */

import { NextResponse } from 'next/server';
import { refreshZalandoTrends } from '@/lib/refresh-zalando-trends';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error('[CRON Refresh Zalando] CRON_SECRET non configuré');
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }

    const providedSecret = request.headers.get('authorization')?.replace('Bearer ', '') || request.headers.get('x-cron-secret');
    if (providedSecret !== cronSecret) {
      console.warn('[CRON Refresh Zalando] Tentative d\'accès non autorisée');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const simulate = searchParams.get('simulate') === 'true';

    console.log(`[CRON Refresh Zalando] Début scraping${simulate ? ' (SIMULATION)' : ' (mode rapide)'}...`);

    const { refreshZalandoTrends } = await import('@/lib/refresh-zalando-trends');
    const result = await refreshZalandoTrends({ simulate });

    return NextResponse.json({
      message: 'Tendances Zalando actualisées',
      savedCount: result.savedCount,
      totalItems: result.totalItems,
      sourcesCount: result.sourcesCount,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur';
    console.error('[CRON Refresh Zalando]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
