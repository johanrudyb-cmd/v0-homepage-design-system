/**
 * Récupère et enregistre le HTML d'une carte produit sur la page liste.
 * Tu n'as rien à faire dans les DevTools : le script fait tout.
 *
 * Usage: npx tsx scripts/dump-product-card-html.ts Zara
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OUT_DIR = path.join(process.cwd(), 'screenshots-debug');

async function main() {
  const brandName = process.argv[2] || 'Zara';
  const brand = await prisma.scrapableBrand.findUnique({
    where: { name: brandName },
  });

  if (!brand) {
    console.error('❌ Marque "%s" non trouvée en base.', brandName);
    process.exit(1);
  }

  const fullUrl = `${brand.baseUrl}${brand.newInUrl}`;
  console.log('📡 Ouverture de la page liste…\n   %s\n', fullUrl);

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 4000));

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await new Promise((r) => setTimeout(r, 2000));
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise((r) => setTimeout(r, 2000));

    const result = await page.evaluate(() => {
      const candidates = [
        'article[data-product-id]',
        'article',
        '[data-product-id]',
        '[class*="product-card"]',
        '[class*="product-item"]',
        '[class*="product-tile"]',
        'li[class*="product"]',
        'div[class*="product"]',
        'a[href*="/p/"]',
        'a[href*="/product"]',
      ];

      for (const sel of candidates) {
        const elts = document.querySelectorAll(sel);
        for (let i = 0; i < Math.min(elts.length, 20); i++) {
          const el = elts[i];
          const hasImg = el.querySelector('img');
          const text = (el.textContent || '').trim();
          const hasPrice = /\d[\d,.]*\s*(€|EUR|eur)/.test(text) || /\d{2,}\s*,\s*\d{2}/.test(text);
          if (hasImg && text.length > 10 && (hasPrice || text.length > 30)) {
            return {
              selector: sel,
              index: i,
              total: elts.length,
              html: el.outerHTML,
            };
          }
        }
      }
      return null;
    });

    if (browser) await browser.close();
    await prisma.$disconnect();

    if (!result) {
      console.log('⚠️ Aucune carte produit détectée sur la page.\n');
      process.exit(1);
    }

    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    const safeName = brandName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const outFile = path.join(OUT_DIR, `card-html-${safeName}.html`);
    fs.writeFileSync(outFile, result.html, 'utf8');

    console.log('✅ Carte produit trouvée :');
    console.log('   Sélecteur : %s (élément %s sur %s)\n', result.selector, result.index + 1, result.total);
    console.log('📄 HTML enregistré dans :\n   %s\n', outFile);
    console.log('Ouvre ce fichier dans un éditeur ou un navigateur pour voir la structure.');
  } catch (e: unknown) {
    console.error('❌ Erreur :', e);
    try {
      await prisma.$disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

main();
