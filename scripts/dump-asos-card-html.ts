/**
 * Dump le HTML d'une carte produit ASOS (Radar Hybride) pour inspecter le prix.
 * Usage: npx tsx scripts/dump-asos-card-html.ts
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import puppeteer from 'puppeteer';

const ASOS_URL =
  'https://www.asos.com/fr/homme/nouveau/cat/?cid=27110&ctaref=hp|mw|prime|feature|1|category|latestdrops';
const OUT_DIR = path.join(process.cwd(), 'screenshots-debug');

type DumpResult =
  | { ok: false; reason: string; html?: null; text?: null }
  | {
      ok: true;
      totalTiles: number;
      firstTileHtml: string;
      firstTileTextSample: string;
      firstTileInnerTextSample: string;
      priceCandidates: string[];
    };

async function main() {
  console.log('Ouverture ASOS homme nouveau…\n', ASOS_URL, '\n');

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

    await page.goto(ASOS_URL, { waitUntil: 'load', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 6000));

    const result = await page.evaluate(`
      (function() {
        var productSel = 'article[data-auto-id="productTile"], [data-auto-id="productTile"], [class*="productTile"]';
        var tiles = Array.from(document.querySelectorAll(productSel));
        if (tiles.length === 0) return { ok: false, reason: 'no tiles', html: null, text: null };

        var el = tiles[0];
        var text = (el.textContent || '').trim();
        var innerText = (el.innerText || '').trim();

        var priceCandidates = [];
        function walk(node) {
          var t = (node.textContent || '').trim();
          if (t.length > 0 && t.length < 100 && (t.indexOf('€') !== -1 || /\\d{1,3}[,.]\\d{2}/.test(t))) {
            priceCandidates.push(t);
          }
          for (var i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].nodeType === 1) walk(node.childNodes[i]);
          }
        }
        walk(el);

        return {
          ok: true,
          totalTiles: tiles.length,
          firstTileHtml: el.outerHTML,
          firstTileTextSample: text.slice(0, 500),
          firstTileInnerTextSample: innerText.slice(0, 500),
          priceCandidates: priceCandidates
        };
      })()
    `) as DumpResult;

    await browser.close();

    if (!result.ok) {
      console.log('Aucune carte produit trouvée. Raison:', result.reason);
      process.exit(1);
    }

    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    const htmlFile = path.join(OUT_DIR, 'asos-product-tile.html');
    fs.writeFileSync(htmlFile, result.firstTileHtml, 'utf8');
    console.log('Tiles trouvées:', result.totalTiles);
    console.log('Extraits texte (500 premiers car.):', result.firstTileTextSample);
    console.log('\nCandidats prix trouvés dans la carte:', result.priceCandidates);
    console.log('\nHTML complet enregistré:', htmlFile);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
