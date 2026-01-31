/**
 * Trend Radar Hybride - Collecte image + titre + prix
 * Une première extraction fixe la liste de produits ; un scroll léger déclenche
 * le lazy-load des images, puis on ré-extrait pour compléter les imageUrl manquantes.
 */

import puppeteer, { Browser } from 'puppeteer';
import type { HybridRadarSource } from './hybrid-radar-sources';

export interface HybridScrapedItem {
  name: string;
  price: number;
  imageUrl: string | null;
  sourceUrl: string;
  brand: string;
  marketZone: 'FR' | 'EU' | 'US' | 'ASIA';
  segment?: 'homme' | 'femme' | 'garcon' | 'fille';
  /** Pourcentage de croissance Zalando (ex. 15 pour "+15%") */
  trendGrowthPercent?: number | null;
  /** Libellé Zalando (ex. "Tendance", "En hausse") */
  trendLabel?: string | null;
  /** Infos utiles pour tech pack / fournisseur textile */
  composition?: string | null;
  careInstructions?: string | null;
  color?: string | null;
  sizes?: string | null;
  countryOfOrigin?: string | null;
  articleNumber?: string | null;
}

/** Mots-clés pour exclure chaussures / baskets (vêtements uniquement). */
const EXCLUDE_SHOES_KEYWORDS = [
  'basket', 'baskets', 'chaussure', 'chaussures', 'sneaker', 'sneakers',
  'shoe', 'shoes', 'bottine', 'bottines', 'sandale', 'sandales', 'botte', 'bottes',
  'escarpin', 'escarpins', 'running', 'trainer', 'trainers', 'footwear',
  'boot', 'boots', 'loafer', 'loafers', 'mule', 'mules', 'slip-on',
];

/** Sous-vêtements à exclure (termes très explicites pour éviter faux positifs). */
const EXCLUDE_UNDERWEAR_KEYWORDS = [
  'sous-vêtement', 'sous-vetement', 'slip homme', 'slip femme', 'boxer short', 'boxers short',
  'caleçon', 'calecon', 'culotte homme', 'culotte femme', 'string homme', 'brief ', 'underwear',
  'soutien-gorge', 'soutien gorge', 'brassière', 'brassiere', 'pyjama ', 'nuisette',
];

/** Sacs à exclure (pas "bag" seul : exclurait "baggy"). */
const EXCLUDE_BAG_KEYWORDS = [
  'sac à main', 'sac a main', 'sac à dos', 'sac a dos', 'sac bandoulière', 'sac bandouliere',
  'tote bag', 'backpack', 'portefeuille', 'porte-monnaie', 'porte monnaie',
  ' sac ', 'sac à ', 'sac a ',  // sac avec espace ou "sac à" pour sac à main/dos etc.
];

/** Parfums à exclure. */
const EXCLUDE_PERFUME_KEYWORDS = [
  'parfum', 'parfums', 'perfume', 'perfumes', 'eau de toilette', 'eau de parfum',
  'fragrance', 'fragrances', 'flacon', 'spray',
];

/** Accessoires à exclure (on garde vêtements uniquement). */
const EXCLUDE_ACCESSORIES_KEYWORDS = [
  'lunettes', 'lunette de soleil', 'montre', 'montres', 'ceinture', 'ceintures',
  'bijou', 'bijoux', 'accessoire', 'accessoires', 'accessories', 'necklace',
  'bracelet', 'bracelets', 'belt', 'watch', 'glasses', 'casquette', 'chapeau',
  'cap ', ' hat ', 'écharpe', 'echarpe', 'scarf', 'gants ', 'gloves', 'collier',
  'bag bandoulière', 'sac bandoulière', 'autres accessoires',
];

/** Bijoux et non-vêtements à exclure (vêtements uniquement). */
const EXCLUDE_JEWELRY_KEYWORDS = [
  'boucle d\'oreille', 'boucles d\'oreille', 'boucles d’oreilles', 'earring', 'earrings',
  'bague', 'bagues', 'ring ', 'rings ', 'pendentif', 'pendentifs', 'pendant',
  'broche', 'broches', 'pin ', 'jewelry', 'jewellery', 'parure', 'parures',
];

/** Cosmétiques / beauté à exclure (vêtements uniquement). */
const EXCLUDE_COSMETICS_KEYWORDS = [
  'rouge à lèvres', 'lipstick', 'eyeshadow', 'fard', 'maquillage', 'mascara',
  'nail', 'vernis', 'crème', 'cream', 'masque cheveux', 'brush', 'brosse',
  'lips', 'blush', 'highlighter', 'concealer', 'foundation',
];

function isExcludedProduct(name: string, extraExcludeKeywords: string[] = []): boolean {
  const text = (name || '').toLowerCase();
  const all = [
    ...EXCLUDE_SHOES_KEYWORDS,
    ...EXCLUDE_UNDERWEAR_KEYWORDS,
    ...EXCLUDE_BAG_KEYWORDS,
    ...EXCLUDE_PERFUME_KEYWORDS,
    ...EXCLUDE_ACCESSORIES_KEYWORDS,
    ...EXCLUDE_JEWELRY_KEYWORDS,
    ...EXCLUDE_COSMETICS_KEYWORDS,
    ...extraExcludeKeywords,
  ];
  return all.some((kw) => text.includes(kw));
}

/** Extraction produits depuis la page courante. Utilise new Function pour éviter __name injecté par tsx dans page.evaluate. */
function zalandoExtractFromPage(
  page: { evaluate: (fn: (a: string, b: string, c: string) => HybridScrapedItem[], a: string, b: string, c: string) => Promise<HybridScrapedItem[]> },
  source: HybridRadarSource
): Promise<HybridScrapedItem[]> {
  const body = `
    var priceRe = /[\\d,]+\\.?\\d*/;
    var firstPriceRe = /\\b(\\d{1,3}[,.]\\d{2})\\s*[€$£]?/;
    function isOkHref(h) {
      if (!h || h.indexOf('faq') !== -1 || h.indexOf('corporate') !== -1 || h.indexOf('apps.') !== -1) return false;
      if (h.indexOf('trending-items') !== -1 || h.indexOf('trend-details') !== -1) return false;
      return (h.indexOf('zalando.fr') !== -1 && h.indexOf('/p/') !== -1) || (h.indexOf('.html') !== -1 && h.indexOf('zalando') !== -1);
    }
    var productLinkSel = 'a[href*="zalando.fr"][href*="/p/"], a[href*="zalando"][href*=".html"]';
    function extractFromCard(el, href) {
      var card = el.tagName === 'A' ? (el.closest('article') || el.parentElement || el) : el;
      var nameEl = card.querySelector('h3, h2, h4, [class*="name"], [class*="title"], [class*="Name"], [class*="Title"]');
      var name = (nameEl && nameEl.textContent ? nameEl.textContent : '').trim().replace(/\\s+/g, ' ').slice(0, 200);
      var imgEl = card.querySelector('img[src*="ztat"], img[src*="img01"], img[src*="zalando"], img[data-src*="ztat"], img');
      if (imgEl && imgEl.alt && !name) name = (imgEl.alt || '').trim().slice(0, 200);
      var text = card.textContent || '';
      var priceMatch = text.match(firstPriceRe);
      var price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;
      if (price <= 0) { var pm = text.match(priceRe); if (pm) price = parseFloat(pm[0].replace(',', '.')); }
      var imageUrl = null;
      if (imgEl) {
        imageUrl = imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || null;
        if (imageUrl && imageUrl.indexOf('//') === 0) imageUrl = 'https:' + imageUrl;
      }
      if (!name && imgEl) name = (imgEl.alt || 'Produit').trim().slice(0, 200);
      return { name: name, price: price, imageUrl: imageUrl, sourceUrl: href, marketZone: marketZone, brand: brand, segment: seg };
    }
    var articles = Array.from(document.querySelectorAll('article'));
    articles = articles.filter(function(el) { return el.querySelector(productLinkSel); });
    if (articles.length === 0) {
      var links = Array.from(document.querySelectorAll('a[href*="zalando.fr"][href*="/p/"]'));
      var seen = new Set();
      var cards = [];
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        var href = (a.href || '').trim();
        if (!href || !isOkHref(href) || seen.has(href)) continue;
        seen.add(href);
        var el = a;
        for (var j = 0; j < 12 && el; j++) {
          if (el.querySelector && el.querySelector('img')) { cards.push(el); break; }
          el = el.parentElement;
        }
        if (!el || !el.querySelector('img')) cards.push(a);
      }
      articles = cards;
    }
    var seenHref = {};
    var out = [];
    for (var k = 0; k < articles.length; k++) {
      var el = articles[k];
      var linkEl = el.querySelector(productLinkSel) || (el.tagName === 'A' && el.href ? el : null);
      var href = linkEl ? (linkEl.href || linkEl.getAttribute('href') || '') : '';
      if (!href) href = el.href || el.getAttribute('href') || '';
      if (!href || !isOkHref(href) || seenHref[href]) continue;
      seenHref[href] = true;
      var p = extractFromCard(el, href);
      if (p && p.sourceUrl && (p.name.length > 2 || p.imageUrl)) out.push(p);
    }
    return out;
  `;
  const fn = new Function('marketZone', 'brand', 'seg', body) as (a: string, b: string, c: string) => HybridScrapedItem[];
  return page.evaluate(fn, source.marketZone, source.brand, source.segment ?? 'femme') as Promise<HybridScrapedItem[]>;
}

/** Zalando Trend Spotter : page liste des tendances → clic = page trend-details avec produits (prix, image). */
async function scrapeZalandoTrendSpotter(source: HybridRadarSource): Promise<HybridScrapedItem[]> {
  const listUrl = `${source.baseUrl}${source.newInPath}`;
  const mainPageOnly = source.zalandoMainPageOnly === true;
  const maxTrendPages = 12;
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(listUrl, { waitUntil: 'networkidle0', timeout: 45000 }).catch(() =>
      page.goto(listUrl, { waitUntil: 'load', timeout: 45000 })
    );
    const waitMs = source.initialWaitMs ?? 12000;
    await new Promise((r) => setTimeout(r, waitMs));
    try {
      await page.waitForSelector('a[href*="zalando.fr"][href*="/p/"], article a[href*="/p/"], [class*="article"] a[href*="/p/"], [class*="ProductCard"] a[href*="/p/"]', { timeout: 20000 });
    } catch (_) {
      /* continuer même si le sélecteur n'apparaît pas */
    }

    const enrichTrendingItems = source.zalandoTrendingItemsEnrich === true;
    if (mainPageOnly && !enrichTrendingItems) {
      const scrollTo = new Function('y', 'window.scrollTo(0, y);') as (y: number) => void;
      for (let s = 1; s <= (source.preScrollSteps ?? 20); s++) {
        const maxH = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
        await page.evaluate(scrollTo, Math.round((maxH * s) / (source.preScrollSteps ?? 20)));
        await new Promise((r) => setTimeout(r, 2000));
      }
      await new Promise((r) => setTimeout(r, 3000));
      const diag = await page.evaluate(`
        (function() {
          var articles = document.querySelectorAll('article');
          var links = document.querySelectorAll('a[href*="zalando.fr"]');
          var hrefs = [];
          for (var i = 0; i < Math.min(links.length, 5); i++) hrefs.push(links[i].href || '');
          return { nArticles: articles.length, nLinks: links.length, sampleHrefs: hrefs };
        })()
      `) as { nArticles: number; nLinks: number; sampleHrefs: string[] };
      if (diag.nArticles > 0 || diag.nLinks > 0) {
        console.log(`[Hybrid Radar] Zalando (${source.id}): page — ${diag.nArticles} article(s), ${diag.nLinks} lien(s) zalando.fr`);
      }
      const extracted = await zalandoExtractFromPage(page, source);
      const withoutExcluded = extracted.filter((p) => !isExcludedProduct(p.name, source.excludeKeywords));
      if (extracted.length === 0) console.log(`[Hybrid Radar] Zalando (${source.id}): 0 produits extraits (page principale)`);
      if (extracted.length !== withoutExcluded.length) {
        console.log(`[Hybrid Radar] Zalando (${source.id}): ${extracted.length} bruts → ${withoutExcluded.length} après exclusions (vêtements uniquement)`);
      }
      await browser.close();
      return withoutExcluded.slice(0, source.limit).map((p) => ({
        ...p,
        sourceUrl: p.sourceUrl || listUrl,
        segment: source.segment,
      }));
    }

    if (mainPageOnly && enrichTrendingItems) {
      const scrollTo = new Function('y', 'window.scrollTo(0, y);') as (y: number) => void;
      for (let s = 1; s <= (source.preScrollSteps ?? 20); s++) {
        const maxH = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
        await page.evaluate(scrollTo, Math.round((maxH * s) / (source.preScrollSteps ?? 20)));
        await new Promise((r) => setTimeout(r, 2000));
      }
      await new Promise((r) => setTimeout(r, 3000));
      console.log(`[Hybrid Radar] Zalando (${source.id}): extraction uniquement depuis la page (${listUrl})`);
      let extracted = await zalandoExtractFromPage(page, source);
      if (extracted.length === 0) {
        await new Promise((r) => setTimeout(r, 5000));
        const scrollTo = new Function('y', 'window.scrollTo(0, y);') as (y: number) => void;
        const maxH = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
        await page.evaluate(scrollTo, maxH);
        await new Promise((r) => setTimeout(r, 3000));
        await page.evaluate(scrollTo, 0);
        await new Promise((r) => setTimeout(r, 2000));
        extracted = await zalandoExtractFromPage(page, source);
        if (extracted.length > 0) console.log(`[Hybrid Radar] Zalando (${source.id}): ${extracted.length} produits après retry (scroll)`);
      }
      const withTrendFromCard = await page.evaluate(() => {
        const articles = document.querySelectorAll('article');
        const out: { url: string; trendGrowthPercent?: number; trendLabel?: string }[] = [];
        const seen = new Set<string>();
        const priceRe = /\b(\d+)\s*%/;
        for (let i = 0; i < articles.length; i++) {
          const art = articles[i];
          const a = art.querySelector('a[href*="zalando.fr"]') as HTMLAnchorElement | null;
          if (!a) continue;
          const h = (a.href || '').trim();
          if (!h || h.indexOf('trend-spotter') !== -1 || h.indexOf('/p/') === -1) continue;
          if (seen.has(h)) continue;
          seen.add(h);
          const text = (art as HTMLElement).textContent || '';
          const numMatch = text.match(priceRe);
          const trendGrowthPercent = numMatch ? parseInt(numMatch[1], 10) : undefined;
          let trendLabel: string | undefined;
          if (/tendance/i.test(text)) trendLabel = 'Tendance';
          else if (/en hausse/i.test(text)) trendLabel = 'En hausse';
          else if (trendGrowthPercent != null) trendLabel = 'Tendance';
          out.push({ url: h, trendGrowthPercent, trendLabel });
        }
        return out;
      }) as { url: string; trendGrowthPercent?: number; trendLabel?: string }[];
      const trendByUrl = new Map<string, { trendGrowthPercent?: number; trendLabel?: string }>();
      for (const t of withTrendFromCard) {
        try {
          const u = new URL(t.url);
          const key = u.origin + u.pathname;
          trendByUrl.set(key, { trendGrowthPercent: t.trendGrowthPercent, trendLabel: t.trendLabel });
        } catch {
          trendByUrl.set(t.url, { trendGrowthPercent: t.trendGrowthPercent, trendLabel: t.trendLabel });
        }
      }
      const withoutExcluded = extracted.filter((p) => !isExcludedProduct(p.name, source.excludeKeywords));
      const withTrend = withoutExcluded.slice(0, source.limit).map((p) => {
        let key = p.sourceUrl;
        try {
          const u = new URL(p.sourceUrl);
          key = u.origin + u.pathname;
        } catch {
          /**/
        }
        const trend = trendByUrl.get(key);
        return {
          ...p,
          sourceUrl: p.sourceUrl || listUrl,
          segment: source.segment,
          trendGrowthPercent: trend?.trendGrowthPercent ?? null,
          trendLabel: trend?.trendLabel ?? null,
        };
      });
      if (extracted.length > 0) {
        console.log(`[Hybrid Radar] Zalando (${source.id}): ${withTrend.length} produits extraits de la page Paris`);
      } else {
        console.log(`[Hybrid Radar] Zalando (${source.id}): 0 produits extraits de la page Paris`);
      }
      await browser.close();
      return withTrend;
    }

    if (mainPageOnly && !enrichTrendingItems) {
      const scrollToOld = new Function('y', 'window.scrollTo(0, y);') as (y: number) => void;
      const toEnrich: string[] = [];
      if (toEnrich.length === 0) {
        console.log(`[Hybrid Radar] Zalando (${source.id}): extraction page principale (sans enrich)`);
      }
      const allItems: HybridScrapedItem[] = [];
      const seenProductUrls = new Set<string>();
      const normalizeProductUrl = (url: string) => {
        try {
          const u = new URL(url);
          if (u.pathname.includes('/p/') || u.pathname.endsWith('.html')) {
            return u.origin + u.pathname;
          }
          return url;
        } catch {
          return url;
        }
      };
      for (const trendUrl of toEnrich) {
        if (allItems.length >= source.limit) break;
        try {
          await page.goto(trendUrl, { waitUntil: 'load', timeout: 20000 });
          await new Promise((r) => setTimeout(r, 2500));
          type ProductFromCard = { url: string; trendGrowthPercent?: number; trendLabel?: string; name?: string; price?: number; imageUrl?: string };
          let productLinksFromPage = await page.evaluate(() => {
            const result: { url: string; trendGrowthPercent?: number; trendLabel?: string; name?: string; price?: number; imageUrl?: string }[] = [];
            const seen = new Set<string>();
            const priceRe = /\b(\d{1,3}[,.]\d{2})\s*[€$£]?/;
            const root = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
            const articles = root.querySelectorAll('article');
            for (let i = 0; i < articles.length; i++) {
              const art = articles[i];
              const a = art.querySelector('a[href*="zalando.fr"]') as HTMLAnchorElement | null;
              if (!a) continue;
              const h = a.href || '';
              if (!h || h.indexOf('trend-spotter') !== -1 || h.indexOf('faq') !== -1 || h.indexOf('corporate') !== -1) continue;
              const isProduct = (h.indexOf('/p/') !== -1 || (h.indexOf('.html') !== -1 && h.indexOf('zalando.fr') !== -1));
              if (!isProduct || seen.has(h)) continue;
              seen.add(h);
              let trendGrowthPercent: number | undefined;
              let trendLabel: string | undefined;
              let name: string | undefined;
              let price: number | undefined;
              let imageUrl: string | undefined;
              const card = art;
              const text = (card as HTMLElement).textContent || '';
              const numMatch = text.match(/(\d+)\s*%/);
              if (numMatch) trendGrowthPercent = parseInt(numMatch[1], 10);
              if (/tendance/i.test(text)) trendLabel = 'Tendance';
              else if (/en hausse/i.test(text)) trendLabel = 'En hausse';
              else if (/trending|growth/i.test(text)) trendLabel = 'Trending';
              else if (/up\s*\d/i.test(text)) trendLabel = 'En hausse';
              if (trendGrowthPercent != null && !trendLabel) trendLabel = 'Tendance';
              const nameEl = card.querySelector('h3, h2, [class*="name"], [class*="title"]');
              if (nameEl) name = (nameEl as HTMLElement).textContent?.trim().slice(0, 200) || undefined;
              const img = card.querySelector('img[src*="ztat"], img[src*="zalando"], img[src*="img01"]') as HTMLImageElement | null;
              if (img && (img.src || img.getAttribute('data-src'))) {
                imageUrl = (img.src || img.getAttribute('data-src') || '') as string;
                if (imageUrl && !name && img.alt) name = img.alt.trim().slice(0, 200);
              }
              const priceMatch = text.match(priceRe);
              if (priceMatch) price = parseFloat(priceMatch[1].replace(',', '.'));
              result.push({ url: h, trendGrowthPercent, trendLabel, name, price, imageUrl });
            }
            if (result.length === 0) {
              const as = root.querySelectorAll('a[href*="zalando.fr"]');
              for (let i = 0; i < as.length; i++) {
                const a = as[i] as HTMLAnchorElement;
                const h = a.href || '';
                if (!h || h.indexOf('trend-spotter') !== -1 || h.indexOf('faq') !== -1 || h.indexOf('corporate') !== -1) continue;
                const isProduct = (h.indexOf('/p/') !== -1 || (h.indexOf('.html') !== -1 && h.indexOf('zalando.fr') !== -1));
                if (!isProduct || seen.has(h)) continue;
                seen.add(h);
                let trendGrowthPercent: number | undefined;
                let trendLabel: string | undefined;
                let name: string | undefined;
                let price: number | undefined;
                let imageUrl: string | undefined;
                const card = a.closest('article') || a.closest('[class*="card"]') || a.closest('[class*="product"]') || a.parentElement;
                if (card) {
                  const text = (card as HTMLElement).textContent || '';
                  const numMatch = text.match(/(\d+)\s*%/);
                  if (numMatch) trendGrowthPercent = parseInt(numMatch[1], 10);
                  if (/tendance/i.test(text)) trendLabel = 'Tendance';
                  else if (/en hausse/i.test(text)) trendLabel = 'En hausse';
                  else if (/up\s*\d/i.test(text)) trendLabel = 'En hausse';
                  if (trendGrowthPercent != null && !trendLabel) trendLabel = 'Tendance';
                  const nameEl = card.querySelector('h3, h2, [class*="name"], [class*="title"]');
                  if (nameEl) name = (nameEl as HTMLElement).textContent?.trim().slice(0, 200) || undefined;
                  const img = card.querySelector('img[src*="ztat"], img[src*="zalando"], img[src*="img01"]') as HTMLImageElement | null;
                  if (img && (img.src || img.getAttribute('data-src'))) {
                    imageUrl = (img.src || img.getAttribute('data-src') || '') as string;
                    if (imageUrl && !name && img.alt) name = img.alt.trim().slice(0, 200);
                  }
                  const priceMatch = text.match(priceRe);
                  if (priceMatch) price = parseFloat(priceMatch[1].replace(',', '.'));
                }
                result.push({ url: h, trendGrowthPercent, trendLabel, name, price, imageUrl });
              }
            }
            return result;
          }) as ProductFromCard[];
          productLinksFromPage = productLinksFromPage.slice(0, 12);
          if (productLinksFromPage.length === 0) {
            const clicked = await page.evaluate(() => {
              const btn = Array.from(document.querySelectorAll('a, button')).find((el) => /voir\s*l['\u2019']?article|voir l'article/i.test((el as HTMLElement).textContent || ''));
              if (btn) {
                (btn as HTMLElement).click();
                return true;
              }
              return false;
            });
            if (clicked) {
              await new Promise((r) => setTimeout(r, 3500));
              const fallbackUrl = page.url();
              if (fallbackUrl && fallbackUrl.includes('zalando.fr') && !fallbackUrl.includes('/trend-spotter/trending-items')) {
                productLinksFromPage = [{ url: fallbackUrl }];
              }
            }
          }
          for (const entry of productLinksFromPage) {
            if (allItems.length >= source.limit) break;
            const productUrl = normalizeProductUrl(entry.url);
            if (productUrl.includes('trending-items') || seenProductUrls.has(productUrl)) continue;
            seenProductUrls.add(productUrl);
            const cardTrendPercent = entry.trendGrowthPercent;
            const cardTrendLabel = entry.trendLabel;
            if (entry.name && entry.name.length > 2 && !isExcludedProduct(entry.name, source.excludeKeywords)) {
              allItems.push({
                name: entry.name,
                price: entry.price ?? 0,
                imageUrl: entry.imageUrl ?? null,
                sourceUrl: productUrl,
                brand: source.brand,
                marketZone: source.marketZone,
                segment: source.segment ?? undefined,
                trendGrowthPercent: cardTrendPercent ?? null,
                trendLabel: cardTrendLabel ?? null,
              });
              continue;
            }
            try {
              await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
              await new Promise((r) => setTimeout(r, 2500));
              const enriched = await page.evaluate(
            (marketZone: string, brand: string, seg: string) => {
              const body = (document.body && document.body.textContent) || '';
              const getText = (sel: string) => {
                const el = document.querySelector(sel);
                return (el && (el as HTMLElement).textContent ? (el as HTMLElement).textContent.trim() : '') || '';
              };
              const priceRe = /\b(\d{1,3}[,.]\d{2})\s*[€$£]?/;
              let price = 0;
              const priceCandidates: { val: number; el: Element }[] = [];
              const priceEls = document.querySelectorAll('[class*="price"], [class*="Price"], [data-testid*="price"], [data-id*="price"]');
              for (let i = 0; i < priceEls.length; i++) {
                const el = priceEls[i];
                const text = (el as HTMLElement).textContent || '';
                if (/avant|was|from|dès|à partir|livraison|shipping/i.test(text)) continue;
                const m = text.match(priceRe);
                if (m) {
                  const val = parseFloat(m[1].replace(',', '.'));
                  if (val >= 1 && val <= 5000) priceCandidates.push({ val, el });
                }
              }
              if (priceCandidates.length > 0) {
                price = priceCandidates[priceCandidates.length - 1].val;
              }
              if (price <= 0) {
                const metaPrice = (document.querySelector('meta[property="product:price:amount"]') as HTMLMetaElement)?.content;
                if (metaPrice) price = parseFloat(metaPrice.replace(',', '.'));
              }
              if (price <= 0) {
                const priceMatch = body.match(priceRe);
                price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;
              }
              const name = getText('h1') || getText('[data-id="product-title"]') || getText('[class*="product-title"]') || (document.querySelector('meta[property="og:title"]') as HTMLMetaElement)?.content || (document.title || '').trim().slice(0, 200);
              const img = document.querySelector('img[src*="ztat.net"], img[src*="img01"]') as HTMLImageElement | null;
              const imageUrl = img ? (img.src || img.getAttribute('data-src') || '') : '';
              const findLabel = (labels: string[]) => {
                for (const label of labels) {
                  const re = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*[:\\-]?\\s*([^\\n<]+)', 'i');
                  const m = body.match(re);
                  if (m) return m[1].trim().slice(0, 500);
                }
                return '';
              };
              const fromDtDd = (dtText: string) => {
                const dts = Array.from(document.querySelectorAll('dt, [class*="detail"], [class*="label"]'));
                for (const dt of dts) {
                  const t = (dt as HTMLElement).textContent || '';
                  if (new RegExp(dtText, 'i').test(t)) {
                    const next = dt.nextElementSibling;
                    if (next) return (next as HTMLElement).textContent?.trim().slice(0, 500) || '';
                  }
                }
                return '';
              };
              const composition = fromDtDd('composition|matière|material') || findLabel(['Composition', 'Composizione', 'Zusammensetzung', 'Materiaal', 'Material']);
              const care = fromDtDd('entretien|care|pflege') || findLabel(['Entretien', 'Consigli per la cura', 'Pflegehinweise', 'Verzorging', 'Care']);
              const color = fromDtDd('couleur|color|farbe') || findLabel(['Couleur', 'Colore', 'Farbe', 'Kleur', 'Color']);
              const sizes = fromDtDd('taille|size|größe') || findLabel(['Tailles?', 'Taglie', 'Größen', 'Maat', 'Size']);
              const origin = fromDtDd('origine|origin|herkunft') || findLabel(['Pays d\'origine', 'Origine', 'Herkunftsland', 'Country of origin']);
              const artNum = fromDtDd('article|nummer|style') || findLabel(['Numéro d\'article', 'Article', 'Artikelnummer', 'Artikelnr', 'Style']);
              return {
                name: name.slice(0, 200),
                price,
                imageUrl: imageUrl && imageUrl.startsWith('http') ? imageUrl : imageUrl ? 'https:' + imageUrl : null,
                sourceUrl: window.location.href,
                marketZone,
                brand,
                segment: seg,
                composition: composition || null,
                careInstructions: care || null,
                color: color || null,
                sizes: sizes || null,
                countryOfOrigin: origin || null,
                articleNumber: artNum || null,
              };
            },
            source.marketZone,
            source.brand,
            source.segment ?? 'femme'
          ) as HybridScrapedItem;
          if (enriched.name && enriched.name.length > 2 && !isExcludedProduct(enriched.name, source.excludeKeywords)) {
            if (enriched.price <= 0) {
              const priceRe = /\b(\d{1,3}[,.]\d{2})\s*[€$£]?/;
              const pm = await page.evaluate(() => (document.body && document.body.textContent) || '').then((t) => t.match(priceRe));
              if (pm) enriched.price = parseFloat(pm[1].replace(',', '.'));
            }
            allItems.push({
              ...enriched,
              sourceUrl: productUrl,
              trendGrowthPercent: cardTrendPercent ?? null,
              trendLabel: cardTrendLabel ?? null,
            });
          }
            } catch (_) {
              /* skip failed product */
            }
          }
        } catch (_) {
          /* skip failed trend page */
        }
      }
      await browser.close();
      return allItems.slice(0, source.limit).map((p) => ({ ...p, segment: source.segment }));
    }

    const trendLinks = await page.evaluate(`
      (function() {
        var links = [];
        var seen = {};
        var as = document.querySelectorAll('a[href*="/trend-spotter/trend-details/"]');
        for (var i = 0; i < as.length; i++) {
          var h = as[i].href || as[i].getAttribute('href') || '';
          if (h && h.indexOf('trend-details') !== -1 && !seen[h]) {
            seen[h] = true;
            links.push(h);
          }
        }
        return links;
      })()
    `) as string[];

    const uniqueLinks = [...new Set(trendLinks)].slice(0, maxTrendPages);
    if (uniqueLinks.length === 0) {
      await browser.close();
      console.log('[Hybrid Radar] Zalando Trend Spotter: aucun lien trend-details trouvé');
      return [];
    }
    console.log(`[Hybrid Radar] Zalando: ${uniqueLinks.length} pages trend-details à scraper`);

    const allItems: HybridScrapedItem[] = [];
    const seenUrls = new Set<string>();

    for (const trendUrl of uniqueLinks) {
      try {
        await page.goto(trendUrl, { waitUntil: 'load', timeout: 25000 });
        await new Promise((r) => setTimeout(r, 6000));

        const extracted = await page.evaluate(
          (marketZone: string, brand: string, seg: string) => {
            const priceRe = /[\d,]+\.?\d*/;
            const firstPriceRe = /\b(\d{1,3}[,.]\d{2})\s*[€$£]?/;
            const articles = Array.from(document.querySelectorAll('article'));
            return articles.map((el: Element) => {
              const linkEl = el.querySelector('a[href*="zalando.fr"]');
              const href = linkEl && (linkEl as HTMLAnchorElement).href ? (linkEl as HTMLAnchorElement).href : '';
              if (!href || href.indexOf('faq') !== -1 || href.indexOf('corporate') !== -1 || href.indexOf('apps.') !== -1 || href.indexOf('.html') === -1) return null;
              const nameEl = el.querySelector('h3');
              let name = (nameEl && (nameEl as HTMLElement).textContent ? (nameEl as HTMLElement).textContent : '').trim().replace(/\s+/g, ' ').slice(0, 200);
              const imgEl = el.querySelector('img[src*="ztat.net"], img[src*="img01"]');
              if (imgEl && (imgEl as HTMLImageElement).alt && !name) name = ((imgEl as HTMLImageElement).alt || '').trim().slice(0, 200);
              const text = (el as HTMLElement).textContent || '';
              const priceMatch = text.match(firstPriceRe);
              let price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;
              if (price <= 0) { const pm = text.match(priceRe); if (pm) price = parseFloat(pm[0].replace(',', '.')); }
              let imageUrl: string | null = null;
              if (imgEl) {
                const img = imgEl as HTMLImageElement;
                imageUrl = img.src || img.getAttribute('data-src') || null;
                if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
              }
              return { name, price, imageUrl, sourceUrl: href, marketZone, brand, segment: seg };
            }).filter((p: { name: string; price: number; imageUrl: string | null; sourceUrl: string } | null) => p && p.name && p.name.length > 2 && p.price > 0 && p.sourceUrl);
          },
          source.marketZone,
          source.brand,
          source.segment ?? 'homme'
        ) as HybridScrapedItem[];

        for (const p of extracted) {
          if (p.sourceUrl && !seenUrls.has(p.sourceUrl)) {
            seenUrls.add(p.sourceUrl);
            allItems.push(p);
          }
        }
      } catch (_) {
        /* skip failed trend page */
      }
    }

    await browser.close();
    const withoutExcluded = allItems.filter((p) => !isExcludedProduct(p.name, source.excludeKeywords));
    if (allItems.length !== withoutExcluded.length) {
      console.log(`[Hybrid Radar] Zalando: ${allItems.length} bruts → ${withoutExcluded.length} après exclusions`);
    }
    return withoutExcluded.slice(0, source.limit).map((p) => ({
      ...p,
      sourceUrl: p.sourceUrl || listUrl,
      segment: source.segment,
    }));
  } catch (err) {
    if (browser) await browser.close();
    console.error('[Hybrid Radar] Zalando Trend Spotter:', err);
    return [];
  }
}

export async function scrapeHybridSource(
  source: HybridRadarSource
): Promise<HybridScrapedItem[]> {
  if (source.brand === 'Zalando' && source.newInPath.includes('trend-spotter')) {
    return scrapeZalandoTrendSpotter(source);
  }

  const fullUrl = `${source.baseUrl}${source.newInPath}`;
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(fullUrl, {
      waitUntil: 'load',
      timeout: 30000,
    });

    const initialWait = source.initialWaitMs ?? 7000;
    await new Promise((r) => setTimeout(r, initialWait));

    const preScrollSteps = source.preScrollSteps ?? 0;
    if (preScrollSteps > 0) {
      const getHeight = new Function('return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);') as () => number;
      const scrollTo = new Function('y', 'window.scrollTo(0, y);') as (y: number) => void;
      for (let s = 1; s <= preScrollSteps; s++) {
        const maxH = await page.evaluate(getHeight);
        await page.evaluate(scrollTo, Math.round((maxH * s) / preScrollSteps));
        await new Promise((r) => setTimeout(r, 2500));
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    const evalArgs = [
      source.selectors.products,
      source.selectors.name,
      source.selectors.price,
      source.selectors.image,
      source.marketZone,
      source.brand,
      source.segment,
    ] as const;

    // Fonction d'extraction en chaîne pour éviter transformation par tsx/bundler (__name)
    const extractProductsFn = `
      function getUrlFromImg(img) {
        if (!img) return null;
        var s = img.src || img.getAttribute('src');
        var badRe = new RegExp('placeholder|1x1|blank|data:image\\\\/svg', 'i');
        if (s && typeof s === 'string' && s.indexOf('http') === 0 && !badRe.test(s)) return s;
        var d = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-image-url');
        if (d && typeof d === 'string' && d.indexOf('http') === 0) return d;
        var set = img.getAttribute('srcset') || img.getAttribute('data-srcset');
        if (set) { var first = set.split(',')[0].trim().split(/\\\\s+/)[0]; if (first && first.indexOf('http') === 0) return first; }
        if (s && typeof s === 'string' && s.indexOf('http') === 0) return s;
        return null;
      }
      var products = Array.from(document.querySelectorAll(prodSel)).slice(0, 120);
      if (products.length === 0) return [];
      return products.map(function(el) {
        var nameEl = el.querySelector(nameSel) || el.querySelector('h2, h3, [class*="title"], [class*="name"], a');
        var priceEl = el.querySelector(priceSel) || el.querySelector('[class*="price"], [class*="Price"]');
        var linkEl = el.querySelector('a[href*="/prd/"]') || el.querySelector('a') || el.closest && el.closest('a');
        var productName = (nameEl && nameEl.textContent ? nameEl.textContent : '').trim().slice(0, 200);
        var priceText = priceEl && priceEl.textContent ? priceEl.textContent.trim() : '';
        var priceRe = /[\\d,]+\\.?\\d*/;
        var priceMatch = priceText.match(priceRe);
        var price = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;
        if (price <= 0) {
          var dataPriceEl = el.querySelector('[data-price], [data-testid*="price"], [data-auto-id*="price"]');
          if (dataPriceEl) {
            var dataPrice = dataPriceEl.getAttribute('data-price') || (dataPriceEl.textContent || '').trim();
            var dataMatch = dataPrice.match(priceRe);
            if (dataMatch) price = parseFloat(dataMatch[0].replace(',', '.'));
          }
        }
        if (price <= 0 && el.textContent) {
          var cardRe = /\\b(\\d{1,3}[,.]\\d{2})\\s*[€$£]?/;
          var cardMatch = el.textContent.match(cardRe);
          if (cardMatch) price = parseFloat(cardMatch[1].replace(',', '.'));
        }
        if (price <= 0 && el.innerText) {
          var anyPriceRe = /(\\d{1,4}[,.]\\d{2})/;
          var anyMatch = el.innerText.match(anyPriceRe);
          if (anyMatch) {
            var val = parseFloat(anyMatch[1].replace(',', '.'));
            if (val >= 1 && val <= 5000) price = val;
          }
        }
        if (price <= 0) {
          var withEuro = el.querySelectorAll('*');
          for (var w = 0; w < withEuro.length && price <= 0; w++) {
            var t = (withEuro[w].textContent || '').trim();
            if (t.indexOf('€') !== -1 && t.length < 30) {
              var euroMatch = t.match(/(\\d{1,4}[,.]\\d{2})/);
              if (euroMatch) {
                var v = parseFloat(euroMatch[1].replace(',', '.'));
                if (v >= 1 && v <= 5000) price = v;
              }
            }
          }
        }
        var imageUrl = null;
        var imgs = el.querySelectorAll(imgSel + ', img');
        for (var i = 0; i < imgs.length; i++) { imageUrl = getUrlFromImg(imgs[i]); if (imageUrl) break; }
        if (!imageUrl) {
          var pictureSource = el.querySelector('picture source[srcset], picture source[data-srcset]');
          if (pictureSource) {
            var set = pictureSource.getAttribute('srcset') || pictureSource.getAttribute('data-srcset');
            if (set) { var first = set.split(',')[0].trim().split(/\\\\s+/)[0]; if (first && first.indexOf('http') === 0) imageUrl = first; }
          }
        }
        if (!imageUrl) {
          var dataEl = el.querySelector('[data-image-url], [data-src]');
          if (dataEl) { var u = dataEl.getAttribute('data-image-url') || dataEl.getAttribute('data-src'); if (u && u.indexOf('http') === 0) imageUrl = u; }
        }
        if (!productName && imgs.length && imgs[0] && imgs[0].alt) productName = (imgs[0].alt || '').trim().slice(0, 200);
        var sourceUrl = (linkEl && linkEl.href) || '';
        return { name: productName, price: price, imageUrl: imageUrl, sourceUrl: sourceUrl, marketZone: marketZone, brand: brand, segment: segment };
      }).filter(function(p) { return p.name && p.name.length > 2 && (p.price > 0 || p.imageUrl); });
    `;

    const runExtractProducts = new Function(
      'prodSel', 'nameSel', 'priceSel', 'imgSel', 'marketZone', 'brand', 'segment',
      extractProductsFn
    ) as (a: string, b: string, c: string, d: string, e: string, f: string, g: string | undefined) => HybridScrapedItem[];

    let rawA = await page.evaluate(runExtractProducts, ...evalArgs);

    const getScrollHeightFn = new Function('return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);');
    const maxScroll = await page.evaluate(getScrollHeightFn as () => number);

    const scrollToFn = new Function('y', 'window.scrollTo(0, y);');
    const collectSteps = 45;
    const collectTarget = Math.min(source.limit + 150, 280);
    const seenUrls = new Set((rawA as HybridScrapedItem[]).map((p) => p.sourceUrl));

    for (let step = 1; step <= collectSteps && (rawA as HybridScrapedItem[]).length < collectTarget; step++) {
      await page.evaluate(scrollToFn as (y: number) => void, Math.round((maxScroll * step) / collectSteps));
      await new Promise((r) => setTimeout(r, 4000));
      const batch = await page.evaluate(runExtractProducts, ...evalArgs);
      for (const p of batch as HybridScrapedItem[]) {
        if (p.sourceUrl && !seenUrls.has(p.sourceUrl)) {
          seenUrls.add(p.sourceUrl);
          (rawA as HybridScrapedItem[]).push(p);
        }
      }
    }
    rawA = (rawA as HybridScrapedItem[]).slice(0, collectTarget);

    const imageMap = new Map<string, string>();
    const getUrlFromImgBody = `
      function getUrlFromImg(img) {
        if (!img) return null;
        var s = img.src || img.getAttribute('src');
        var badRe = new RegExp('placeholder|1x1|blank|data:image\\\\/svg', 'i');
        if (s && typeof s === 'string' && s.indexOf('http') === 0 && !badRe.test(s)) return s;
        var d = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-image-url');
        if (d && typeof d === 'string' && d.indexOf('http') === 0) return d;
        var set = img.getAttribute('srcset') || img.getAttribute('data-srcset');
        if (set) { var first = set.split(',')[0].trim().split(/\\\\s+/)[0]; if (first && first.indexOf('http') === 0) return first; }
        return s && typeof s === 'string' && s.indexOf('http') === 0 ? s : null;
      }
      var products = Array.from(document.querySelectorAll(prodSel)).slice(0, 200);
      return products.map(function(el) {
        var linkEl = el.querySelector('a[href*="/prd/"]') || el.querySelector('a') || (el.closest && el.closest('a'));
        var sourceUrl = (linkEl && linkEl.href) || '';
        var imageUrl = null;
        var imgs = el.querySelectorAll(imgSel + ', img');
        for (var i = 0; i < imgs.length; i++) { imageUrl = getUrlFromImg(imgs[i]); if (imageUrl) break; }
        if (!imageUrl) {
          var pictureSource = el.querySelector('picture source[srcset], picture source[data-srcset]');
          if (pictureSource) {
            var set = pictureSource.getAttribute('srcset') || pictureSource.getAttribute('data-srcset');
            if (set) { var first = set.split(',')[0].trim().split(/\\\\s+/)[0]; if (first && first.indexOf('http') === 0) imageUrl = first; }
          }
        }
        if (!imageUrl) {
          var dataEl = el.querySelector('[data-image-url], [data-src]');
          if (dataEl) { var u = dataEl.getAttribute('data-image-url') || dataEl.getAttribute('data-src'); if (u && u.indexOf('http') === 0) imageUrl = u; }
        }
        return { sourceUrl: sourceUrl, imageUrl: imageUrl };
      });
    `;
    const runExtractImagesOnly = new Function(
      'prodSel', 'imgSel',
      getUrlFromImgBody
    ) as (a: string, b: string) => { sourceUrl: string; imageUrl: string | null }[];

    const scrollSteps = 15;
    for (let step = 0; step < scrollSteps; step++) {
      const y = Math.round((maxScroll * (step + 1)) / scrollSteps);
      await page.evaluate(scrollToFn as (y: number) => void, y);
      await new Promise((r) => setTimeout(r, 3500));
      const afterScroll = await page.evaluate(
        runExtractImagesOnly,
        source.selectors.products,
        source.selectors.image
      );
      for (const p of afterScroll as { sourceUrl: string; imageUrl: string | null }[]) {
        if (p.sourceUrl && p.imageUrl) imageMap.set(p.sourceUrl, p.imageUrl);
      }
    }

    await page.evaluate(new Function('', 'window.scrollTo(0, document.body.scrollHeight);') as () => void);
    await new Promise((r) => setTimeout(r, 4000));
    const lastPass = await page.evaluate(
      runExtractImagesOnly,
      source.selectors.products,
      source.selectors.image
    );
    for (const p of lastPass as { sourceUrl: string; imageUrl: string | null }[]) {
      if (p.sourceUrl && p.imageUrl) imageMap.set(p.sourceUrl, p.imageUrl);
    }

    for (const p of rawA as HybridScrapedItem[]) {
      if (!p.imageUrl && p.sourceUrl && imageMap.has(p.sourceUrl)) {
        p.imageUrl = imageMap.get(p.sourceUrl)!;
      }
    }

    const withoutExcluded = (rawA as HybridScrapedItem[]).filter(
      (p) => !isExcludedProduct(p.name, source.excludeKeywords)
    );
    const excludedCount = (rawA as HybridScrapedItem[]).length - withoutExcluded.length;
    if (excludedCount > 0) {
      console.log(`[Hybrid Radar] ${source.brand}: ${(rawA as HybridScrapedItem[]).length} bruts → ${withoutExcluded.length} après exclusions (${excludedCount} exclus)`);
    }
    const results = withoutExcluded.slice(0, source.limit);

    await browser.close();

    return results.map((p) => ({
      ...p,
      sourceUrl: p.sourceUrl || fullUrl,
      segment: source.segment,
    }));
  } catch (err) {
    if (browser) await browser.close();
    console.error(`[Hybrid Radar] Erreur ${source.brand} (${source.marketZone}):`, err);
    return [];
  }
}
