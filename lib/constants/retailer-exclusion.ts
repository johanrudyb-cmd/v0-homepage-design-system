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

/** Valeurs à ne pas afficher comme marque (artefacts, placeholders, termes génériques). */
const INVALID_BRAND_PATTERNS = /^[._\-\s]+$|^\._\.$/;
const GENERIC_FASHION_TERMS = [
  'jean', 'jeans', 't-shirt', 'tshirt', 'pull', 'sweat', 'hoodie', 'robe', 'veste', 'blouson',
  'pantalon', 'cargo', 'short', 'chemise', 'jupe', 'polo', 'legging', 'gilet', 'ensemble',
  'body', 'pack', 'lot', 'doudoune', 'basique', 'accessoire', 'chaussettes', 'sac', 'chaussures'
];

export function safeDisplayBrand(brand: string | null | undefined): string | null {
  if (!brand || !brand.trim() || isRetailerBrand(brand)) return null;
  const b = brand.trim().replace(/^\._\.\s*/i, '').trim();
  const lowerB = b.toLowerCase();

  // Si le mot est un terme de vêtement générique ou commence par un terme générique (ex: "Jean Baggy")
  // on considère que ce n'est pas une marque propre.
  const isGeneric = GENERIC_FASHION_TERMS.some(term =>
    lowerB === term || lowerB.startsWith(term + ' ')
  );

  if (isGeneric) return null;

  if (!b || INVALID_BRAND_PATTERNS.test(b) || b.length < 2) return null;
  return b;
}
