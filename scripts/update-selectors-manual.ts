/**
 * Script pour mettre à jour manuellement les sélecteurs CSS
 * Basé sur les structures réelles des sites
 * 
 * Usage: npx tsx scripts/update-selectors-manual.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sélecteurs mis à jour basés sur l'analyse des sites
const UPDATED_SELECTORS: Record<string, {
  productSelector: string;
  nameSelector: string;
  priceSelector: string;
  imageSelector: string;
  notes?: string;
}> = {
  'Zara': {
    productSelector: 'li.product-grid-product[data-productid]',
    nameSelector: 'img[data-qa-qualifier="media-image"]',
    priceSelector: '.money-amount__main',
    imageSelector: 'img.media-image__image, img[data-qa-qualifier="media-image"]',
    notes: 'Zara: grille splitée, nom dans img alt (scraper le gère), prix dans bloc __product-info',
  },
  'ASOS': {
    productSelector: 'article[data-auto-id="productTile"]',
    nameSelector: 'h3[data-auto-id="productTileTitle"], a[data-auto-id="productTileTitle"]',
    priceSelector: 'span[data-auto-id="productTilePrice"], .price',
    imageSelector: 'img[data-auto-id="productTileImage"], img',
    notes: 'ASOS utilise data-auto-id pour identifier les éléments',
  },
  'Zalando': {
    productSelector: 'article, [data-testid="product"]',
    nameSelector: 'h3, a[data-testid="product-name"], [class*="name"]',
    priceSelector: '.price, [data-price], [class*="price"]',
    imageSelector: 'img[src], img[data-src]',
    notes: 'Zalando utilise article pour les produits',
  },
  'H&M': {
    productSelector: 'article[data-articlecode]',
    nameSelector: 'h2, a[title], img[alt]',
    priceSelector: 'span[translate="no"]',
    imageSelector: 'img[src], img[data-src]',
    notes: 'H&M: article[data-articlecode], nom dans h2/title/alt, prix dans span[translate="no"]',
  },
  'Uniqlo': {
    productSelector: 'article.product-tile, li.product-tile',
    nameSelector: 'h3.product-tile-name, a.product-tile-name',
    priceSelector: '.product-tile-price, .price',
    imageSelector: 'img.product-tile-image, img',
    notes: 'Uniqlo utilise product-tile pour les produits',
  },
  'Mango': {
    productSelector: 'article.product-item, li.product-item',
    nameSelector: 'h3.product-name, a.product-name',
    priceSelector: '.product-price, .price',
    imageSelector: 'img.product-image, img',
  },
  'Bershka': {
    productSelector: 'article[data-product-id]',
    nameSelector: 'h3.product-name, a.product-name',
    priceSelector: '.price, [data-price]',
    imageSelector: 'img.product-image, img[data-src]',
  },
  'Pull&Bear': {
    productSelector: 'article[data-product-id]',
    nameSelector: 'h3.product-name, a.product-name',
    priceSelector: '.price, [data-price]',
    imageSelector: 'img.product-image, img[data-src]',
  },
  'Nike': {
    productSelector: 'div[data-testid="product-card"]',
    nameSelector: 'a[data-testid="product-card__link-overlay"], a.product-card__link-overlay, h3.product-title',
    priceSelector: '.product-price, [data-price]',
    imageSelector: 'img.product-image, img[src]',
    notes: 'Nike: product-card, nom dans link-overlay',
  },
  'Adidas': {
    productSelector: 'article.product-card, div.product-tile',
    nameSelector: 'h3.product-title, a.product-title',
    priceSelector: '.product-price, [data-price]',
    imageSelector: 'img.product-image, img[src]',
  },
};

async function main() {
  console.log('🔄 Mise à jour des sélecteurs CSS...\n');

  let updated = 0;
  let notFound = 0;

  for (const [brandName, selectors] of Object.entries(UPDATED_SELECTORS)) {
    try {
      const brand = await prisma.scrapableBrand.findUnique({
        where: { name: brandName },
      });

      if (!brand) {
        console.log(`⚠️  ${brandName} : Non trouvée dans la base`);
        notFound++;
        continue;
      }

      await prisma.scrapableBrand.update({
        where: { name: brandName },
        data: {
          productSelector: selectors.productSelector,
          nameSelector: selectors.nameSelector,
          priceSelector: selectors.priceSelector,
          imageSelector: selectors.imageSelector,
          notes: selectors.notes || `Sélecteurs mis à jour le ${new Date().toISOString()}`,
        },
      });

      console.log(`✅ ${brandName} : Sélecteurs mis à jour`);
      updated++;
    } catch (error: any) {
      console.error(`❌ ${brandName} : Erreur - ${error.message}`);
    }
  }

  console.log('\n📊 Résumé :');
  console.log(`   ✅ Mis à jour : ${updated} marques`);
  console.log(`   ⚠️  Non trouvées : ${notFound} marques`);
  console.log('\n💡 Testez maintenant : npm run scan:trends');
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
