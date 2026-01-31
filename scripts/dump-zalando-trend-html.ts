/**
 * Dump le HTML de la page Zalando Trend Spotter pour identifier les sélecteurs.
 * Usage: npx tsx scripts/dump-zalando-trend-html.ts
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import puppeteer from 'puppeteer';

const URL = 'https://www.zalando.fr/trend-spotter/paris?gender=MEN';
const OUT_DIR = path.join(process.cwd(), 'screenshots-debug');

type DumpResult =
  | { ok: false; reason: string }
  | {
      ok: true;
      productLinkCount: number;
      firstLinkHref: string;
      firstProductHtml: string;
      firstProductText: string;
    };

async function main() {
  console.log('Ouverture Zalando Trend Spotter…\n', URL, '\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 8000));

    const result = await page.evaluate(`
      (function() {
        var all = document.querySelectorAll('a[href*="/p/"]');
        if (all.length === 0) return { ok: false, reason: 'no product links /p/' };
        var el = all[0];
        var card = el.closest('article') || el.closest('[class*="card"]') || el.closest('div[class*="product"]') || el.parentElement;
        var text = (card ? card.textContent : el.textContent || '').trim();
        return {
          ok: true,
          productLinkCount: all.length,
          firstLinkHref: el.href || '',
          firstProductHtml: (card || el).outerHTML,
          firstProductText: text.slice(0, 800)
        };
      })()
    `) as DumpResult;

    await browser.close();

    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    if (result.ok && result.firstProductHtml) {
      const htmlFile = path.join(OUT_DIR, 'zalando-trend-product.html');
      fs.writeFileSync(htmlFile, result.firstProductHtml, 'utf8');
      console.log('Product HTML enregistré:', htmlFile);
    }
    const jsonFile = path.join(OUT_DIR, 'zalando-trend-spotter.json');
    const toSave = result.ok ? { ok: result.ok, productLinkCount: result.productLinkCount, firstLinkHref: result.firstLinkHref, firstProductText: result.firstProductText } : result;
    fs.writeFileSync(jsonFile, JSON.stringify(toSave, null, 2), 'utf8');
    console.log('Résumé JSON:', jsonFile);
    console.log(JSON.stringify(toSave, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
