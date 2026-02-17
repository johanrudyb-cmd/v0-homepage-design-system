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

    // 1. Scraper les produits Shopify (Méthode légère)
    console.log('[Trends Scrape] Début du scraping Shopify...');
    const shopifyProducts = await scrapeAllTrendingProducts();

    // 2. Scraper les sources hybrides (Zalando, ASOS, Zara - Méthode lourde Puppeteer)
    console.log('[Trends Scrape] Début du scraping Hybride (Zalando/ASOS)...');
    const { refreshAllTrends } = await import('@/lib/refresh-all-trends');
    const hybridResult = await refreshAllTrends();

    // Importer les produits Shopify dans la base de données
    let created = 0;
    let skipped = 0;

    for (const product of shopifyProducts) {
      try {
        const existing = await prisma.trendProduct.findFirst({
          where: { name: product.name },
        });

        if (existing) {
          skipped++;
          continue;
        }

        await prisma.trendProduct.create({
          data: {
            name: product.name,
            category: product.category,
            style: product.style,
            material: product.material,
            averagePrice: product.averagePrice,
            trendScore: product.trendScore,
            saturability: product.saturability,
            imageUrl: product.imageUrl,
            description: product.description,
            sourceBrand: 'Shopify Store',
          },
        });

        created++;
      } catch (error: any) {
        console.error(`[Trends Scrape] Erreur lors de la création de "${product.name}":`, error);
        skipped++;
      }
    }

    return NextResponse.json({
      message: 'Scraping complet terminé (Shopify + Zalando/ASOS/Zara)',
      shopify: {
        created,
        skipped,
        total: shopifyProducts.length,
      },
      hybrid: {
        savedCount: hybridResult.savedCount,
        sourcesCount: hybridResult.sourcesCount,
        errors: hybridResult.errors,
      },
    });
  } catch (error: any) {
    console.error('[Trends Scrape] Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du scraping' },
      { status: 500 }
    );
  }
}
