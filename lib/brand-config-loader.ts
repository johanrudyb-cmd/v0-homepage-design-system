/**
 * Chargeur de configurations de marques depuis la base de données
 * 
 * Remplace le système codé en dur par un système dynamique
 */

import { prisma } from '@/lib/prisma';

export interface BrandConfig {
  baseUrl: string;
  newInUrl: string;
  bestSellersUrl: string;
  selectors: {
    products: string;
    name: string;
    price: string;
    image: string;
  };
  country?: string;
  category?: string;
  priority: number;
}

/**
 * Charger toutes les configurations de marques actives depuis la base
 */
export async function loadBrandConfigs(): Promise<Map<string, BrandConfig>> {
  const brands = await prisma.scrapableBrand.findMany({
    where: { isActive: true },
    orderBy: { priority: 'asc' },
  });

  const configs = new Map<string, BrandConfig>();

  for (const brand of brands) {
    configs.set(brand.name, {
      baseUrl: brand.baseUrl,
      newInUrl: brand.newInUrl,
      bestSellersUrl: brand.bestSellersUrl,
      selectors: {
        products: brand.productSelector,
        name: brand.nameSelector,
        price: brand.priceSelector,
        image: brand.imageSelector,
      },
      country: brand.country || undefined,
      category: brand.category || undefined,
      priority: brand.priority,
    });
  }

  return configs;
}

/**
 * Obtenir la configuration d'une marque spécifique
 */
export async function getBrandConfig(brandName: string): Promise<BrandConfig | null> {
  const brand = await prisma.scrapableBrand.findUnique({
    where: { name: brandName },
  });

  if (!brand || !brand.isActive) {
    return null;
  }

  return {
    baseUrl: brand.baseUrl,
    newInUrl: brand.newInUrl,
    bestSellersUrl: brand.bestSellersUrl,
    selectors: {
      products: brand.productSelector,
      name: brand.nameSelector,
      price: brand.priceSelector,
      image: brand.imageSelector,
    },
    country: brand.country || undefined,
    category: brand.category || undefined,
    priority: brand.priority,
  };
}

/**
 * Mettre à jour les statistiques après un scraping réussi
 */
export async function updateBrandStats(
  brandName: string,
  productsScraped: number,
  success: boolean = true
): Promise<void> {
  await prisma.scrapableBrand.update({
    where: { name: brandName },
    data: {
      lastScrapedAt: new Date(),
      lastScrapeSuccess: success,
      totalScraped: {
        increment: productsScraped,
      },
    },
  });
}
