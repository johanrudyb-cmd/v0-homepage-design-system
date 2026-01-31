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

export async function POST(request: Request) {
  try {
    // Vérifier que l'utilisateur est admin (optionnel, pour sécurité)
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Scraper les produits
    console.log('[Trends Scrape] Début du scraping...');
    const products = await scrapeAllTrendingProducts();

    if (products.length === 0) {
      return NextResponse.json({ 
        message: 'Aucun produit trouvé',
        count: 0 
      });
    }

    // Importer dans la base de données
    let created = 0;
    let skipped = 0;

    for (const product of products) {
      try {
        // Vérifier si le produit existe déjà (par nom)
        const existing = await prisma.trendProduct.findFirst({
          where: { name: product.name },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Créer le produit
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
          },
        });

        created++;
      } catch (error: any) {
        console.error(`[Trends Scrape] Erreur lors de la création de "${product.name}":`, error);
        skipped++;
      }
    }

    return NextResponse.json({
      message: 'Scraping terminé',
      created,
      skipped,
      total: products.length,
    });
  } catch (error: any) {
    console.error('[Trends Scrape] Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du scraping' },
      { status: 500 }
    );
  }
}
