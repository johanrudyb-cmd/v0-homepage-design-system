import { isRetailerBrand, safeDisplayBrand } from '@/lib/constants/retailer-exclusion';

/**
 * Utilitaires pour l'extraction et la normalisation des marques produit.
 * Ne jamais afficher Zalando, Zara ou ASOS (distributeurs).
 */

/** Extrait la marque du nom produit (ex. "Nike Sportswear - T-Shirt" → "Nike"). Retourne null si distributeur. */
export function getProductBrand(name: string | null, sourceBrand: string | null): string | null {
  if (!name || !name.trim()) return safeDisplayBrand(sourceBrand);
  const n = name.trim();
  const parts = n.split(/\s*[–\-|]\s*/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return safeDisplayBrand(sourceBrand);
  const first = parts[0].toLowerCase();
  if (isRetailerBrand(first) && parts.length > 1) {
    const second = parts[1].split(/\s+/)[0]?.trim();
    return safeDisplayBrand(second || sourceBrand);
  }
  return safeDisplayBrand(parts[0]);
}

/** Clé normalisée pour regroupement (insensible à la casse). */
export function getBrandKey(brand: string): string {
  return brand.trim().toLowerCase();
}

/** Vérifie si deux noms de marque correspondent (insensible à la casse). */
export function brandsMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return getBrandKey(a) === getBrandKey(b);
}
