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
  products: 'li[class*="productTile"], article[data-auto-id="productTile"], [data-auto-id="productTile"], [class*="productTile"]',
  name: 'p[class*="productDescription"], h3[data-auto-id="productTileTitle"], [data-auto-id="productTileTitle"], [class*="productTileTitle"], a[class*="productLink"]',
  price: 'span[class*="price_"], span[class*="price"], p[aria-label*="prix"] span, [class*="originalPrice"] span, span[data-auto-id="productTilePrice"], [data-auto-id="productTilePrice"], [class*="productTilePrice"]',
  image: 'img[src*="asos-media"], img[srcset*="asos"], img[data-src*="asos"], img[data-auto-id="productTileImage"], [data-auto-id="productTileImage"] img, [class*="productTileImage"] img, img',
};

const ZARA_SELECTORS = {
  products: 'li.product-grid-product[data-productid], li[class*="product-grid-product"], li[class*="product-grid-block-dynamic__product-info"], a[href*="/prd/"]',
  name: 'img[data-qa-qualifier="media-image"], img[alt], a[class*="product-grid-product-info__name"], [class*="product-name"], [class*="productDescription"]',
  price: '.money-amount__main, [class*="money-amount"], span[class*="price"], [class*="price"]',
  image: 'img.media-image__image, img[data-qa-qualifier="media-image"], img[src*="zara"], img',
};

const ZALANDO_SELECTORS = {
  products: 'article[data-testid], [class*="z-nvg-catalog_articles-article"], [class*="ProductCard"], a[href*="/p/"], [class*="trend"] article, [class*="article-card"]',
  name: '[class*="z-nvg-catalog_articles-article-name"], h3, [class*="product-name"], [class*="title"], img[alt], a[class*="name"]',
  price: '[class*="z-nvg-catalog_articles-article-price"], [class*="price"], [class*="Price"], span[class*="money"]',
  image: '[class*="z-nvg-catalog_articles-article-image"] img, img[src*="zalando"], img[src*="img01"], img',
};

export const HYBRID_RADAR_SOURCES: HybridRadarSource[] = [
  // FR — ASOS Homme
  {
    id: 'asos-homme-fr',
    brand: 'Global Partner',
    marketZone: 'FR',
    segment: 'homme',
    baseUrl: 'https://www.asos.com',
    newInPath: '/fr/homme/nouveau/cat/?cid=27110&ctaref=hp|mw|prime|feature|1|category|latestdrops',
    section: 'new_in',
    selectors: ASOS_SELECTORS,
    limit: 100,
  },
  // FR — ASOS Femme
  {
    id: 'asos-femme-fr',
    brand: 'Global Partner',
    marketZone: 'FR',
    segment: 'femme',
    baseUrl: 'https://www.asos.com',
    newInPath: '/fr/femme/nouveau/nouveau-vetements/cat/?cid=2623',
    section: 'new_in',
    selectors: ASOS_SELECTORS,
    limit: 100,
  },
  // FR — ASOS Fille
  {
    id: 'asos-fille-fr',
    brand: 'Global Partner',
    marketZone: 'FR',
    segment: 'fille',
    baseUrl: 'https://www.asos.com',
    newInPath: '/fr/fille/nouveau/cat/?cid=27111',
    section: 'new_in',
    selectors: ASOS_SELECTORS,
    limit: 50,
  },
  // EU — ASOS 18-24 ans Homme (une page, pas de ville)
  {
    id: 'asos-18-24-homme',
    brand: 'Global Partner',
    marketZone: 'EU',
    segment: 'homme',
    baseUrl: 'https://www.asos.com',
    newInPath: '/fr/homme/ctas/mode-americaine-en-ligne-14/cat/?cid=16691',
    section: 'new_in',
    selectors: ASOS_SELECTORS,
    limit: 80,
  },
  // EU — ASOS Femme (mode en ligne États-Unis)
  {
    id: 'asos-18-24-femme',
    brand: 'ASOS',
    marketZone: 'EU',
    segment: 'femme',
    baseUrl: 'https://www.asos.com',
    newInPath: '/fr/femme/ctas/mode-en-ligne-etats-unis-13/cat/?cid=16661',
    section: 'new_in',
    selectors: ASOS_SELECTORS,
    limit: 80,
  },
  // FR — Zara Homme (lazy-load : pre-scroll pour charger plus que les 8 premiers)
  {
    id: 'zara-homme-fr',
    brand: 'Zara',
    marketZone: 'FR',
    segment: 'homme',
    baseUrl: 'https://www.zara.com',
    newInPath: '/fr/fr/homme-tout-l7465.html?v1=2458839',
    section: 'new_in',
    selectors: ZARA_SELECTORS,
    limit: 100,
    initialWaitMs: 9000,
    preScrollSteps: 25,
  },
  // FR — Zara Kids Garçon
  {
    id: 'zara-kids-garcon-fr',
    brand: 'Zara',
    marketZone: 'FR',
    segment: 'garcon',
    baseUrl: 'https://www.zara.com',
    newInPath: '/fr/fr/kids-boy-collection-l5413.html?v1=2426702',
    section: 'new_in',
    selectors: ZARA_SELECTORS,
    limit: 100,
    initialWaitMs: 9000,
    preScrollSteps: 25,
  },
  // FR — Zara Kids Fille
  {
    id: 'zara-kids-fille-fr',
    brand: 'Zara',
    marketZone: 'FR',
    segment: 'fille',
    baseUrl: 'https://www.zara.com',
    newInPath: '/fr/fr/enfants-fille-collection-l7289.html?v1=2426193',
    section: 'new_in',
    selectors: ZARA_SELECTORS,
    limit: 100,
    initialWaitMs: 9000,
    preScrollSteps: 25,
  },
  // EU — Zalando Trend Spotter (Trend Alert) : femme + homme, 10 villes actives. Enrich "Voir l'article" pour toutes.
  ...(['paris', 'berlin', 'milan', 'copenhagen', 'stockholm', 'antwerp', 'zurich', 'london', 'amsterdam', 'warsaw'] as const).flatMap((city) => {
    const withEnrich = true;
    return [
      {
        id: `zalando-trend-femme-${city}`,
        brand: 'Zalando',
        marketZone: 'EU' as const,
        segment: 'femme' as const,
        baseUrl: 'https://www.zalando.fr',
        newInPath: `/trend-spotter/${city}?gender=WOMEN`,
        section: 'new_in' as const,
        selectors: ZALANDO_SELECTORS,
        limit: city === 'paris' ? 8 : 80,
        initialWaitMs: 14000,
        preScrollSteps: 25,
        zalandoMainPageOnly: true,
        ...(withEnrich ? { zalandoTrendingItemsEnrich: true as const } : {}),
      },
      {
        id: `zalando-trend-homme-${city}`,
        brand: 'Zalando',
        marketZone: 'EU' as const,
        segment: 'homme' as const,
        baseUrl: 'https://www.zalando.fr',
        newInPath: `/trend-spotter/${city}?gender=MEN`,
        section: 'new_in' as const,
        selectors: ZALANDO_SELECTORS,
        limit: city === 'paris' ? 8 : 80,
        initialWaitMs: 14000,
        preScrollSteps: 25,
        zalandoMainPageOnly: true,
        ...(withEnrich ? { zalandoTrendingItemsEnrich: true as const } : {}),
      },
    ];
  }),
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
        limit: 80,
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
      };
    }

    return null;
  } catch {
    return null;
  }
}
