/**
 * Marques distributeurs à ne jamais afficher aux utilisateurs.
 * Les données proviennent de ces sources mais l'origine ne doit pas être visible.
 */
export const RETAILER_NAMES_EXCLUDED = [
  'zalando', 'zara', 'asos', 'global partner',
  'asos design', 'asos edition', 'asos luxe', 'asos 4505',
] as const;

export function isRetailerBrand(brand: string | null | undefined): boolean {
  if (!brand || !brand.trim()) return false;
  const b = brand.trim().toLowerCase();
  return (RETAILER_NAMES_EXCLUDED as readonly string[]).includes(b) || b.includes('asos');
}

/** Valeurs à ne pas afficher comme marque (artefacts, placeholders). */
const INVALID_BRAND_PATTERNS = /^[._\-\s]+$|^\._\.$/;

export function safeDisplayBrand(brand: string | null | undefined): string | null {
  if (!brand || !brand.trim() || isRetailerBrand(brand)) return null;
  const b = brand.trim().replace(/^\._\.\s*/i, '').trim();
  if (!b || INVALID_BRAND_PATTERNS.test(b) || b.length < 2) return null;
  return b;
}
