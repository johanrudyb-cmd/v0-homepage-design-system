/**
 * Script de migration : Migrer les marques codées en dur vers la base de données
 * 
 * Usage: npx tsx scripts/migrate-brands-to-db.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration actuelle (copiée depuis big-brands-scraper.ts)
const BRAND_CONFIGS = {
  Zara: {
    baseUrl: 'https://www.zara.com',
    newInUrl: '/fr/fr/categorie/femme/nouveautes-c358009.html',
    bestSellersUrl: '/fr/fr/categorie/femme/c358009.html',
    selectors: {
      products: '.product-item, .product-card',
      name: '.product-name, h3',
      price: '.price, [data-price]',
      image: '.product-image img, img[data-src]',
    },
    country: 'ES',
    category: 'fast_fashion',
    priority: 1, // Haute priorité
  },
  ASOS: {
    baseUrl: 'https://www.asos.com',
    newInUrl: '/new-in/ctas/?nlid=nav|header|new+in',
    bestSellersUrl: '/best-sellers/ctas/?nlid=nav|header|best+sellers',
    selectors: {
      products: 'article[data-auto-id="productTile"]',
      name: 'h3[data-auto-id="productTileTitle"]',
      price: 'span[data-auto-id="productTilePrice"]',
      image: 'img[data-auto-id="productTileImage"]',
    },
    country: 'UK',
    category: 'fast_fashion',
    priority: 1,
  },
  Zalando: {
    baseUrl: 'https://www.zalando.fr',
    newInUrl: '/nouveautes/',
    bestSellersUrl: '/best-sellers/',
    selectors: {
      products: '.z-nvg-catalog_articles-article',
      name: '.z-nvg-catalog_articles-article-name',
      price: '.z-nvg-catalog_articles-article-price',
      image: '.z-nvg-catalog_articles-article-image img',
    },
    country: 'DE',
    category: 'marketplace',
    priority: 1,
  },
  'H&M': {
    baseUrl: 'https://www2.hm.com',
    newInUrl: '/fr_fr/ladies/shop-by-product/view-all.html?sort=news',
    bestSellersUrl: '/fr_fr/ladies/shop-by-product/view-all.html?sort=popularity',
    selectors: {
      products: '.product-item',
      name: '.product-item-title',
      price: '.product-item-price',
      image: '.product-item-image img',
    },
    country: 'SE',
    category: 'fast_fashion',
    priority: 1,
  },
  Uniqlo: {
    baseUrl: 'https://www.uniqlo.com',
    newInUrl: '/fr/fr/new-arrivals/',
    bestSellersUrl: '/fr/fr/best-sellers/',
    selectors: {
      products: '.product-tile',
      name: '.product-tile-name',
      price: '.product-tile-price',
      image: '.product-tile-image img',
    },
    country: 'JP',
    category: 'fast_fashion',
    priority: 1,
  },
  Mango: {
    baseUrl: 'https://shop.mango.com',
    newInUrl: '/fr/femme/nouveautes',
    bestSellersUrl: '/fr/femme/bestsellers',
    selectors: {
      products: '.product-item',
      name: '.product-name',
      price: '.product-price',
      image: '.product-image img',
    },
    country: 'ES',
    category: 'fast_fashion',
    priority: 5,
  },
  'Massimo Dutti': {
    baseUrl: 'https://www.massimodutti.com',
    newInUrl: '/fr/fr/femme/nouveautes',
    bestSellersUrl: '/fr/fr/femme/bestsellers',
    selectors: {
      products: '.product-item',
      name: '.product-name',
      price: '.product-price',
      image: '.product-image img',
    },
    country: 'ES',
    category: 'mid_range',
    priority: 5,
  },
  COS: {
    baseUrl: 'https://www.cos.com',
    newInUrl: '/fr/fr_fr/women/new-arrivals',
    bestSellersUrl: '/fr/fr_fr/women/bestsellers',
    selectors: {
      products: '.product-item',
      name: '.product-name',
      price: '.product-price',
      image: '.product-image img',
    },
    country: 'SE',
    category: 'mid_range',
    priority: 5,
  },
};

async function migrate() {
  console.log('🚀 Début de la migration des marques vers la base de données...\n');

  for (const [name, config] of Object.entries(BRAND_CONFIGS)) {
    try {
      const brand = await prisma.scrapableBrand.upsert({
        where: { name },
        update: {
          baseUrl: config.baseUrl,
          newInUrl: config.newInUrl,
          bestSellersUrl: config.bestSellersUrl,
          productSelector: config.selectors.products,
          nameSelector: config.selectors.name,
          priceSelector: config.selectors.price,
          imageSelector: config.selectors.image,
          country: config.country,
          category: config.category,
          priority: config.priority,
          isActive: true,
        },
        create: {
          name,
          baseUrl: config.baseUrl,
          newInUrl: config.newInUrl,
          bestSellersUrl: config.bestSellersUrl,
          productSelector: config.selectors.products,
          nameSelector: config.selectors.name,
          priceSelector: config.selectors.price,
          imageSelector: config.selectors.image,
          country: config.country,
          category: config.category,
          priority: config.priority,
          isActive: true,
        },
      });

      console.log(`✅ ${name} migré avec succès`);
    } catch (error: any) {
      console.error(`❌ Erreur pour ${name}:`, error.message);
    }
  }

  console.log('\n✨ Migration terminée !');
}

migrate()
  .catch((error) => {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
