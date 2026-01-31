/**
 * Shopify Storefront API Client
 * Permet de récupérer les produits, prix, images directement depuis l'API GraphQL de Shopify
 * GRATUIT - API publique (pas besoin d'authentification pour la plupart des stores)
 */

interface ShopifyProduct {
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

interface ShopifyStorefrontResponse {
  data: {
    products: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          description: string;
          priceRange: {
            minVariantPrice: {
              amount: string;
              currencyCode: string;
            };
          };
          images: {
            edges: Array<{
              node: {
                url: string;
              };
            }>;
          };
          variants: {
            edges: Array<{
              node: {
                price: string;
                availableForSale: boolean;
                inventoryQuantity: number | null;
              };
            }>;
          };
          productType: string | null;
          tags: string[];
        };
      }>;
    };
  };
  errors?: Array<{
    message: string;
  }>;
}

/**
 * Extrait le domaine myshopify.com depuis une URL
 * Ex: "example.com" -> "example.myshopify.com"
 * Ex: "example.myshopify.com" -> "example.myshopify.com"
 */
function extractShopifyDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Si c'est déjà un domaine myshopify.com
    if (hostname.includes('myshopify.com')) {
      return hostname;
    }
    
    // Sinon, essayer de deviner le store name
    // Ex: "example.com" -> "example.myshopify.com"
    // Note: Cette méthode n'est pas fiable à 100%
    // Il faudrait utiliser l'API Shopify pour trouver le vrai domaine
    const domainParts = hostname.split('.');
    if (domainParts.length >= 2) {
      const storeName = domainParts[0];
      return `${storeName}.myshopify.com`;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Récupère les produits depuis l'API Storefront de Shopify
 * @param storeUrl URL de la boutique (ex: "https://example.com" ou "https://example.myshopify.com")
 * @param limit Nombre de produits à récupérer (max 250)
 */
export async function fetchShopifyProducts(
  storeUrl: string,
  limit: number = 50
): Promise<ShopifyProduct[]> {
  const shopifyDomain = extractShopifyDomain(storeUrl);
  
  if (!shopifyDomain) {
    throw new Error('Impossible de déterminer le domaine Shopify');
  }

  const graphqlEndpoint = `https://${shopifyDomain}/api/2024-01/graphql.json`;

  const query = `
    query GetProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  price
                  availableForSale
                  inventoryQuantity
                }
              }
            }
            productType
            tags
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { first: Math.min(limit, 250) },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data: ShopifyStorefrontResponse = await response.json();

    if (data.errors && data.errors.length > 0) {
      throw new Error(`Erreur GraphQL: ${data.errors.map(e => e.message).join(', ')}`);
    }

    // Transformer les données GraphQL en format simplifié
    const products: ShopifyProduct[] = data.data.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      description: node.description,
      price: parseFloat(node.priceRange.minVariantPrice.amount),
      currencyCode: node.priceRange.minVariantPrice.currencyCode,
      images: node.images.edges.map(img => img.node.url),
      variants: node.variants.edges.map(v => ({
        price: parseFloat(v.node.price),
        availableForSale: v.node.availableForSale,
        inventoryQuantity: v.node.inventoryQuantity,
      })),
      productType: node.productType,
      tags: node.tags,
    }));

    return products;
  } catch (error) {
    console.error('[Shopify Storefront API] Erreur:', error);
    throw new Error(
      `Impossible de récupérer les produits depuis l'API Storefront: ${
        error instanceof Error ? error.message : 'Erreur inconnue'
      }`
    );
  }
}

/**
 * Récupère le nombre total de produits (approximatif)
 * Note: L'API Storefront ne permet pas de récupérer le count exact sans pagination
 */
export async function getProductCount(storeUrl: string): Promise<number> {
  try {
    // Récupérer 250 produits (limite max) pour estimer
    const products = await fetchShopifyProducts(storeUrl, 250);
    return products.length;
  } catch {
    return 0;
  }
}

/**
 * Vérifie si une boutique expose l'API Storefront
 */
export async function isStorefrontApiAvailable(storeUrl: string): Promise<boolean> {
  try {
    const shopifyDomain = extractShopifyDomain(storeUrl);
    if (!shopifyDomain) return false;

    const graphqlEndpoint = `https://${shopifyDomain}/api/2024-01/graphql.json`;
    
    // Requête simple pour tester
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ shop { name } }',
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
