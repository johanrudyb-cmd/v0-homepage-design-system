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
  /** Prix avant promo (pour calcul markdown %) */
  originalPrice?: number | null;
  /** Taux remise % si en promo (scrapé ou calculé) */
  markdownPercent?: number | null;
  /** Rupture | Faible | OK (scrapé depuis la page) */
  stockOutRisk?: string | null;
  /** Marque de l'article (ex. Nike), pas le retailer (Zalando) — extraite sur la page produit */
  productBrand?: string | null;
}

/** Mots-clés pour exclure chaussures / baskets / chaussettes (vêtements uniquement). */
const EXCLUDE_SHOES_KEYWORDS = [
  'basket', 'baskets', 'chaussure', 'chaussures', 'sneaker', 'sneakers',
  'shoe', 'shoes', 'bottine', 'bottines', 'sandale', 'sandales', 'botte', 'bottes',
  'bottes de neige', 'botte de neige', 'escarpin', 'escarpins', 'running', 'trainer', 'trainers', 'footwear',
  'boot', 'boots', 'loafer', 'loafers', 'mule', 'mules', 'slip-on', 'tuff terra', 'snow boot',
  'chaussons', 'chausson', 'chaussette', 'chaussettes', 'sock', 'socks',
  'derby', 'derbies', 'ballerine', 'ballerines', 'mocassin', 'mocassins', 'bottillon', 'bottillons', 'richelieu', 'sabot', 'sabots',
  'talons', 'heels', 'clog', 'clogs', 'tennis', 'pantoufle', 'slippers',
];

/** Sous-vêtements et maillots de bain à exclure. */
const EXCLUDE_UNDERWEAR_KEYWORDS = [
  'sous-vêtement', 'sous-vetement', 'slip homme', 'slip femme', ' slip ', 'slip ',
  'boxer short', 'boxers short', 'boxeur', 'boxeurs', 'boxer ',
  'lot de boxer', 'lot boxer', 'lots de boxer', 'lots boxer', 'lot boxers',
  'caleçon', 'calecon', 'caleçons', 'calecons',
  'culotte homme', 'culotte femme', ' culotte', 'culotte ',
  'string homme', ' string ', 'string ',
  'brief ', 'underwear',
  'maillot de bain', 'maillot de bains', 'maillot bain', 'maillots de bain',
  'bikini', 'bikinis',
  'soutien-gorge', 'soutien gorge', 'brassière', 'brassiere', 'pyjama ', 'nuisette',
];

/** Sacs à exclure (pas "bag" seul : exclurait "baggy"). */
const EXCLUDE_BAG_KEYWORDS = [
  'sac à main', 'sac a main', 'sac à dos', 'sac a dos', 'sac bandoulière', 'sac bandouliere',
  'tote bag', 'backpack', 'portefeuille', 'porte-monnaie', 'porte monnaie',
  'cabas', 'sac cabas', 'shopping bag', 'sac shopping',
  ' sac ', 'sac à ', 'sac a ', 'sac main', 'sac ', ' sac',
  'bag ', ' bag ', ' bag', 'bags', 'handbag', 'handbags', 'clutch',
  'sacoche', 'shoulder bag', 'messenger bag', 'satchel', 'crossbody', 'waist bag', 'fanny pack', 'banane', 'bum bag',
  'pochette', 'wallet', 'purse', 'trousse', 'case',
];

/** Parfums à exclure. */
const EXCLUDE_PERFUME_KEYWORDS = [
  'parfum', 'parfums', 'perfume', 'perfumes', 'eau de toilette', 'eau de parfum',
  'fragrance', 'fragrances', 'flacon', 'spray', 'scent', 'cologne', 'mist', 'brume',
  ' edp', ' edt', 'edp ', 'edt ', ' eau ',
];

/** Accessoires à exclure (on garde vêtements uniquement). */
const EXCLUDE_ACCESSORIES_KEYWORDS = [
  'lunettes', 'lunette de soleil', 'montre', 'montres', 'ceinture', 'ceintures',
  'bijou', 'bijoux', 'accessoire', 'accessoires', 'accessories', 'necklace',
  'bracelet', 'bracelets', 'belt', 'watch', 'glasses', 'casquette', 'chapeau',
  'cap ', ' hat ', 'écharpe', 'echarpe', 'scarf', 'gants', 'gant ', ' gant ', 'gloves', 'glove', 'collier',
  'moufle', 'moufles', 'mitten', 'mittens',
  'bag bandoulière', 'sac bandoulière', 'autres accessoires', 'maroquinerie',
  'petite maroquinerie', 'cache-oreilles', 'cache oreilles',
  'sunglasses', 'eyewear', 'beanie', 'bonnet', 'tie', 'cravate', 'umbrella', 'parapluie',
  'casquettes', 'caps', 'hats', 'chapeaux', 'beret', 'bob ', 'bucket hat',
];

/** Bijoux et non-vêtements à exclure (vêtements uniquement). */
const EXCLUDE_JEWELRY_KEYWORDS = [
  'boucle d\'oreille', 'boucles d\'oreille', 'boucles d’oreilles', 'earring', 'earrings',
  'bague', 'bagues', 'ring ', 'rings ', 'pendentif', 'pendentifs', 'pendant',
  'broche', 'broches', 'pin ', 'jewelry', 'jewellery', 'parure', 'parures',
  'collier', 'necklace', 'bracelet', 'bracelets', 'anklet', 'chevillère', 'bijoux',
];

/** Pulls / sweats rouges à exclure (demande utilisateur). */
const EXCLUDE_RED_PULL_KEYWORDS = [
  'pull rouge', 'pull red', 'sweat rouge', 'sweat red', 'pullover rouge', 'pullover red',
  'rouge pull', 'red pull', 'rouge sweat', 'red sweat',
];

/** Électroménager / aspirateurs / équipements à exclure (vêtements uniquement). */
const EXCLUDE_EQUIPMENT_KEYWORDS = [
  'dyson', 'aspirateur', 'vacuum', 'équipement', 'equipment', 'gear', 'matériel',
  'électronique', 'electronic', 'gadget', 'device', 'appliance', 'mousse', 'foam',
  'yoga mat', 'tapis de yoga', 'dumbbells', 'haltères', 'poids',
];

/** Produits pour cheveux / capillaires à exclure (vêtements uniquement). */
const EXCLUDE_HAIR_KEYWORDS = [
  'produit pour cheveux', 'produit cheveux', 'produit capillaire', 'produits capillaires',
  'soin pour cheveux', 'soins pour cheveux', 'soin capillaire', 'soins capillaires', 'soin cheveux', 'soins cheveux',
  'hair product', 'hair care', 'hair mask', 'hair oil', 'hair serum', 'hair treatment',
  'shampoo', 'shampoing', 'conditioner', 'après-shampooing', 'apres-shampooing', 'after shampoo',
  'leave-in', 'leave in', 'masque cheveux', 'masque pour les cheveux', 'huile capillaire',
  'sérum capillaire', 'serum capillaire', 'coloration capillaire', 'teinture capillaire',
  'k18', 'brosse à cheveux', 'brosse cheveux', 'brush cheveux',
  'peigne', 'peigne à cheveux', 'peigne a cheveux', 'peigne cheveux', 'comb', 'hair comb',
  // Sets de cheveux, perruques, extensions
  'set de cheveux', 'sets de cheveux', 'set cheveux', 'sets cheveux',
  'extension de cheveux', 'extensions de cheveux', 'extension cheveux', 'extensions cheveux',
  'perruque', 'perruques', 'wig', 'wigs', 'postiche', 'postiches',
  'hair set', 'hair piece', 'hair pieces', 'hair extension', 'hair extensions',
  'mèche ', 'mèches ', 'meche ', 'meches ', 'closure',
];

/** Pochettes (porte-cartes, portefeuilles plats) à exclure (vêtements uniquement). */
const EXCLUDE_POCHETTE_KEYWORDS = [
  'pochette', 'pochettes', 'porte-cartes', 'porte cartes', 'portecartes',
  'card holder', 'cardholder', 'card case',
];

/** Marques non-vêtement à exclure (cosmétiques, beauté, soins) ou marques à retirer (ex. ASOS Design). */
const EXCLUDE_BRAND_KEYWORDS = [
  'asos design',
  'yope', 'nuxe', 'tangle teezer',
  'shiseido', 'i heart revolution', 'revolution beauty', 'korres',
  'maybelline', 'l\'oréal', 'loreal', 'estee lauder', 'estée lauder', 'clinique',
  'mac cosmetics', 'nyx', 'kiko', 'the ordinary', 'cerave', 'la roche-posay',
  'eucerin', 'bioderma', 'vichy', 'avène', 'caudalie', 'clarins', 'lancôme', 'lancome',
];

/** Cosmétiques / produits de beauté / savon / crème / brosse à exclure (vêtements uniquement). */
const EXCLUDE_COSMETICS_KEYWORDS = [
  'rouge à lèvres', 'rouge a levres', 'rouge à lèvre', 'rouge a levre',
  'lipstick', 'lip stick', 'gloss', 'lip gloss', 'gloss à lèvres', 'gloss a levres',
  'eyeshadow', 'fard', 'maquillage', 'mascara',
  'nail', 'vernis', 'crème', 'creme', 'cream', 'brush', 'brosse',
  'brosse à cheveux', 'brosse a cheveux', 'brosse cheveux', 'hair brush',
  'peigne', 'peigne à cheveux', 'peigne a cheveux', 'peigne cheveux', 'comb', 'hair comb',
  'lips', 'blush', 'highlighter', 'concealer', 'foundation', 'hydration mask',
  'repair mask', 'masque réparation',
  'savon', 'soap', 'savonnette', 'savons', 'bar soap', 'liquid soap',
  'produit de beauté', 'produits de beauté', 'beauté', 'beauty', 'cosmétique', 'cosmetic', 'cosmetics',
  'soin visage', 'soin corps', 'skincare', 'skin care', 'make-up', 'makeup', 'soin ', 'soins ',
  'sérum', 'serum', 'huile ', 'oil ', 'démaquillant', 'cleanser', 'tonique', 'moisturizer',
  'gel douche', 'shower gel', 'body wash', 'crayon à lèvres', 'crayon a levres', 'lip liner',
  'crayon yeux', 'eyeliner', 'correcteur', 'concealer', 'face mask', 'masque visage',
  'dentifrice', 'toothpaste', 'déodorant', 'deodorant', 'antiperspirant',
  'mousse à raser', 'shaving foam', 'gel', 'lait corps', 'body lotion',
];

/** Prix minimum plausible pour un vêtement (évite frais de livraison type 2,75 €). */
const MIN_CLOTHING_PRICE_EUR = 10;

/** Retire le nom de la marque du nom du produit (évite répétition type "Zalando - Nike T-shirt"). */
function stripBrandFromName(name: string, brand: string): string {
  if (!name || !brand) return name;
  const b = brand.trim();
  if (!b) return name;
  const escaped = b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let out = name.trim();
  const re = new RegExp(`^\\s*${escaped}\\s*[-–|:]\\s*|\\s*[-–|:]\\s*${escaped}\\s*$|\\s*${escaped}\\s*$|^\\s*${escaped}\\s*`, 'gi');
  out = out.replace(re, ' ').replace(/\s+/g, ' ').trim();
  return out || name;
}

export function isExcludedProduct(name: string, extraExcludeKeywords: string[] = []): boolean {
  const text = (name || '').toLowerCase();
  const all = [
    ...EXCLUDE_SHOES_KEYWORDS,
    ...EXCLUDE_UNDERWEAR_KEYWORDS,
    ...EXCLUDE_BAG_KEYWORDS,
    ...EXCLUDE_PERFUME_KEYWORDS,
    ...EXCLUDE_ACCESSORIES_KEYWORDS,
    ...EXCLUDE_JEWELRY_KEYWORDS,
    ...EXCLUDE_EQUIPMENT_KEYWORDS,
    ...EXCLUDE_HAIR_KEYWORDS,
    ...EXCLUDE_POCHETTE_KEYWORDS,
    ...EXCLUDE_BRAND_KEYWORDS,
    ...EXCLUDE_COSMETICS_KEYWORDS,
    ...EXCLUDE_RED_PULL_KEYWORDS,
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
      // BAN SECTIONS BEAUTE / COSMETIQUES
      if (h.indexOf('/beaute') !== -1 || h.indexOf('/beauty') !== -1 || h.indexOf('/cosmetique') !== -1 || h.indexOf('/parfum') !== -1 || h.indexOf('/soin') !== -1) return false;
      if (h.indexOf('/p/') === -1 && h.indexOf('/trend-spotter/trending-items/') === -1 && (h.indexOf('.html') === -1 || h.indexOf('zalando') === -1)) return false;
      return h.indexOf('zalando') !== -1 || h.indexOf('zalando.fr') !== -1 || h.charAt(0) === '/' && (h.indexOf('/p/') !== -1 || h.indexOf('/trend-spotter/trending-items/') !== -1);
    }
    var productLinkSel = 'a[href*="/p/"], a[href*="/trend-spotter/trending-items/"], a[href*="zalando.fr"][href*="/p/"], a[href*="zalando"][href*=".html"]';
    function extractFromCard(el, href) {
      var card = el.tagName === 'A' ? (el.closest('article, [class*="Article"], [class*="ProductCard"], [class*="product-card"], [class*="article"]') || el.parentElement || el) : el;
      var nameEl = card.querySelector('h3, h2, h4, [class*="name"], [class*="title"], [class*="Name"], [class*="Title"]');
      var name = (nameEl && nameEl.textContent ? nameEl.textContent : '').trim().replace(/\\s+/g, ' ').slice(0, 200);
      var imgSel = '[class*="z-nvg-catalog_articles-article-image"] img, img[src*="ztat"], img[src*="img01"], img[src*="zalando"], img[data-src*="ztat"], img';
      var imgEl = card.querySelector(imgSel);
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
      var links = Array.from(document.querySelectorAll('a[href*="/p/"]'));
      var seen = new Set();
      var cards = [];
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        var href = (a.href || '').trim();
        if (!href || !isOkHref(href) || seen.has(href)) continue;
        seen.add(href);
        var container = a.closest && a.closest('article, [class*="Article"], [class*="ProductCard"], [class*="product-card"], [class*="article"]');
        if (container && container.querySelector && container.querySelector('img')) { cards.push(container); continue; }
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
      if (p && p.sourceUrl && (p.name.length > 2 || p.imageUrl || p.price > 0)) out.push(p);
    }
    return out;
  `;
  const fn = new Function('marketZone', 'brand', 'seg', body) as (a: string, b: string, c: string) => HybridScrapedItem[];
  return page.evaluate(fn, source.marketZone, source.brand, source.segment ?? 'femme') as Promise<HybridScrapedItem[]>;
}

/** Lance un navigateur en mode furtif (Zalando uniquement). */
async function launchStealthBrowser(): Promise<Browser> {
  const puppeteerExtra = await import('puppeteer-extra');
  const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
  puppeteerExtra.default.use(StealthPlugin());
  return puppeteerExtra.default.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--window-size=1280,800',
    ],
  }) as Promise<Browser>;
}

/** Scroll progressif type humain (déclenche lazy-load). fraction: 0 à 1 (ex. 0.5 = 50% de la page). */
async function humanLikeScroll(
  page: { evaluate: (fn: (fraction: number) => Promise<void>, fraction: number) => Promise<void> },
  fraction: number
): Promise<void> {
  await page.evaluate(
    async (targetFraction: number) => {
      const distance = 100;
      const interval = 100;
      const maxHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const target = maxHeight * Math.min(1, Math.max(0, targetFraction));
      await new Promise<void>((resolve) => {
        let total = 0;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          total += distance;
          if (total >= target) {
            clearInterval(timer);
            resolve();
          }
        }, interval);
      });
    },
    fraction
  );
}

/** Tente de fermer le bandeau cookies/consentement Zalando pour débloquer le contenu. */
async function dismissZalandoConsent(
  page: { evaluate: (fn: () => Promise<boolean>) => Promise<boolean> }
): Promise<boolean> {
  return page.evaluate(async () => {
    const sel =
      '[data-testid="uc-accept-all-button"], [data-testid="uc-accept-all"], button[class*="accept"], a[class*="accept"][class*="button"], [id*="accept-all"], [id*="acceptAll"]';
    let btn = document.querySelector(sel) as HTMLElement | null;
    if (btn) {
      btn.click();
      return true;
    }
    const buttons = Array.from(document.querySelectorAll('button, a[role="button"], [class*="uc-button"]'));
    for (let i = 0; i < buttons.length; i++) {
      const text = (buttons[i] as HTMLElement).textContent || '';
      if (/tout accepter|accept all|accepter tout|alles akzeptieren|accept/i.test(text)) {
        (buttons[i] as HTMLElement).click();
        return true;
      }
    }
    return false;
  });
}

/** Zalando Trend Spotter : page liste des tendances → extraction produits (prix, image, sourceUrl). */
async function scrapeZalandoTrendSpotter(source: HybridRadarSource): Promise<HybridScrapedItem[]> {
  const listUrl = `${source.baseUrl}${source.newInPath}`;
  const mainPageOnly = source.zalandoMainPageOnly === true;
  const maxTrendPages = 12;
  let browser: Browser | null = null;

  try {
    browser = await launchStealthBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(listUrl, { waitUntil: 'load', timeout: 60000 });
    const waitMs = source.initialWaitMs ?? 12000;
    await new Promise((r) => setTimeout(r, 5000));

    const consentClicked = await dismissZalandoConsent(page);
    if (consentClicked) {
      await new Promise((r) => setTimeout(r, 5000));
    }
    await new Promise((r) => setTimeout(r, Math.max(2000, waitMs - 5000)));

    await humanLikeScroll(page, 0.7);
    await new Promise((r) => setTimeout(r, 2000));

    try {
      await page.waitForSelector('a[href*="/p/"], a[href*="/trend-spotter/trending-items/"], article a[href*="/p/"], [class*="article"] a[href*="/p/"], [class*="ProductCard"] a[href*="/p/"]', { timeout: 25000 });
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
          var linksP = document.querySelectorAll('a[href*="/p/"], a[href*="/trend-spotter/trending-items/"]');
          var linksZ = document.querySelectorAll('a[href*="zalando.fr"]');
          var hrefs = [];
          for (var i = 0; i < Math.min(linksP.length, 5); i++) hrefs.push((linksP[i].href || linksP[i].getAttribute('href') || ''));
          return { nArticles: articles.length, nLinksP: linksP.length, nLinksZ: linksZ.length, sampleHrefs: hrefs };
        })()
      `) as { nArticles: number; nLinksP: number; nLinksZ: number; sampleHrefs: string[] };
      console.log(`[Hybrid Radar] Zalando (${source.id}): article(s)=${diag.nArticles}, lien(s) /p/=${diag.nLinksP}, lien(s) zalando.fr=${diag.nLinksZ}`);
      if (diag.sampleHrefs.length > 0) {
        console.log(`[Hybrid Radar] Zalando (${source.id}): ex. hrefs`, diag.sampleHrefs.slice(0, 2));
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
      const diagEnrich = await page.evaluate(`
        (function() {
          var articles = document.querySelectorAll('article');
          var linksP = document.querySelectorAll('a[href*="/p/"], a[href*="/trend-spotter/trending-items/"]');
          var linksZ = document.querySelectorAll('a[href*="zalando.fr"]');
          var hrefs = [];
          for (var i = 0; i < Math.min(linksP.length, 5); i++) hrefs.push((linksP[i].href || linksP[i].getAttribute('href') || ''));
          var linksInArticles = [];
          for (var j = 0; j < Math.min(articles.length, 5); j++) {
            var as = articles[j].querySelectorAll('a[href]');
            for (var k = 0; k < Math.min(as.length, 2); k++) {
              var a = as[k];
              linksInArticles.push({ href: a.href || '', attr: a.getAttribute('href') || '' });
            }
          }
          return { nArticles: articles.length, nLinksP: linksP.length, nLinksZ: linksZ.length, sampleHrefs: hrefs, linksInArticles: linksInArticles };
        })()
      `) as {
        nArticles: number;
        nLinksP: number;
        nLinksZ: number;
        sampleHrefs: string[];
        linksInArticles: Array<{ href: string; attr: string }>;
      };
      console.log(`[Hybrid Radar] Zalando (${source.id}): article(s)=${diagEnrich.nArticles}, lien(s) /p/ or trend=${diagEnrich.nLinksP}, lien(s) zalando.fr=${diagEnrich.nLinksZ}`);
      if (diagEnrich.linksInArticles.length > 0) {
        console.log(`[Hybrid Radar] Zalando (${source.id}): ex. liens dans articles`, diagEnrich.linksInArticles.slice(0, 5));
      }
      console.log(`[Hybrid Radar] Zalando (${source.id}): extraction uniquement depuis la page (${listUrl})`);
      const trendCityMatch = source.newInPath.match(/\/trend-spotter\/([^/?]+)/);
      const trendCity = trendCityMatch ? trendCityMatch[1] : null;
      /** Slugs alternatifs pour les liens trending-items (ex. Zalando utilise "kopenhagen" dans les liens pour Copenhague). */
      const TREND_CITY_LINK_ALIASES: Record<string, string[]> = {
        copenhagen: ['kopenhagen', 'koebenhavn'],
      };
      const citySlugs = trendCity ? [trendCity, ...(TREND_CITY_LINK_ALIASES[trendCity] ?? [])] : [];
      const genderSlug = source.segment === 'femme' ? 'women' : 'men';
      const headerId = source.segment === 'femme' ? 'WOMEN-header-id' : 'MEN-header-id';
      const isTrendCity = trendCity !== null;
      if (isTrendCity && citySlugs.length > 0) {
        try {
          const linkSelector = citySlugs
            .map((slug) => `a[href*="/trend-spotter/trending-items/${slug}/${genderSlug}"]`)
            .join(', ');
          await page.waitForSelector(`ol[aria-labelledby="${headerId}"], ${linkSelector}`, { timeout: 15000 });
          await new Promise((r) => setTimeout(r, 2000));
        } catch (_) {
          /* continuer */
        }
      }
      let extracted = await zalandoExtractFromPage(page, source);
      if (extracted.length === 0 && isTrendCity && citySlugs.length > 0) {
        const genderSlugJson = JSON.stringify(genderSlug);
        const headerIdJson = JSON.stringify(headerId);
        const citySlugsJson = JSON.stringify(citySlugs);
        let cardsFromSection = await page.evaluate(`
          (function() {
            var citySlugs = ${citySlugsJson};
            var genderSlug = ${genderSlugJson};
            var headerId = ${headerIdJson};
            var out = [];
            var ol = document.querySelector('ol[aria-labelledby="' + headerId + '"]');
            var links = [];
            if (ol) {
              var nl = ol.querySelectorAll('a[href*="/trend-spotter/trending-items/"]');
              for (var n = 0; n < nl.length; n++) links.push(nl[n]);
            }
            if (links.length === 0) {
              for (var s = 0; s < citySlugs.length; s++) {
                var more = document.querySelectorAll('a[href*="/trend-spotter/trending-items/' + citySlugs[s] + '/' + genderSlug + '"]');
                for (var m = 0; m < more.length; m++) links.push(more[m]);
              }
            }
            var seen = {};
            for (var i = 0; i < links.length; i++) {
              var a = links[i];
              var href = (a.href || a.getAttribute('href') || '').trim();
              var hasCity = citySlugs.some(function(s) { return href.indexOf(s) !== -1; });
              if (!href || href.indexOf('trending-items') === -1 || !hasCity || href.indexOf(genderSlug) === -1) continue;
              var pathKey = href.split('?')[0];
              if (seen[pathKey]) continue;
              seen[pathKey] = true;
              var card = a.closest('li') || a.closest('article') || a;
              var name = (a.getAttribute('aria-label') || '').trim();
              if (!name && card) {
                var otherA = card.querySelector('a[aria-label]');
                if (otherA) name = (otherA.getAttribute('aria-label') || '').trim();
              }
              if (!name && card) {
                var h3 = card.querySelector('h3');
                if (h3) {
                  var spans = h3.querySelectorAll('span');
                  var parts = [];
                  for (var s = 0; s < spans.length; s++) {
                    var t = (spans[s].textContent || '').trim();
                    if (t.length > 1) parts.push(t);
                  }
                  name = parts.join(' - ');
                }
              }
              if (!name && card) {
                var imgAlt = card.querySelector('img[alt]');
                if (imgAlt && imgAlt.alt) name = imgAlt.alt.trim();
              }
              var img = card.querySelector('img[src*="ztat"], img[src*="img01"], img');
              var imageUrl = img ? (img.src || img.getAttribute('src') || '') : '';
              if (imageUrl && imageUrl.indexOf('//') === 0) imageUrl = 'https:' + imageUrl;
              var text = (card.textContent || '').trim();
              var pctMatch = text.match(/\\+(\\d+)\\s*%/);
              var trendGrowthPercent = pctMatch ? parseInt(pctMatch[1], 10) : null;
              out.push({ name: (name || '').slice(0, 200), imageUrl: imageUrl || null, sourceUrl: href, trendGrowthPercent: trendGrowthPercent });
            }
            return out;
          })()
        `) as Array<{ name: string; imageUrl: string | null; sourceUrl: string; trendGrowthPercent: number | null }>;
        if (cardsFromSection.length > 0) {
          const asItems: HybridScrapedItem[] = cardsFromSection
            .slice(0, 16)
            .map((c) => ({
              name: c.name,
              price: 0,
              imageUrl: c.imageUrl,
              sourceUrl: c.sourceUrl.startsWith('http') ? c.sourceUrl : source.baseUrl + c.sourceUrl,
              brand: source.brand,
              marketZone: source.marketZone,
              segment: source.segment ?? 'homme',
              trendGrowthPercent: c.trendGrowthPercent ?? null,
              trendLabel: c.trendGrowthPercent != null ? 'Tendance' : null,
            }));
          const clothingFromCards = asItems.filter((p) => !isExcludedProduct(p.name, source.excludeKeywords));
          if (clothingFromCards.length > 0) {
            extracted = clothingFromCards;
            console.log(`[Hybrid Radar] Zalando (${source.id}): ${extracted.length} cartes, même flux que l'article 1 : scroll page principale → clic VOIR L'ARTICLE (index) → fiche produit → retour.`);
            const enriched: HybridScrapedItem[] = [];
            const maxToEnrich = Math.min(extracted.length, source.limit);
            await page.evaluate((hid) => {
              const ol = document.querySelector(`ol[aria-labelledby="${hid}"]`);
              if (ol) ol.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, headerId);
            await new Promise((r) => setTimeout(r, 1500));
            for (let step = 0; step <= 3; step++) {
              const maxH = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
              await page.evaluate((y) => window.scrollTo(0, y), Math.round((maxH * (step + 1)) / 4));
              await new Promise((r) => setTimeout(r, 1200));
            }
            await page.evaluate(() => window.scrollTo(0, 0));
            await new Promise((r) => setTimeout(r, 1000));
            for (let i = 0; i < maxToEnrich; i++) {
              const card = extracted[i];
              try {
                const clicked = await page.evaluate(
                  (index: number, hid: string) => {
                    const ol = document.querySelector(`ol[aria-labelledby="${hid}"]`);
                    if (!ol) return false;
                    const btns = Array.from(ol.querySelectorAll('a, button')).filter((el) =>
                      /voir\s*l['\u2019]?article|voir l'article/i.test((el as HTMLElement).textContent || '')
                    );
                    if (index >= btns.length) return false;
                    const btn = btns[index] as HTMLElement;
                    btn.scrollIntoView({ behavior: 'instant', block: 'center' });
                    btn.click();
                    return true;
                  },
                  i,
                  headerId
                );
                if (!clicked) {
                  if (card.name && !isExcludedProduct(card.name, source.excludeKeywords)) {
                    enriched.push({ ...card, name: stripBrandFromName(card.name, source.brand) });
                  }
                  continue;
                }
                await Promise.race([
                  page.waitForNavigation({ waitUntil: 'load', timeout: 22000 }).catch(() => { }),
                  new Promise((r) => setTimeout(r, 12000)),
                ]);
                await new Promise((r) => setTimeout(r, 2500));
                const productUrl = page.url();
                const isProductPage = productUrl.indexOf('/p/') !== -1 || productUrl.indexOf('.html') !== -1;
                if (!isProductPage) {
                  await page.goto(listUrl, { waitUntil: 'load', timeout: 25000 });
                  await new Promise((r) => setTimeout(r, 2000));
                  if (card.name && !isExcludedProduct(card.name, source.excludeKeywords)) {
                    enriched.push({ ...card, name: stripBrandFromName(card.name, source.brand) });
                  }
                  continue;
                }
                const productData = await page.evaluate(`
                    (function() {
                      var main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
                      var recos = Array.from(main.querySelectorAll('section, div[class*="section"]')).find(function(s) {
                        return (s.textContent || '').indexOf('NOUS VOUS RECOMMANDONS') !== -1 || (s.textContent || '').indexOf('recommandons') !== -1;
                      });
                      var mainContent = recos ? main : main;
                      var exclude = recos ? recos : null;
                      function inExclude(el) {
                        if (!exclude || !el) return false;
                        return exclude.contains(el);
                      }
                      var name = '';
                      var h1 = mainContent.querySelector('h1');
                      if (h1 && !inExclude(h1)) name = (h1.textContent || '').trim();
                      if (!name) {
                        var meta = document.querySelector('meta[property="og:title"]');
                        if (meta) name = (meta.getAttribute('content') || '').trim();
                      }
                      var priceRe = /\\b(\\d{1,3}[,.]\\d{2})\\s*[€$£]?/;
                      var priceReLoose = /(\\d{1,4}[,.]\\d{2})\\s*[€$£]?|[€$£]\\s*(\\d{1,4}[,.]\\d{2})/;
                      var priceOnlyRe = /^\\s*\\d{1,3}[,.]\\d{2}\\s*[€$£]?\\s*$/;
                      var price = 0;
                      var MIN = 10;
                      var zalandoPriceSpans = mainContent.querySelectorAll('span[class*="65i7kZ"], span[class*="Sb5G3D"], span[class*="Km7l2y"]');
                      for (var z = 0; z < zalandoPriceSpans.length && price < MIN; z++) {
                        var raw = (zalandoPriceSpans[z].textContent || '').replace(/\\u00a0/g, ' ').trim();
                        if (priceOnlyRe.test(raw) || priceRe.test(raw)) {
                          var mm = raw.match(priceRe);
                          if (mm) { var v = parseFloat(mm[1].replace(',', '.')); if (v >= MIN && v <= 5000) price = v; }
                        }
                      }
                      if (price < MIN) {
                        var allSpans = mainContent.querySelectorAll('span');
                        for (var s = 0; s < Math.min(allSpans.length, 150) && price < MIN; s++) {
                          var txt = (allSpans[s].textContent || '').replace(/\\u00a0/g, ' ').trim();
                          if (txt.length > 4 && txt.length < 25 && priceRe.test(txt) && !/livraison|frais|dès|à partir/i.test(txt)) {
                            var mm = txt.match(priceRe);
                            if (mm) { var v = parseFloat(mm[1].replace(',', '.')); if (v >= MIN && v <= 5000) price = v; }
                          }
                        }
                      }
                      var titleBlock = h1 && !inExclude(h1) && (h1.parentElement || h1.nextElementSibling);
                      if (titleBlock) {
                        var zones = [titleBlock];
                        if (h1.parentElement) zones.push(h1.parentElement);
                        if (h1.nextElementSibling) zones.push(h1.nextElementSibling);
                        if (h1.parentElement && h1.parentElement.nextElementSibling) zones.push(h1.parentElement.nextElementSibling);
                        for (var z = 0; z < zones.length && price < MIN; z++) {
                          var blockText = (zones[z].textContent || '').trim();
                          if (/livraison|frais|dès|à partir|gratuite/i.test(blockText)) continue;
                          var m = blockText.match(priceRe);
                          if (m) {
                            var v = parseFloat(m[1].replace(',', '.'));
                            if (v >= MIN && v <= 5000) price = v;
                          }
                        }
                      }
                      if (price < MIN) {
                      var priceEls = mainContent.querySelectorAll('[class*="price"], [class*="Price"], [data-testid*="price"], [data-id*="price"], [data-auto-id*="price"], [itemprop="price"]');
                      for (var i = 0; i < priceEls.length; i++) {
                        if (inExclude(priceEls[i])) continue;
                        var t = (priceEls[i].textContent || '').trim();
                        if (/avant|was|from|dès|livraison|frais|à partir|shipping/i.test(t)) continue;
                        var m = t.match(priceRe);
                        if (m) { price = parseFloat(m[1].replace(',', '.')); if (price >= MIN && price <= 5000) break; }
                      }
                      if (price < MIN) {
                        var metaPrice = document.querySelector('meta[property="product:price:amount"]');
                        if (metaPrice && metaPrice.getAttribute('content')) { var v = parseFloat(metaPrice.getAttribute('content').replace(',', '.')); if (v >= MIN) price = v; }
                      }
                      if (price < MIN) {
                        var ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
                        for (var s = 0; s < ldScripts.length; s++) {
                          try {
                            var json = JSON.parse(ldScripts[s].textContent || '{}');
                            var offers = json.offers || (json['@graph'] && Array.isArray(json['@graph']) ? json['@graph'].find(function(n) { return n && n.offers; }) : null);
                            if (offers) offers = offers.offers || offers;
                            var amt = (offers && offers.price) || (offers && Array.isArray(offers) && offers[0] && offers[0].price);
                            if (typeof amt === 'number' && amt >= MIN) { price = amt; break; }
                            if (typeof amt === 'string') { var p = parseFloat(amt.replace(',', '.')); if (p >= MIN) { price = p; break; } }
                          } catch (e) {}
                        }
                      }
                      if (price < MIN) {
                        var mainText = (mainContent.textContent || '').trim();
                        var re = /\\b(\\d{1,3}[,.]\\d{2})\\s*[€$£]?/g;
                        var match;
                        while ((match = re.exec(mainText)) !== null) {
                          var v = parseFloat(match[1].replace(',', '.'));
                          if (v < MIN || v > 5000) continue;
                          var start = Math.max(0, match.index - 55);
                          var ctx = mainText.slice(start, match.index + 25).toLowerCase();
                          if (/livraison|frais|shipping|dès|à partir|gratuite/.test(ctx)) continue;
                          price = v;
                          break;
                        }
                      }
                      if (price < MIN) {
                        var withEuro = mainContent.querySelectorAll('[class*="price"], span, div, p');
                        for (var w = 0; w < Math.min(withEuro.length, 80) && price < MIN; w++) {
                          var t = (withEuro[w].textContent || '').trim();
                          if (t.indexOf('€') !== -1 && t.length < 40 && !/livraison|frais|shipping/i.test(t)) {
                            var loose = t.match(priceReLoose);
                            if (loose) {
                              var v = parseFloat((loose[1] || loose[2] || '').replace(',', '.'));
                              if (v >= MIN && v <= 5000) price = v;
                            }
                          }
                        }
                      }
                      }
                      var imageUrl = null;
                      var imgs = mainContent.querySelectorAll('img[src*="ztat"], img[src*="img01"]');
                      for (var j = 0; j < imgs.length; j++) {
                        if (inExclude(imgs[j])) continue;
                        var src = imgs[j].src || imgs[j].getAttribute('data-src') || '';
                        if (src.indexOf('packshot') !== -1 || src.indexOf('filter=packshot') !== -1) {
                          imageUrl = src; break;
                        }
                      }
                      if (!imageUrl && imgs.length > 0) {
                        for (var k = 0; k < imgs.length; k++) {
                          if (inExclude(imgs[k])) continue;
                          var s = imgs[k].src || imgs[k].getAttribute('data-src') || '';
                          if (s && s.indexOf('ztat') !== -1) { imageUrl = s; break; }
                        }
                      }
                      if (imageUrl && imageUrl.indexOf('//') === 0) imageUrl = 'https:' + imageUrl;
                      return { name: name.slice(0, 200), price: price, imageUrl: imageUrl };
                    })()
                  `) as { name: string; price: number; imageUrl: string | null };
                let finalPrice = productData.price ?? 0;
                if (finalPrice < MIN_CLOTHING_PRICE_EUR) {
                  const bodyPrice = await page.evaluate(() => {
                    var body = (document.body && document.body.textContent) || '';
                    var re = /\\b(\\d{1,3}[,.]\\d{2})\\s*[€$£]?/g;
                    var match;
                    while ((match = re.exec(body)) !== null) {
                      var v = parseFloat(match[1].replace(',', '.'));
                      if (v < 10 || v > 5000) continue;
                      var start = Math.max(0, match.index - 55);
                      var ctx = body.slice(start, match.index + 25).toLowerCase();
                      if (/livraison|frais|shipping|dès|à partir|gratuite/.test(ctx)) continue;
                      return v;
                    }
                    return 0;
                  }) as number;
                  if (bodyPrice >= MIN_CLOTHING_PRICE_EUR) finalPrice = bodyPrice;
                }
                const rawName = (productData.name || card.name).trim() || card.name;
                const finalName = stripBrandFromName(rawName, source.brand);
                if (!isExcludedProduct(finalName, source.excludeKeywords)) {
                  enriched.push({
                    ...card,
                    name: finalName,
                    price: finalPrice,
                    imageUrl: productData.imageUrl || card.imageUrl,
                    sourceUrl: productUrl,
                  });
                }
                await page.goto(listUrl, { waitUntil: 'load', timeout: 25000 });
                await new Promise((r) => setTimeout(r, 2000));
              } catch (_) {
                if (card.name && !isExcludedProduct(card.name, source.excludeKeywords)) {
                  enriched.push({ ...card, name: stripBrandFromName(card.name, source.brand) });
                }
                try {
                  await page.goto(listUrl, { waitUntil: 'load', timeout: 25000 });
                  await new Promise((r) => setTimeout(r, 2000));
                } catch (_) { }
              }
            }
            extracted = enriched;
          }
        }
        if (isTrendCity && citySlugs.length > 0 && extracted.length === 0) {
          const diag = await page.evaluate(
            (slugs: string[], slug: string, hid: string) => {
              const ol = document.querySelector(`ol[aria-labelledby="${hid}"]`);
              let count = 0;
              for (const city of slugs) {
                count += document.querySelectorAll(`a[href*="/trend-spotter/trending-items/${city}/${slug}"]`).length;
              }
              return { hasOl: !!ol, trendingItemsCount: count };
            },
            citySlugs,
            genderSlug,
            headerId
          );
          console.log(`[Hybrid Radar] Zalando (${source.id}): 0 cartes — ol ${headerId} présent: ${diag.hasOl}, liens trending-items/${citySlugs.join('|')}/${genderSlug}: ${diag.trendingItemsCount}`);
        }
      }
      if (extracted.length === 0 && !isTrendCity) {
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
      if (extracted.length === 0 && !isTrendCity) {
        const filterBySegment = isTrendCity && source.segment;
        const segmentFilter = source.segment === 'femme' ? 'femme' : 'homme';
        let trendDetailsLinks = await page.evaluate(
          (filterSeg: boolean, seg: string) => {
            const links: string[] = [];
            const seen: Record<string, boolean> = {};
            const as = document.querySelectorAll('a[href*="/trend-spotter/trend-details/"]');
            for (let i = 0; i < as.length; i++) {
              const a = as[i];
              if (filterSeg) {
                const section = a.closest('section') || a.closest('[class*="section"]') || a.closest('[class*="Section"]') || a.closest('div[class*="gender"]') || a.closest('main');
                const sectionText = section ? (section.textContent || '') : '';
                const isFemme = seg === 'femme';
                const matchFemme = sectionText.indexOf('femmes tendance') !== -1 || sectionText.indexOf('Femme') !== -1 || sectionText.indexOf('Women') !== -1 || sectionText.indexOf('women') !== -1;
                const matchHomme = sectionText.indexOf('hommes tendance') !== -1 || sectionText.indexOf('Homme') !== -1 || sectionText.indexOf('Men') !== -1 || sectionText.indexOf('men') !== -1;
                if (isFemme && !matchFemme) continue;
                if (!isFemme && !matchHomme) continue;
              }
              const h = (a as HTMLAnchorElement).href || a.getAttribute('href') || '';
              if (h && h.indexOf('trend-details') !== -1 && !seen[h]) {
                seen[h] = true;
                links.push(h);
              }
            }
            return links;
          },
          filterBySegment,
          segmentFilter
        ) as string[];
        if (isTrendCity && trendDetailsLinks.length === 0) {
          trendDetailsLinks = await page.evaluate(`
            (function() {
              var links = [];
              var seen = {};
              var as = document.querySelectorAll('a[href*="/trend-spotter/trend-details/"]');
              for (var i = 0; i < as.length; i++) {
                var h = as[i].href || as[i].getAttribute('href') || '';
                if (h && h.indexOf('trend-details') !== -1 && !seen[h]) { seen[h] = true; links.push(h); }
              }
              return links;
            })()
          `) as string[];
        }
        const uniqueTrendDetails = [...new Set(trendDetailsLinks)].slice(0, isTrendCity ? 16 : 12);
        if (uniqueTrendDetails.length > 0) {
          console.log(`[Hybrid Radar] Zalando (${source.id}): 0 sur page principale → visite de ${uniqueTrendDetails.length} pages trend-details${isTrendCity ? ' (1 produit vêtement par carte, max 16)' : ''}`);
          const seenUrls = new Set<string>();
          for (const trendUrl of uniqueTrendDetails) {
            if (extracted.length >= source.limit) break;
            try {
              await page.goto(trendUrl, { waitUntil: 'load', timeout: 25000 });
              await new Promise((r) => setTimeout(r, 6000));
              const fromSub = await zalandoExtractFromPage(page, source);
              if (isTrendCity) {
                const clothingOnly = fromSub.filter((p) => !isExcludedProduct(p.name, source.excludeKeywords));
                const firstClothing = clothingOnly.find((p) => p.sourceUrl && !seenUrls.has(p.sourceUrl));
                if (firstClothing?.sourceUrl) {
                  seenUrls.add(firstClothing.sourceUrl);
                  extracted.push(firstClothing);
                }
              } else {
                for (const p of fromSub) {
                  if (p.sourceUrl && !seenUrls.has(p.sourceUrl)) {
                    seenUrls.add(p.sourceUrl);
                    extracted.push(p);
                  }
                }
              }
            } catch (_) {
              /* skip failed trend-details page */
            }
          }
          if (extracted.length > 0) {
            console.log(`[Hybrid Radar] Zalando (${source.id}): ${extracted.length} produits extraits des pages trend-details`);
          }
        }
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
          trendGrowthPercent: trend?.trendGrowthPercent ?? p.trendGrowthPercent ?? null,
          trendLabel: trend?.trendLabel ?? p.trendLabel ?? null,
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
                  let originalPrice: number | null = null;
                  const priceCandidates: { val: number; el: Element; isStrike?: boolean }[] = [];
                  const priceEls = document.querySelectorAll('[class*="price"], [class*="Price"], [data-testid*="price"], [data-id*="price"], [class*="strike"], [class*="line-through"], s');
                  for (let i = 0; i < priceEls.length; i++) {
                    const el = priceEls[i];
                    const text = (el as HTMLElement).textContent || '';
                    const isStrike = (el as HTMLElement).closest?.('s, [class*="strike"], [class*="line-through"], [class*="was"]') != null
                      || /line-through|strikethrough/.test((el as HTMLElement).className?.toString() || '');
                    if (/livraison|shipping/i.test(text)) continue;
                    const m = text.match(priceRe);
                    if (m) {
                      const val = parseFloat(m[1].replace(',', '.'));
                      if (val >= 1 && val <= 5000) priceCandidates.push({ val, el, isStrike });
                    }
                  }
                  const strikePrices = priceCandidates.filter((p) => p.isStrike);
                  const normalPrices = priceCandidates.filter((p) => !p.isStrike);
                  if (strikePrices.length > 0) {
                    originalPrice = Math.max(...strikePrices.map((p) => p.val));
                  }
                  if (normalPrices.length > 0) {
                    price = normalPrices[normalPrices.length - 1].val;
                  }
                  if (price <= 0 && priceCandidates.length > 0) {
                    const sorted = [...priceCandidates].sort((a, b) => a.val - b.val);
                    price = sorted[sorted.length - 1].val;
                    if (sorted.length >= 2 && sorted[sorted.length - 2].val > price) {
                      originalPrice = sorted[sorted.length - 2].val;
                    }
                  }
                  if (price <= 0) {
                    const metaPrice = (document.querySelector('meta[property="product:price:amount"]') as HTMLMetaElement)?.content;
                    if (metaPrice) price = parseFloat(metaPrice.replace(',', '.'));
                  }
                  if (price <= 0) {
                    const priceMatch = body.match(priceRe);
                    price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;
                  }
                  let markdownPercent: number | null = null;
                  if (originalPrice != null && originalPrice > price && price > 0) {
                    markdownPercent = Math.round((1 - price / originalPrice) * 100);
                  }
                  const stockText = (document.body?.innerText || '').toLowerCase();
                  let stockOutRisk: string | null = null;
                  if (/rupture|out of stock|indisponible|sold out|épuisé|epuise/i.test(stockText)) {
                    stockOutRisk = 'Rupture';
                  } else if (/plus que \d|only \d+ left|dernières pièces|last items|stock limité/i.test(stockText)) {
                    stockOutRisk = 'Faible';
                  } else if (/en stock|in stock|disponible|available/i.test(stockText)) {
                    stockOutRisk = 'OK';
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
                  // Marque de l'article (pas le retailer) — Zalando affiche souvent la marque dans breadcrumb, meta ou titre
                  let productBrand: string | null = null;
                  if (brand === 'Zalando') {
                    const metaBrand = (document.querySelector('meta[property="product:brand"], meta[name="product:brand"], meta[itemprop="brand"]') as HTMLMetaElement)?.content?.trim();
                    if (metaBrand) productBrand = metaBrand.slice(0, 100);
                    if (!productBrand) {
                      const breadcrumbLinks = Array.from(document.querySelectorAll('a[href*="/brand/"], nav a[href*="/"], [class*="breadcrumb"] a'));
                      for (const a of breadcrumbLinks) {
                        const href = (a as HTMLAnchorElement).href || '';
                        const text = (a as HTMLElement).textContent?.trim() || '';
                        if (href.includes('/brand/') && text && text.length < 50 && !/accueil|home|zalando|homme|femme|nouveautés/i.test(text)) {
                          productBrand = text.slice(0, 100);
                          break;
                        }
                      }
                    }
                    if (!productBrand && name) {
                      const titleParts = name.split(/\s*[-|–]\s*/);
                      if (titleParts[0] && titleParts[0].length >= 2 && titleParts[0].length <= 30 && !/sweat|t-shirt|pull|veste|pantalon|short|robe/i.test(titleParts[0].toLowerCase())) {
                        productBrand = titleParts[0].trim().slice(0, 100);
                      }
                    }
                  }
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
                    originalPrice: originalPrice ?? null,
                    markdownPercent: markdownPercent ?? null,
                    stockOutRisk: stockOutRisk ?? null,
                    productBrand: productBrand || null,
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

/**
 * ASOS : page liste → liens produits → pour chaque produit, page détail pour composition, entretien, couleur, tailles, etc.
 * Pas de prix (price = 0). Données nécessaires pour la page détail comme Zalando.
 */
async function scrapeASOSWithDetailEnrichment(source: HybridRadarSource): Promise<HybridScrapedItem[]> {
  const listUrl = `${source.baseUrl}${source.newInPath}`;
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

    await page.goto(listUrl, { waitUntil: 'load', timeout: 30000 });
    const initialWait = source.initialWaitMs ?? 7000;
    await new Promise((r) => setTimeout(r, initialWait));

    const preScrollSteps = source.preScrollSteps ?? 12;
    const scrollTo = new Function('y', 'window.scrollTo(0, y);') as (y: number) => void;
    for (let s = 1; s <= preScrollSteps; s++) {
      const maxH = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
      await page.evaluate(scrollTo, Math.round((maxH * s) / preScrollSteps));
      await new Promise((r) => setTimeout(r, 2000));
    }
    await new Promise((r) => setTimeout(r, 2000));

    const productLinks = await page.evaluate(`
      (function() {
        function getImgUrl(img) {
          if (!img) return null;
          var badRe = new RegExp('placeholder|1x1|blank|data:image/svg|spacer|pixel', 'i');
          var s = img.src || img.getAttribute('src');
          if (s && s.indexOf('http') === 0 && !badRe.test(s)) return s;
          var d = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-image-url') || img.getAttribute('data-srcset');
          if (d && d.indexOf('http') === 0 && !badRe.test(d)) return d;
          if (d && d.indexOf('//') === 0) return 'https:' + d;
          var set = img.getAttribute('srcset') || img.getAttribute('data-srcset');
          if (set) {
            var first = set.split(',')[0].trim().split(/\\\\s+/)[0];
            if (first && first.indexOf('http') === 0 && !badRe.test(first)) return first;
            if (first && first.indexOf('//') === 0) return 'https:' + first;
          }
          var pic = img.closest('picture');
          if (pic) {
            var src = pic.querySelector('source[srcset], source[data-srcset]');
            if (src) {
              var ss = src.getAttribute('srcset') || src.getAttribute('data-srcset');
              if (ss) { var f = ss.split(',')[0].trim().split(/\\\\s+/)[0]; if (f && f.indexOf('http') === 0) return f; if (f && f.indexOf('//') === 0) return 'https:' + f; }
            }
          }
          return (s && s.indexOf('http') === 0) ? s : null;
        }
        var links = Array.from(document.querySelectorAll('a[href*="/prd/"], a[href*="/p/"]'));
        var seen = new Set();
        var out = [];
        for (var i = 0; i < links.length; i++) {
          var a = links[i];
          var href = (a.href || a.getAttribute('href') || '').trim();
          if (!href || (href.indexOf('/prd/') === -1 && href.indexOf('/p/') === -1) || seen.has(href)) continue;
          seen.add(href);
          var card = a.closest('li, article, [class*="productTile"], [class*="product-tile"]') || a;
          var nameEl = card.querySelector('div[class*="productInfo"] p, p, h2, h3, [class*="title"], [class*="name"]');
          var name = (nameEl && nameEl.textContent ? nameEl.textContent : '').trim().replace(/\\s+/g, ' ').slice(0, 200);
          if (!name && a.textContent) name = (a.textContent || '').trim().slice(0, 200);
          if (!name && a.getAttribute('aria-label')) name = a.getAttribute('aria-label').split('Prix')[0].trim();
          var imageUrl = null;
          var imgs = card.querySelectorAll('img[src*="asos"], img[src*="asos-media"], img[data-src*="asos"], img[data-srcset*="asos"], img');
          for (var j = 0; j < imgs.length; j++) {
            imageUrl = getImgUrl(imgs[j]);
            if (imageUrl) break;
          }
          if (!imageUrl && card.querySelector('picture')) {
            var picSrc = card.querySelector('picture source[srcset], picture source[data-srcset]');
            if (picSrc) {
              var ss = picSrc.getAttribute('srcset') || picSrc.getAttribute('data-srcset');
              if (ss) { var f = ss.split(',')[0].trim().split(/\\\\s+/)[0]; if (f && f.indexOf('http') === 0) imageUrl = f; else if (f && f.indexOf('//') === 0) imageUrl = 'https:' + f; }
            }
          }
          if (imageUrl && imageUrl.indexOf('//') === 0) imageUrl = 'https:' + imageUrl;
          out.push({ sourceUrl: href, name: name || '', imageUrl: imageUrl });
        }
        return out;
      })()
    `) as { sourceUrl: string; name: string; imageUrl: string | null }[];

    const limit = Math.min(source.limit, productLinks.length);
    const allItems: HybridScrapedItem[] = [];

    for (let i = 0; i < limit; i++) {
      const link = productLinks[i];
      if (!link.sourceUrl) continue;
      try {
        await page.goto(link.sourceUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await new Promise((r) => setTimeout(r, 2500));

        const enriched = await page.evaluate(
          (marketZone: string, brand: string, seg: string) => {
            const body = (document.body && document.body.textContent) || '';
            const getText = (sel: string) => {
              const el = document.querySelector(sel);
              return (el && (el as HTMLElement).textContent ? (el as HTMLElement).textContent!.trim() : '') || '';
            };
            const findLabel = (labels: string[]) => {
              for (const label of labels) {
                const re = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*[:\\-]?\\s*([^\\n<]+)', 'i');
                const m = body.match(re);
                if (m) return m[1].trim().slice(0, 500);
              }
              return '';
            };
            const fromDtDd = (dtText: string) => {
              const dts = Array.from(document.querySelectorAll('dt, dd, [class*="detail"], [class*="label"], [class*="key"], [class*="value"]'));
              for (let idx = 0; idx < dts.length - 1; idx++) {
                const t = (dts[idx] as HTMLElement).textContent || '';
                if (new RegExp(dtText, 'i').test(t)) {
                  const next = dts[idx + 1];
                  if (next) return (next as HTMLElement).textContent?.trim().slice(0, 500) || '';
                }
              }
              return '';
            };
            const name =
              getText('h1') ||
              getText('[data-id="product-title"]') ||
              getText('[class*="product-title"]') ||
              (document.querySelector('meta[property="og:title"]') as HTMLMetaElement)?.content ||
              (document.title || '').trim().slice(0, 200);
            const badImgRe = new RegExp('placeholder|1x1|blank|spacer|pixel|icon|logo', 'i');
            const getImageUrl = (el: HTMLImageElement | null): string => {
              if (!el) return '';
              const s = el.src || el.getAttribute('data-src') || el.getAttribute('data-image-url') || '';
              if (s && s.startsWith('http') && !badImgRe.test(s)) return s;
              if (s && s.startsWith('//')) return 'https:' + s;
              const set = el.getAttribute('srcset') || el.getAttribute('data-srcset');
              if (set) {
                const first = set.split(',')[0].trim().split(/\s+/)[0];
                if (first && first.startsWith('http') && !badImgRe.test(first)) return first;
                if (first && first.startsWith('//')) return 'https:' + first;
              }
              return s && s.startsWith('http') ? s : '';
            };
            const ogImage = (document.querySelector('meta[property="og:image"]') as HTMLMetaElement)?.content?.trim();
            let imageUrl = ogImage && ogImage.startsWith('http') && !badImgRe.test(ogImage) ? ogImage : '';
            if (!imageUrl) {
              const mainImgs = document.querySelectorAll('img[src*="asos"], img[src*="asos-media"], img[data-src*="asos"], img[src*="images.asos"], [class*="gallery"] img, [class*="product-image"] img, [class*="carousel"] img');
              for (let idx = 0; idx < mainImgs.length; idx++) {
                const u = getImageUrl(mainImgs[idx] as HTMLImageElement);
                if (u && u.length > 20) {
                  imageUrl = u;
                  break;
                }
              }
            }
            if (!imageUrl) {
              const anyAsosImg = document.querySelector('img[src*="asos"], img[src*="asos-media"]') as HTMLImageElement | null;
              imageUrl = getImageUrl(anyAsosImg);
            }
            if (!imageUrl && document.querySelector('picture source[srcset*="asos"]')) {
              const picSrc = document.querySelector('picture source[srcset*="asos"], picture source[data-srcset*="asos"]');
              const ss = picSrc?.getAttribute('srcset') || picSrc?.getAttribute('data-srcset');
              if (ss) {
                const first = ss.split(',')[0].trim().split(/\s+/)[0];
                if (first && first.startsWith('http')) imageUrl = first;
                else if (first && first.startsWith('//')) imageUrl = 'https:' + first;
              }
            }
            const composition =
              fromDtDd('composition|matière|material|fabric') ||
              findLabel(['Composition', 'Material', 'Materials', 'Fabric', 'Composizione', 'Zusammensetzung', 'Materiaal']);
            const care =
              fromDtDd('entretien|care|pflege|wash') ||
              findLabel(['Care', 'Care instructions', 'Entretien', 'Pflegehinweise', 'Verzorging', 'Info & Care']);
            const color =
              fromDtDd('couleur|color|farbe|colour') ||
              findLabel(['Colour', 'Color', 'Couleur', 'Farbe', 'Kleur']);
            const sizes =
              fromDtDd('taille|size|größe|fit') ||
              findLabel(['Size', 'Sizes', 'Fit', 'Tailles', 'Taglie', 'Größen', 'Maat']);
            const origin =
              fromDtDd('origine|origin|herkunft|country') ||
              findLabel(['Country of origin', 'Origin', 'Pays d\'origine', 'Herkunftsland']);
            const artNum =
              fromDtDd('article|nummer|style|ref') ||
              findLabel(['Article number', 'Style', 'Ref', 'Artikelnummer', 'Product code']);
            let productBrand: string | null = null;
            const metaBrand = (document.querySelector('meta[property="product:brand"], meta[name="product:brand"], meta[itemprop="brand"]') as HTMLMetaElement)?.content?.trim();
            if (metaBrand) productBrand = metaBrand.slice(0, 100);
            if (!productBrand && name) {
              const titleParts = name.split(/\s*[-|–]\s*/);
              if (titleParts[0] && titleParts[0].length >= 2 && titleParts[0].length <= 30 && !/sweat|t-shirt|pull|veste|pantalon|short|robe|hoodie/i.test(titleParts[0].toLowerCase())) {
                productBrand = titleParts[0].trim().slice(0, 100);
              }
            }
            return {
              name: name.slice(0, 200),
              price: 0,
              imageUrl: imageUrl && imageUrl.startsWith('http') ? imageUrl : imageUrl ? 'https:' + imageUrl : null,
              sourceUrl: window.location.href,
              marketZone: marketZone as 'FR' | 'EU' | 'US' | 'ASIA',
              brand,
              segment: seg as 'homme' | 'femme' | 'garcon' | 'fille',
              composition: composition || null,
              careInstructions: care || null,
              color: color || null,
              sizes: sizes || null,
              countryOfOrigin: origin || null,
              articleNumber: artNum || null,
              productBrand: productBrand || null,
            };
          },
          source.marketZone,
          source.brand,
          source.segment ?? 'homme'
        ) as HybridScrapedItem;

        if (enriched.name && enriched.name.length > 2 && !isExcludedProduct(enriched.name, source.excludeKeywords)) {
          allItems.push({
            ...enriched,
            sourceUrl: link.sourceUrl,
            imageUrl: enriched.imageUrl || link.imageUrl,
            price: 0,
          });
        }
      } catch (_) {
        /* skip failed product */
      }
    }

    await browser.close();
    return allItems.map((p) => ({
      ...p,
      sourceUrl: p.sourceUrl || listUrl,
      segment: source.segment,
      price: 0,
    }));
  } catch (err) {
    if (browser) await browser.close();
    console.error('[Hybrid Radar] ASOS detail enrichment:', err);
    return [];
  }
}

export async function scrapeHybridSource(
  source: HybridRadarSource
): Promise<HybridScrapedItem[]> {
  if (source.brand === 'Zalando' && source.newInPath.includes('trend-spotter')) {
    return scrapeZalandoTrendSpotter(source);
  }
  if (source.brand === 'ASOS') {
    // 18-24 homme et femme : flux générique uniquement (liste seule, rapide et fiable). Pas de visite page par page.
    if (source.id === 'asos-18-24-homme' || source.id === 'asos-18-24-femme') {
      /* utilise le flux générique ci-dessous */
    } else {
      const asosItems = await scrapeASOSWithDetailEnrichment(source);
      if (asosItems.length > 0) return asosItems;
    }
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
        if (!img) return null;
        var badRe = new RegExp('placeholder|1x1|blank|data:image\\\\/svg|spacer|pixel|transparent-background', 'i');
        var s = img.src || img.getAttribute('src');
        if (s && typeof s === 'string' && s.indexOf('http') === 0 && !badRe.test(s)) return s;
        if (s && typeof s === 'string' && s.indexOf('//') === 0) return 'https:' + s;
        
        // Zara spécifique : chercher l'image haute résolution
        var d = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-image-url') || img.getAttribute('data-srcset');
        if (d && typeof d === 'string') {
          if (d.indexOf('http') === 0 && !badRe.test(d)) return d;
          if (d.indexOf('//') === 0) return 'https:' + d;
          var fromSet = d.split(',')[0].trim().split(/\\\\s+/)[0];
          if (fromSet && fromSet.indexOf('http') === 0 && !badRe.test(fromSet)) return fromSet;
        }

        var set = img.getAttribute('srcset') || img.getAttribute('data-srcset');
        if (set) {
          var sources = set.split(',').map(s => s.trim().split(/\\\\s+/)[0]);
          for (var k = 0; k < sources.length; k++) {
            if (sources[k] && sources[k].indexOf('http') === 0 && !badRe.test(sources[k])) return sources[k];
          }
        }
        
        return null;
      var products = Array.from(document.querySelectorAll(prodSel)).slice(0, 120);
      if (products.length === 0) return [];
      return products.map(function(el) {
        var nameEl = el.querySelector(nameSel) || el.querySelector('div[class*="productInfo"] p, h2, h3, [class*="title"], [class*="name"], a');
        var priceEl = el.querySelector(priceSel) || el.querySelector('div[class*="productInfo"] p:nth-of-type(2), [class*="price"], [class*="Price"]');
        var linkEl = el.querySelector('a[href*="/prd/"], a[href*="/p/"]') || el.querySelector('a') || el.closest && el.closest('a');
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
        var imgs = el.querySelectorAll(imgSel + ', img[src*="asos"], img[data-src*="asos"], img[srcset*="asos"], img');
        for (var i = 0; i < imgs.length; i++) { imageUrl = getUrlFromImg(imgs[i]); if (imageUrl) break; }
        if (!imageUrl) {
          var pictureSource = el.querySelector('picture source[srcset], picture source[data-srcset]');
          if (pictureSource) {
            var set = pictureSource.getAttribute('srcset') || pictureSource.getAttribute('data-srcset');
            if (set) {
              var first = set.split(',')[0].trim().split(/\\\\s+/)[0];
              if (first && first.indexOf('http') === 0) imageUrl = first;
              else if (first && first.indexOf('//') === 0) imageUrl = 'https:' + first;
            }
          }
        }
        if (!imageUrl) {
          var dataEl = el.querySelector('[data-image-url], [data-src], [data-srcset]');
          if (dataEl) {
            var u = dataEl.getAttribute('data-image-url') || dataEl.getAttribute('data-src') || dataEl.getAttribute('data-srcset');
            if (u && u.indexOf('http') === 0) imageUrl = u;
            else if (u && u.indexOf('//') === 0) imageUrl = 'https:' + u;
            else if (u) { var f = u.split(',')[0].trim().split(/\\\\s+/)[0]; if (f && (f.indexOf('http') === 0 || f.indexOf('//') === 0)) imageUrl = f.indexOf('//') === 0 ? 'https:' + f : f; }
          }
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
        var badRe = new RegExp('placeholder|1x1|blank|data:image\\\\/svg|spacer|pixel', 'i');
        var s = img.src || img.getAttribute('src');
        if (s && typeof s === 'string' && s.indexOf('http') === 0 && !badRe.test(s)) return s;
        if (s && typeof s === 'string' && s.indexOf('//') === 0) return 'https:' + s;
        var d = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-image-url') || img.getAttribute('data-srcset');
        if (d && typeof d === 'string') {
          if (d.indexOf('http') === 0 && !badRe.test(d)) return d;
          if (d.indexOf('//') === 0) return 'https:' + d;
          var fromSet = d.split(',')[0].trim().split(/\\\\s+/)[0];
          if (fromSet && fromSet.indexOf('http') === 0) return fromSet;
          if (fromSet && fromSet.indexOf('//') === 0) return 'https:' + fromSet;
        }
        var set = img.getAttribute('srcset') || img.getAttribute('data-srcset');
        if (set) {
          var first = set.split(',')[0].trim().split(/\\\\s+/)[0];
          if (first && first.indexOf('http') === 0) return first;
          if (first && first.indexOf('//') === 0) return 'https:' + first;
        }
        return (s && typeof s === 'string' && s.indexOf('http') === 0) ? s : null;
      }
      var products = Array.from(document.querySelectorAll(prodSel)).slice(0, 200);
      return products.map(function(el) {
        var linkEl = el.querySelector('a[href*="/prd/"], a[href*="/p/"]') || el.querySelector('a') || (el.closest && el.closest('a'));
        var sourceUrl = (linkEl && linkEl.href) || '';
        var imageUrl = null;
        var imgs = el.querySelectorAll(imgSel + ', img[src*="asos"], img[data-src*="asos"], img[srcset*="asos"], img');
        for (var i = 0; i < imgs.length; i++) { imageUrl = getUrlFromImg(imgs[i]); if (imageUrl) break; }
        if (!imageUrl) {
          var pictureSource = el.querySelector('picture source[srcset], picture source[data-srcset]');
          if (pictureSource) {
            var set = pictureSource.getAttribute('srcset') || pictureSource.getAttribute('data-srcset');
            if (set) {
              var first = set.split(',')[0].trim().split(/\\\\s+/)[0];
              if (first && first.indexOf('http') === 0) imageUrl = first;
              else if (first && first.indexOf('//') === 0) imageUrl = 'https:' + first;
            }
          }
        }
        if (!imageUrl) {
          var dataEl = el.querySelector('[data-image-url], [data-src], [data-srcset]');
          if (dataEl) {
            var u = dataEl.getAttribute('data-image-url') || dataEl.getAttribute('data-src') || dataEl.getAttribute('data-srcset');
            if (u && u.indexOf('http') === 0) imageUrl = u;
            else if (u && u.indexOf('//') === 0) imageUrl = 'https:' + u;
          }
        }
        return { sourceUrl: sourceUrl, imageUrl: imageUrl };
      });
    `;
    const runExtractImagesOnly = new Function(
      'prodSel', 'imgSel',
      getUrlFromImgBody
    ) as (a: string, b: string) => { sourceUrl: string; imageUrl: string | null }[];

    const scrollSteps = 15;
    const scrollWaitMs = source.brand === 'ASOS' ? 4500 : 3500;
    for (let step = 0; step < scrollSteps; step++) {
      const y = Math.round((maxScroll * (step + 1)) / scrollSteps);
      await page.evaluate(scrollToFn as (y: number) => void, y);
      await new Promise((r) => setTimeout(r, scrollWaitMs));
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
    await new Promise((r) => setTimeout(r, source.brand === 'ASOS' ? 5500 : 4000));
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
