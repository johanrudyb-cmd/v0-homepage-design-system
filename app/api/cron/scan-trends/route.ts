/**
 * CRON Job pour scanner automatiquement les grandes marques
 * 
 * GET /api/cron/scan-trends
 * 
 * Scrape Zara, ASOS, Zalando, H&M, Uniqlo quotidiennement
 * Détecte les tendances émergentes
 */

import { NextResponse } from 'next/server';
import { scrapeAllBigBrands } from '@/lib/big-brands-scraper';
import { saveTrendSignals } from '@/lib/trend-detector';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    // Vérifier le secret CRON
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[CRON Scan Trends] CRON_SECRET non configuré');
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }

    const providedSecret = authHeader?.replace('Bearer ', '') || request.headers.get('x-cron-secret');
    if (providedSecret !== cronSecret) {
      console.warn('[CRON Scan Trends] Tentative d\'accès non autorisée');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON Scan Trends] Début du scan automatique...');

    // Scraper toutes les marques actives (Zara, Nike, H&M, etc.)
    const products = await scrapeAllBigBrands(true);

    if (products.length === 0) {
      console.warn('[CRON Scan Trends] Aucun produit trouvé');
      return NextResponse.json({
        message: 'Aucun produit trouvé',
        count: 0,
      });
    }

    // Sauvegarder et détecter les tendances
    const result = await saveTrendSignals(products);

    console.log(`[CRON Scan Trends] Scan terminé : ${result.created} créés, ${result.updated} mis à jour, ${result.confirmed} confirmés`);

    return NextResponse.json({
      message: 'Scan automatique terminé',
      productsScraped: products.length,
      signalsCreated: result.created,
      signalsUpdated: result.updated,
      trendsConfirmed: result.confirmed,
    });
  } catch (error: any) {
    console.error('[CRON Scan Trends] Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du scan automatique' },
      { status: 500 }
    );
  }
}
