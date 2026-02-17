/**
 * Route API pour scraper des produits tendances réels
 * 
 * POST /api/trends/scrape
 * 
 * Scrape les produits depuis des stores Shopify populaires
 * et les importe dans la base de données TrendProduct
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scrapeAllTrendingProducts } from '@/lib/trends-scraper';
import { getCurrentUser } from '@/lib/auth-helpers';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes pour Puppeteer

export async function POST(request: Request) {
  try {
    // Sécurisation : Autoriser soit l'utilisateur admin, soit n8n via le secret
    const { searchParams } = new URL(request.url);
    const secret = request.headers.get('x-n8n-secret') || searchParams.get('secret');
    const isN8n = secret && secret === process.env.N8N_WEBHOOK_SECRET;

    const user = !isN8n ? await getCurrentUser() : null;

    if (!isN8n && !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 1. Scraping Radar Hybride (Zalando, ASOS, Zara)
    console.log('[Trends Scrape] Début du scraping Radar Hybride...');
    const { refreshAllTrends } = await import('@/lib/refresh-all-trends');
    const hybridResult = await refreshAllTrends();

    // 2. Enrichissement automatique (IA GPT + Higgsfield)
    console.log('[Trends Scrape] Début de l\'enrichissement IA...');
    const { enrichTrends } = await import('@/lib/trend-enricher');
    const enrichResult = await enrichTrends(10); // Enrichir les 10 dernières tendances

    // 3. Notification Admin automatique
    const { notifyAdmin } = await import('@/lib/admin-notifications');
    await notifyAdmin({
      type: 'scrape_success',
      title: '🕵️ Radar Tendances Mis à jour',
      message: `Scraping terminé : ${hybridResult.savedCount} nouveaux produits Hybrides. Enrichissement : ${enrichResult.enriched} produits magnifiés.`,
      emoji: '🕵️',
      data: {
        sources: hybridResult.sourcesCount,
        totalItems: hybridResult.totalItems,
        errors: hybridResult.errors.length,
      }
    });

    return NextResponse.json({
      message: 'Processus Radar complet terminé (Scrape + Enrich + Notify)',
      results: {
        scrape: hybridResult,
        enrich: enrichResult
      }
    });
  } catch (error: any) {
    console.error('[Trends Scrape] Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du scraping' },
      { status: 500 }
    );
  }
}
