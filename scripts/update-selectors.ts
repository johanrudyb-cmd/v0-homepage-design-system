/**
 * Script pour mettre à jour les sélecteurs CSS des marques
 * 
 * Usage: npx tsx scripts/update-selectors.ts
 * 
 * Ce script teste et met à jour automatiquement les sélecteurs
 * pour les marques qui fonctionnent.
 */

import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sélecteurs alternatifs à tester pour chaque marque
const SELECTOR_STRATEGIES: Record<string, string[][]> = {
  'Zara': [
    ['article[data-product-id]', 'h3.product-name', '.price', 'img.product-image'],
    ['article.product-item', 'h3', '.price', 'img'],
    ['[data-product-id]', '[data-product-name]', '[data-price]', '[data-image]'],
    ['article', 'h3', '.price', 'img'],
  ],
  'ASOS': [
    ['article[data-auto-id="productTile"]', 'h3[data-auto-id="productTileTitle"]', 'span[data-auto-id="productTilePrice"]', 'img[data-auto-id="productTileImage"]'],
    ['article', 'h3', '[data-price]', 'img'],
    ['[data-testid="product"]', 'h3', '.price', 'img'],
  ],
  'Zalando': [
    ['article', 'h3', '.price', 'img'],
    ['[data-testid="product"]', 'h3', '[data-price]', 'img'],
    ['.product', 'h3', '.price', 'img'],
  ],
  'H&M': [
    ['article.product-item', 'h3.product-item-title', '.product-item-price', 'img'],
    ['article', 'h3', '.price', 'img'],
  ],
  'Uniqlo': [
    ['article.product-tile', 'h3.product-tile-name', '.product-tile-price', 'img'],
    ['article', 'h3', '.price', 'img'],
  ],
};

async function testSelectorsForBrand(brandName: string, selectors: string[]): Promise<number> {
  const brand = await prisma.scrapableBrand.findUnique({
    where: { name: brandName },
  });

  if (!brand) return 0;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    const fullUrl = `${brand.baseUrl}${brand.newInUrl}`;
    await page.goto(fullUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Scroller pour déclencher le lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const count = await page.evaluate((productSelector) => {
      return document.querySelectorAll(productSelector).length;
    }, selectors[0]);

    await browser.close();
    return count;
  } catch (error) {
    await browser.close();
    return 0;
  }
}

async function findWorkingSelectors(brandName: string): Promise<string[] | null> {
  const strategies = SELECTOR_STRATEGIES[brandName];
  if (!strategies) return null;

  console.log(`🔍 Test de ${strategies.length} stratégies pour ${brandName}...`);

  for (const strategy of strategies) {
    const count = await testSelectorsForBrand(brandName, strategy);
    if (count > 0) {
      console.log(`   ✅ Trouvé ${count} produits avec : ${strategy[0]}`);
      return strategy;
    }
  }

  return null;
}

async function updateBrandSelectors(brandName: string, selectors: string[]) {
  await prisma.scrapableBrand.update({
    where: { name: brandName },
    data: {
      productSelector: selectors[0],
      nameSelector: selectors[1],
      priceSelector: selectors[2],
      imageSelector: selectors[3],
      notes: `Sélecteurs mis à jour automatiquement le ${new Date().toISOString()}`,
    },
  });
}

async function main() {
  console.log('🚀 Mise à jour des sélecteurs CSS pour les marques prioritaires...\n');

  const priorityBrands = ['Zara', 'ASOS', 'Zalando', 'H&M', 'Uniqlo'];
  let updated = 0;
  let failed = 0;

  for (const brandName of priorityBrands) {
    console.log(`\n📦 ${brandName}`);
    console.log('─'.repeat(50));
    
    const workingSelectors = await findWorkingSelectors(brandName);
    
    if (workingSelectors) {
      await updateBrandSelectors(brandName, workingSelectors);
      console.log(`   ✅ Sélecteurs mis à jour !`);
      updated++;
      
      // Attendre entre les marques
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log(`   ❌ Aucun sélecteur fonctionnel trouvé`);
      failed++;
    }
  }

  console.log('\n📊 Résumé :');
  console.log(`   ✅ Mis à jour : ${updated} marques`);
  console.log(`   ❌ Échecs : ${failed} marques`);
  console.log('\n💡 Pour tester le scraping : npm run scan:trends');
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
