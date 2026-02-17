/**
 * Shopify Public API Client
 * Permet de récupérer les produits via l'API JSON publique (/products.json)
 * ou l'API Storefront GraphQL.
 */

export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  currencyCode: string;
  images: string[];
  variants: Array<{
    price: number;
    availableForSale: boolean;
    inventoryQuantity: number | null;
  }>;
  productType: string | null;
  tags: string[];
}

/**
 * Normalise l'URL pour s'assurer qu'elle a le protocole https
 */
function normalizeUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `https://${url}`;
}

/**
 * Récupère les produits via l'endpoint public /products.json (Recommandé)
 */
export async function fetchShopifyProductsREST(
  storeUrl: string,
  limit: number = 50
): Promise<ShopifyProduct[]> {
  const baseUrl = normalizeUrl(storeUrl);
  // Supprimer le slash final si présent
  const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const endpoint = `${cleanUrl}/products.json?limit=${Math.min(limit, 250)}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} pour ${endpoint}`);
    }

    const data = await response.json();
    if (!data.products) return [];

    return data.products.map((p: any) => ({
      id: String(p.id),
      title: p.title,
      description: p.body_html || '',
      price: p.variants?.[0]?.price ? parseFloat(p.variants[0].price) : 0,
      currencyCode: 'EUR', // Par défaut pour les stores FR, peut varier
      images: p.images?.map((img: any) => img.src) || [],
      variants: p.variants?.map((v: any) => ({
        price: parseFloat(v.price),
        availableForSale: true, // Souvent true si listé dans products.json
        inventoryQuantity: null
      })) || [],
      productType: p.product_type,
      tags: typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : (p.tags || []),
    }));
  } catch (error) {
    console.error(`[Shopify REST] Erreur pour ${storeUrl}:`, error);
    return [];
  }
}

/**
 * Fonction unifiée qui essaie REST d'abord (plus fiable pour le scraping public)
 */
export async function fetchShopifyProducts(
  storeUrl: string,
  limit: number = 50
): Promise<ShopifyProduct[]> {
  // On privilégie REST car /products.json est ouvert sur 99% des Shopify stores
  // sans avoir besoin de configurer le Storefront API ou d'avoir un token.
  return fetchShopifyProductsREST(storeUrl, limit);
}

/**
 * Vérifie si une boutique est accessible via /products.json
 */
export async function isStorefrontApiAvailable(storeUrl: string): Promise<boolean> {
  try {
    const baseUrl = normalizeUrl(storeUrl);
    const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const response = await fetch(`${cleanUrl}/products.json?limit=1`, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getProductCount(storeUrl: string): Promise<number> {
  const products = await fetchShopifyProducts(storeUrl, 50);
  return products.length;
}
