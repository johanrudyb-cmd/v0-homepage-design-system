/**
 * Route API pour scanner les grandes marques et détecter les tendances
 * 
 * POST /api/trends/scan-big-brands
 * 
 * Scrape Zara, ASOS, Zalando, H&M, Uniqlo
 * Détecte les tendances (3+ leaders = confirmé)
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { scrapeAllBigBrands } from '@/lib/big-brands-scraper';
import { saveTrendSignals } from '@/lib/trend-detector';
import { enrichTrends } from '@/lib/trend-enricher';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    // Vérifier authentification
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    console.log('[Trend Scan] Début du scan des grandes marques...');

    // Scraper toutes les marques
    // Inclure les marques moyennes pour enrichir les données de prédiction
    const products = await scrapeAllBigBrands(true);

    if (products.length === 0) {
      return NextResponse.json({
        message: 'Aucun produit trouvé',
        count: 0,
      });
    }

    // Sauvegarder et détecter les tendances
    const result = await saveTrendSignals(products);

    // Enrichir les tendances avec GPT (conseils + note) + Higgsfield (image) — max 5 par scan pour éviter timeout
    let enriched = 0;
    try {
      const enrichResult = await enrichTrends(5);
      enriched = enrichResult.enriched;
      if (enrichResult.errors.length > 0) {
        console.warn('[Trend Scan] Enrichissement partiel:', enrichResult.errors);
      }
    } catch (enrichErr) {
      console.error('[Trend Scan] Enrichissement IA:', enrichErr);
    }

    return NextResponse.json({
      message: 'Scan terminé',
      productsScraped: products.length,
      signalsCreated: result.created,
      signalsUpdated: result.updated,
      trendsConfirmed: result.confirmed,
      trendsEnriched: enriched,
    });
  } catch (error: any) {
    console.error('[Trend Scan] Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du scan' },
      { status: 500 }
    );
  }
}
