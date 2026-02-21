/**
 * Trend Radar Hybride (Mondial) - Sources par zone
 * Les marques sont ajoutées une par une (marché français en premier).
 * Pour chaque marque : indiquer homme ou femme (segment).
 *
 * Toutes les références qu'on ajoute pour l'Europe doivent avoir marketZone: 'EU'
 * afin d'être affichées dans la zone EU (Europe) sur la page Tendances.
 */

export type MarketZone = 'FR' | 'EU' | 'US' | 'ASIA';

export type Segment = 'homme' | 'femme' | 'garcon' | 'fille';

export interface HybridRadarSource {
  id: string;
  brand: string;
  marketZone: MarketZone;
  /** Segment cible : homme, femme, garçon ou fille (kids) */
  segment: Segment;
  baseUrl: string;
  newInPath: string;
  section: 'new_in';
  selectors: {
    products: string;
    name: string;
    price: string;
    image: string;
  };
  limit: number;
  /** Mots-clés supplémentaires pour exclure des produits (ex. chaussures). */
  excludeKeywords?: string[];
  /** Attente initiale en ms avant la première extraction (défaut 7000). */
  initialWaitMs?: number;
  /** Nombre de scrolls avant la 1re extraction pour charger plus de produits (ex. Zara lazy-load). */
  preScrollSteps?: number;
  /** Zalando uniquement : scraper uniquement la page principale (grille "Articles tendance" par ville), pas les pages trend-details. */
  zalandoMainPageOnly?: boolean;
  /** Zalando : collecter les liens trending-items, cliquer "voir l'article" et extraire infos produit + tech pack (composition, entretien, couleur, tailles). */
  zalandoTrendingItemsEnrich?: boolean;
}

/**
 * Liste des sources (marques) à scraper.
 * Marché français en premier, marque par marque (homme / femme).
 */
const ASOS_SELECTORS = {
  products: 'li[class*="productTile"]',
  name: 'p[class*="productDescription"]',
  price: 'span[class*="price_"], span[class*="currentPrice"]',
  image: 'img[src*="asos-media"], img[srcset*="asos"], img[data-src*="asos"]',
};

const ZARA_SELECTORS = {
  products: '.product-grid-product',
  name: '.product-grid-product-info__name',
  price: '.price-current__amount',
  image: 'img.media-image__image, img[data-qa-qualifier="media-image"], img[src*="static.zara.net"]',
};

const ZALANDO_SELECTORS = {
  products: 'article[data-testid], [class*="z-nvg-catalog_articles-article"], [class*="ProductCard"], a[href*="/p/"], [class*="trend"] article, [class*="article-card"]',
  name: '[class*="z-nvg-catalog_articles-article-name"], h3, [class*="product-name"], [class*="title"], img[alt], a[class*="name"]',
  price: '[class*="z-nvg-catalog_articles-article-price"], [class*="price"], [class*="Price"], span[class*="money"]',
  image: '[class*="z-nvg-catalog_articles-article-image"] img, img[src*="zalando"], img[src*="img01"], img',
};

const SHOES_EXCLUDE = [
  'chaussure', 'botte', 'mocassin', 'boot', 'basket', 'sneaker', 'sandale', 'mule', 'talon', 'escarpin', 'claquette', 'tong', 'sabot', 'derbie', 'richelieu', 'loafer', 'trainer', 'ballerine', 'espadrille', 'slides', 'flip flop', 'chausson', 'pantoufle',
  'chau ure', 'moca in', 'ba ket'
];
const BEAUTY_EXCLUDE = [
  'exfoliant', 'crème visage', 'sérum', 'teinte lèvres', 'teinte joues',
  'blush', 'fond de teint', 'mascara', 'eyeliner', 'fard', 'highlighter',
  'bronzer', 'démaquillant', 'gloss', 'rouge à lèvres', 'vernis à ongles',
  'skincare', 'gommage visage', 'masque visage', 'lip tint', 'cheek tint',
];
const COMMON_EXCLUDE = [
  'plus size', 'maternité', 'grossesse', 'curve', 'tall', 'petite',
  ...SHOES_EXCLUDE,
  ...BEAUTY_EXCLUDE,
];

export const HYBRID_RADAR_SOURCES: HybridRadarSource[] = [
  // FR — ASOS Homme
  {
    id: 'asos-homme-fr',
    brand: 'Global Partner',
    marketZone: 'EU',
    segment: 'homme',
    baseUrl: 'https://www.asos.com',
    newInPath: '/fr/homme/nouveau/nouveau-vetements/cat/?cid=6993',
    section: 'new_in',
    selectors: ASOS_SELECTORS,
    limit: 60,
    excludeKeywords: COMMON_EXCLUDE,
  },
  // FR — ASOS Femme
  {
    id: 'asos-femme-fr',
    brand: 'Global Partner',
    marketZone: 'EU',
    segment: 'femme',
    baseUrl: 'https://www.asos.com',
    newInPath: '/fr/femme/nouveau/nouveau-vetements/cat/?cid=2623',
    section: 'new_in',
    selectors: ASOS_SELECTORS,
    limit: 60,
    excludeKeywords: COMMON_EXCLUDE,
  },
  // FR — ASOS Fille
  {
    id: 'asos-fille-fr',
    brand: 'Global Partner',
    marketZone: 'EU',
    segment: 'fille',
    baseUrl: 'https://www.asos.com',
    newInPath: '/fr/fille/nouveau/cat/?cid=27111',
    section: 'new_in',
    selectors: ASOS_SELECTORS,
    limit: 60,
    excludeKeywords: COMMON_EXCLUDE,
  },
  // EU — ASOS 18-24 ans Homme (une page, pas de ville)
  {
    id: 'asos-18-24-homme',
    brand: 'Global Partner',
    marketZone: 'EU',
    segment: 'homme',
    baseUrl: 'https://www.asos.com',
    newInPath: '/fr/homme/ctas/mode-americaine-en-ligne-14/cat/?cid=16691&page=3&refine=floor:1001,2001',
    section: 'new_in',
    selectors: ASOS_SELECTORS,
    limit: 60,
    excludeKeywords: COMMON_EXCLUDE,
  },
  // EU — ASOS Femme (mode en ligne États-Unis)
  {
    id: 'asos-18-24-femme',
    brand: 'Global Partner',
    marketZone: 'EU',
    segment: 'femme',
    baseUrl: 'https://www.asos.com',
    newInPath: '/fr/femme/ctas/mode-en-ligne-etats-unis-13/cat/?cid=16661',
    section: 'new_in',
    selectors: ASOS_SELECTORS,
    limit: 60,
    excludeKeywords: COMMON_EXCLUDE,
  },
  // FR — Zara Homme
  {
    id: 'zara-homme-fr',
    brand: 'Zara',
    marketZone: 'EU',
    segment: 'homme',
    baseUrl: 'https://www.zara.com',
    newInPath: '/fr/fr/homme-nouveau-l711.html?v1=2544454',
    section: 'new_in',
    selectors: ZARA_SELECTORS,
    limit: 100,
    initialWaitMs: 9000,
    preScrollSteps: 25,
    excludeKeywords: COMMON_EXCLUDE,
  },
  // FR — Zara Femme
  {
    id: 'zara-femme-fr',
    brand: 'Zara',
    marketZone: 'EU',
    segment: 'femme',
    baseUrl: 'https://www.zara.com',
    newInPath: '/fr/fr/femme-nouveau-l1180.html?v1=2546081',
    section: 'new_in',
    selectors: ZARA_SELECTORS,
    limit: 100,
    initialWaitMs: 9000,
    preScrollSteps: 25,
    excludeKeywords: COMMON_EXCLUDE,
  },
  // FR — Zara Kids Garçon
  {
    id: 'zara-kids-garcon-fr',
    brand: 'Zara',
    marketZone: 'EU',
    segment: 'garcon',
    baseUrl: 'https://www.zara.com',
    newInPath: '/fr/fr/kids-boy-collection-l5413.html?v1=2426702',
    section: 'new_in',
    selectors: ZARA_SELECTORS,
    limit: 100,
    initialWaitMs: 9000,
    preScrollSteps: 25,
    excludeKeywords: COMMON_EXCLUDE,
  },
  // FR — Zara Kids Fille
  {
    id: 'zara-kids-fille-fr',
    brand: 'Zara',
    marketZone: 'EU',
    segment: 'fille',
    baseUrl: 'https://www.zara.com',
    newInPath: '/fr/fr/enfants-fille-collection-l7289.html?v1=2426193',
    section: 'new_in',
    selectors: ZARA_SELECTORS,
    limit: 100,
    initialWaitMs: 9000,
    preScrollSteps: 25,
    excludeKeywords: COMMON_EXCLUDE,
  },
];

export function getSourcesByZone(zone: MarketZone): HybridRadarSource[] {
  return HYBRID_RADAR_SOURCES.filter((s) => s.marketZone === zone);
}

export function getAllSources(): HybridRadarSource[] {
  return HYBRID_RADAR_SOURCES;
}

const ZALANDO_SELECTORS_FOR_SOURCE = {
  products: 'article[data-testid], [class*="z-nvg-catalog_articles-article"], [class*="ProductCard"], a[href*="/p/"]',
  name: '[class*="z-nvg-catalog_articles-article-name"], h3, [class*="product-name"], [class*="title"], img[alt]',
  price: '[class*="z-nvg-catalog_articles-article-price"], [class*="price"], [class*="Price"], span[class*="money"]',
  image: '[class*="z-nvg-catalog_articles-article-image"] img, img[src*="zalando"], img[src*="img01"], img',
};

/**
 * Crée une source à partir d'une URL (Zalando ou ASOS).
 * Utilisé quand l'utilisateur colle directement le lien de la page à scraper.
 */
export function createSourceFromUrl(customUrl: string): HybridRadarSource | null {
  try {
    const u = new URL(customUrl.trim());
    const pathAndSearch = u.pathname + u.search;

    if (u.hostname.includes('asos')) {
      const segment: Segment = pathAndSearch.includes('/femme/') ? 'femme' : 'homme';
      const slug = pathAndSearch.replace(/\?.*/, '').replace(/^\/+|\/+$/g, '').replace(/\//g, '-') || 'url';
      const id = 'asos-custom-' + slug.slice(0, 40);
      return {
        id,
        brand: 'Global Partner',
        marketZone: 'EU',
        segment,
        baseUrl: u.origin,
        newInPath: pathAndSearch || '/',
        section: 'new_in',
        selectors: ASOS_SELECTORS,
        limit: 60,
        excludeKeywords: COMMON_EXCLUDE,
      };
    }

    if (u.hostname.includes('zalando')) {
      const isTrendSpotter = pathAndSearch.includes('trend-spotter');
      const segment: Segment = u.searchParams.get('gender') === 'WOMEN' ? 'femme' : 'homme';
      const id = 'zalando-custom-' + (isTrendSpotter ? pathAndSearch.replace(/\?.*/, '').replace(/\//g, '-') : 'url');
      return {
        id,
        brand: 'Zalando',
        marketZone: 'EU',
        segment,
        baseUrl: u.origin,
        newInPath: pathAndSearch || '/',
        section: 'new_in',
        selectors: ZALANDO_SELECTORS_FOR_SOURCE,
        limit: 80,
        initialWaitMs: 12000,
        preScrollSteps: 25,
        zalandoMainPageOnly: true,
        zalandoTrendingItemsEnrich: true,
        excludeKeywords: COMMON_EXCLUDE,
      };
    }

    return null;
  } catch {
    return null;
  }
}
