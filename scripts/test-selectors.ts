/**
 * Script pour tester les sélecteurs CSS d'une marque
 * 
 * Usage: npx tsx scripts/test-selectors.ts Zara
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Dossier des screenshots à la racine du projet */
const getScreenshotsDir = () => {
  const dir = path.join(process.cwd(), 'screenshots-debug');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

async function testSelectors(brandName: string) {
  const brand = await prisma.scrapableBrand.findUnique({
    where: { name: brandName },
  });

  if (!brand) {
    console.error(`❌ Marque "${brandName}" non trouvée dans la base`);
    process.exit(1);
  }

  console.log(`🔍 Test des sélecteurs pour ${brandName}\n`);
  console.log(`URL : ${brand.baseUrl}${brand.newInUrl}\n`);

  const browser = await puppeteer.launch({
    headless: false, // Afficher le navigateur pour debug
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    const fullUrl = `${brand.baseUrl}${brand.newInUrl}`;
    console.log(`📡 Chargement de : ${fullUrl}\n`);

    await page.goto(fullUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Attendre le chargement
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Scroller pour déclencher le lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const pageTitle = await page.title();
    console.log(`📄 Titre de la page : ${pageTitle}\n`);

    // Tester le sélecteur de produits
    console.log('🔎 Test des sélecteurs :\n');
    console.log(`   Products : "${brand.productSelector}"`);
    const productCount = await page.evaluate((selector) => {
      return document.querySelectorAll(selector).length;
    }, brand.productSelector);
    console.log(`   → ${productCount} éléments trouvés\n`);

    if (productCount === 0) {
      console.log('⚠️  Aucun produit trouvé avec ce sélecteur !\n');
      console.log('💡 Suggestions :\n');
      
      // Essayer des sélecteurs alternatifs
      const alternativeSelectors = [
        'article',
        '[data-product]',
        '.product',
        '[class*="product"]',
        '[id*="product"]',
      ];

      for (const altSelector of alternativeSelectors) {
        const count = await page.evaluate((selector) => {
          return document.querySelectorAll(selector).length;
        }, altSelector);
        if (count > 0) {
          console.log(`   • "${altSelector}" : ${count} éléments trouvés`);
        }
      }
    } else {
      // Tester les autres sélecteurs sur le premier produit
      const firstProduct = await page.evaluate((selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        
        return {
          html: el.outerHTML.substring(0, 500),
          classes: el.className,
          id: el.id,
        };
      }, brand.productSelector);

      if (firstProduct) {
        console.log('📦 Premier produit trouvé :');
        console.log(`   Classes : ${firstProduct.classes}`);
        console.log(`   ID : ${firstProduct.id || 'Aucun'}`);
        console.log(`   HTML (extrait) : ${firstProduct.html}...\n`);

        // Tester name selector
        const nameCount = await page.evaluate((productSelector, nameSelector) => {
          const products = document.querySelectorAll(productSelector);
          if (products.length === 0) return 0;
          return products[0].querySelectorAll(nameSelector).length;
        }, brand.productSelector, brand.nameSelector);
        console.log(`   Name selector "${brand.nameSelector}" : ${nameCount} trouvé(s) dans le premier produit`);

        // Tester price selector
        const priceCount = await page.evaluate((productSelector, priceSelector) => {
          const products = document.querySelectorAll(productSelector);
          if (products.length === 0) return 0;
          return products[0].querySelectorAll(priceSelector).length;
        }, brand.productSelector, brand.priceSelector);
        console.log(`   Price selector "${brand.priceSelector}" : ${priceCount} trouvé(s) dans le premier produit`);

        // Tester image selector
        const imageCount = await page.evaluate((productSelector, imageSelector) => {
          const products = document.querySelectorAll(productSelector);
          if (products.length === 0) return 0;
          return products[0].querySelectorAll(imageSelector).length;
        }, brand.productSelector, brand.imageSelector);
        console.log(`   Image selector "${brand.imageSelector}" : ${imageCount} trouvé(s) dans le premier produit`);
      }
    }

    // Prendre un screenshot pour debug (dossier dédié à la racine du projet)
    const screenshotsDir = getScreenshotsDir();
    const fileName = `debug-${brandName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.png`;
    const fullPath = path.join(screenshotsDir, fileName);
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`\n📸 Screenshot sauvegardé :`);
    console.log(`   ${fullPath}`);

    console.log('\n✅ Test terminé. Ouvrez le fichier ci-dessus pour voir la structure de la page.');
    console.log('💡 Utilisez les DevTools du navigateur pour identifier les bons sélecteurs.');

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

const brandName = process.argv[2];
if (!brandName) {
  console.error('Usage: npx tsx scripts/test-selectors.ts <BrandName>');
  console.error('Exemple: npx tsx scripts/test-selectors.ts Zara');
  process.exit(1);
}

testSelectors(brandName);
