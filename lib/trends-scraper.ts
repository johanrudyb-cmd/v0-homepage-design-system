/**
 * Scraper pour obtenir des produits tendances réels depuis Shopify stores
 * 
 * Utilise Shopify Storefront API (gratuit, public) pour scraper
 * des produits réels depuis des stores mode populaires.
 */

import { fetchShopifyProducts, isStorefrontApiAvailable } from './shopify-storefront-api';
// Google Trends API sera ajouté en Phase 2
// import { calculateTrendScoreMultiple, extractKeywordsForTrends } from './google-trends-api';

// Stores mode populaires à scraper (publics, Storefront API disponible)
// Note: Certains stores peuvent ne pas avoir Storefront API activé
const POPULAR_FASHION_STORES = [
  // Stores streetwear internationaux (plus susceptibles d'avoir Storefront API)
  'kith.com',
  'supreme.com',
  'palace.com',
  'stussy.com',
  'carhartt-wip.com',
  
  // Stores mode française
  'ami-paris.com',
  'sandro-paris.com',
  'maje.com',
  'ba-sh.com',
  'sezane.com',
  
  // Stores streetwear européens
  'corteiz.com',
  'representclo.com',
  'cpcompany.com',
  'stoneisland.com',
  
  // Stores mode accessible
  'asos.com',
  'zara.com',
  'hm.com',
  
  // Stores indépendants (à vérifier Storefront API)
  'octobersveryown.com',
  'fearofgod.com',
  'awge.com',
];

interface TrendProductData {
  name: string;
  category: string;
  style: string;
  material: string;
  averagePrice: number;
  trendScore: number;
  saturability: number;
  imageUrl: string | null;
  description: string | null;
}

/**
 * Scraper les produits depuis un store Shopify
 */
export async function scrapeStoreProducts(storeUrl: string): Promise<TrendProductData[]> {
  try {
    // Vérifier si Storefront API est disponible
    const available = await isStorefrontApiAvailable(storeUrl);
    if (!available) {
      console.warn(`[Trends Scraper] Storefront API non disponible pour ${storeUrl}`);
      return [];
    }

    // Récupérer les produits
    const products = await fetchShopifyProducts(storeUrl, 50);
    
    // Convertir en format TrendProduct
    const trendProducts: TrendProductData[] = products.map((product) => {
      // Déterminer la catégorie (Haut/Bas/Accessoires)
      const category = determineCategory(product.title, product.productType);
      
      // Déterminer le style (Streetwear/Minimaliste/Luxe/Y2K)
      const style = determineStyle(product.title, product.tags);
      
      // Déterminer le matériau
      const material = determineMaterial(product.title, product.description);
      
      // Calculer le prix moyen
      const averagePrice = product.variants.length > 0
        ? product.variants.reduce((sum, v) => sum + v.price, 0) / product.variants.length
        : product.price;
      
      // Calculer saturabilité (basé sur nombre de variantes, tags, etc.)
      const saturability = calculateSaturability(product);
      
      // TrendScore sera calculé avec Google Trends en Phase 2
      // Pour l'instant, utiliser un score basé sur la qualité perçue
      const trendScore = 0; // Sera calculé avec Google Trends API plus tard

      return {
        name: product.title,
        category,
        style,
        material,
        averagePrice,
        trendScore,
        saturability,
        imageUrl: product.images[0] || null,
        description: product.description || null,
      };
    });

    return trendProducts;
  } catch (error) {
    console.error(`[Trends Scraper] Erreur lors du scraping ${storeUrl}:`, error);
    return [];
  }
}

/**
 * Scraper tous les stores populaires
 */
export async function scrapeAllTrendingProducts(): Promise<TrendProductData[]> {
  const allProducts: TrendProductData[] = [];

  console.log(`[Trends Scraper] Début du scraping de ${POPULAR_FASHION_STORES.length} stores...`);

  for (const store of POPULAR_FASHION_STORES) {
    try {
      console.log(`[Trends Scraper] Scraping ${store}...`);
      const products = await scrapeStoreProducts(store);
      
      if (products.length > 0) {
        console.log(`[Trends Scraper] ✅ ${products.length} produits trouvés sur ${store}`);
        allProducts.push(...products);
      } else {
        console.log(`[Trends Scraper] ⚠️  Aucun produit trouvé sur ${store} (Storefront API peut-être indisponible)`);
      }
      
      // Rate limiting : attendre 3 secondes entre chaque store (pour Google Trends aussi)
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`[Trends Scraper] ❌ Erreur pour ${store}:`, error);
      continue;
    }
  }

  console.log(`[Trends Scraper] ✅ ${allProducts.length} produits scrapés au total`);
  return allProducts;
}

/**
 * Déterminer la catégorie du produit
 */
function determineCategory(title: string, productType: string | null): string {
  const titleLower = title.toLowerCase();
  const typeLower = (productType || '').toLowerCase();

  if (titleLower.includes('hoodie') || titleLower.includes('sweatshirt') || 
      titleLower.includes('t-shirt') || titleLower.includes('tshirt') ||
      titleLower.includes('polo') || titleLower.includes('veste') ||
      titleLower.includes('bomber') || titleLower.includes('jacket')) {
    return 'Haut';
  }

  if (titleLower.includes('pantalon') || titleLower.includes('jean') ||
      titleLower.includes('cargo') || titleLower.includes('short') ||
      titleLower.includes('jogging')) {
    return 'Bas';
  }

  if (titleLower.includes('chaussure') || titleLower.includes('sneaker') ||
      titleLower.includes('sac') || titleLower.includes('bag') ||
      titleLower.includes('casquette') || titleLower.includes('cap')) {
    return 'Accessoires';
  }

  // Fallback sur productType
  if (typeLower.includes('top') || typeLower.includes('shirt')) return 'Haut';
  if (typeLower.includes('bottom') || typeLower.includes('pant')) return 'Bas';
  if (typeLower.includes('accessory')) return 'Accessoires';

  return 'Haut'; // Par défaut
}

/**
 * Déterminer le style du produit
 */
function determineStyle(title: string, tags: string[]): string {
  const titleLower = title.toLowerCase();
  const tagsLower = tags.map(t => t.toLowerCase()).join(' ');

  if (titleLower.includes('streetwear') || tagsLower.includes('streetwear') ||
      titleLower.includes('urban') || tagsLower.includes('urban')) {
    return 'Streetwear';
  }

  if (titleLower.includes('y2k') || tagsLower.includes('y2k') ||
      titleLower.includes('vintage') || tagsLower.includes('vintage')) {
    return 'Y2K';
  }

  if (titleLower.includes('luxe') || tagsLower.includes('luxury') ||
      titleLower.includes('premium') || tagsLower.includes('premium')) {
    return 'Luxe';
  }

  if (titleLower.includes('minimal') || tagsLower.includes('minimal') ||
      titleLower.includes('basic') || tagsLower.includes('essential')) {
    return 'Minimaliste';
  }

  return 'Streetwear'; // Par défaut
}

/**
 * Déterminer le matériau
 */
function determineMaterial(title: string, description: string | null): string {
  const text = `${title} ${description || ''}`.toLowerCase();

  if (text.includes('coton') || text.includes('cotton')) {
    if (text.includes('400') || text.includes('450') || text.includes('500')) {
      return 'Coton 400GSM+';
    }
    return 'Coton GSM élevé';
  }

  if (text.includes('denim')) return 'Denim';
  if (text.includes('polyester')) return 'Polyester';
  if (text.includes('synthétique')) return 'Synthétique';
  if (text.includes('nylon')) return 'Nylon Technique';
  if (text.includes('french terry')) return 'French Terry 350GSM';

  return 'Coton GSM élevé'; // Par défaut
}

/**
 * Calculer la saturabilité (plus bas = moins saturé = meilleur)
 */
function calculateSaturability(product: any): number {
  let score = 50; // Base

  // Plus de variantes = plus saturé
  score += product.variants.length * 2;

  // Plus de tags = plus saturé
  score += product.tags.length * 1;

  // Produits avec beaucoup de mots = plus saturé
  const wordCount = product.title.split(' ').length;
  score += wordCount * 0.5;

  // Limiter entre 0 et 100
  return Math.min(100, Math.max(0, score));
}
