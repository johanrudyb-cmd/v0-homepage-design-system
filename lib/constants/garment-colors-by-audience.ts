/**
 * Couleurs de vêtement recommandées selon la cible / le positionnement.
 * Utilisé dans la phase Design pour proposer des couleurs pertinentes.
 */

/** Couleurs par défaut si aucune cible ne matche */
const DEFAULT_GARMENT_COLORS = [
  '#ffffff',
  '#1a1a1a',
  '#2d2d2d',
  '#6b7280',
  '#f5f5f5',
  '#e5e5e5',
  '#1e3a5f',
  '#14532d',
  '#7c3aed',
  '#b91c1c',
  '#c2410c',
];

/** Règles : mots-clés (cible ou positionnement) → couleurs hex pertinentes */
const RULES: Array<{ keywords: string[]; colors: string[] }> = [
  { keywords: ['gen z', '18-24', 'étudiant', 'urbain', 'streetwear'], colors: ['#1a1a1a', '#ffffff', '#7c3aed', '#2563eb', '#b91c1c', '#000000', '#0f172a', '#dc2626'] },
  { keywords: ['millennial', '25-34', '35-50', 'actif'], colors: ['#1a1a1a', '#ffffff', '#2d2d2d', '#1e3a5f', '#14532d', '#6b7280', '#374151', '#f5f5f5'] },
  { keywords: ['femme', 'woman'], colors: ['#ffffff', '#faf5ff', '#fce7f3', '#f5f5f5', '#1a1a1a', '#6b7280', '#7c3aed', '#be185d', '#0f172a', '#d6d3d1'] },
  { keywords: ['homme', 'man'], colors: ['#1a1a1a', '#ffffff', '#2d2d2d', '#1e3a5f', '#374151', '#6b7280', '#14532d', '#0f172a', '#44403c', '#f5f5f5'] },
  { keywords: ['premium', 'luxe', 'quiet luxury', 'minimalist', 'parisian'], colors: ['#ffffff', '#f5f5f5', '#1a1a1a', '#2d2d2d', '#d6d3d1', '#e7e5e4', '#44403c', '#0f172a', '#6b7280'] },
  { keywords: ['sport', 'outdoor', 'gorpcore', 'techwear'], colors: ['#1a1a1a', '#0f172a', '#14532d', '#1e3a5f', '#374151', '#ffffff', '#6b7280', '#44403c', '#2563eb'] },
  { keywords: ['workwear', 'heritage'], colors: ['#1a1a1a', '#44403c', '#78350f', '#14532d', '#2d2d2d', '#ffffff', '#6b7280', '#0f172a', '#d6d3c4'] },
  { keywords: ['enfant', 'kid'], colors: ['#ffffff', '#fef3c7', '#fce7f3', '#dbeafe', '#dcfce7', '#1a1a1a', '#7c3aed', '#2563eb', '#b91c1c', '#ca8a04'] },
  { keywords: ['unisexe'], colors: ['#1a1a1a', '#ffffff', '#2d2d2d', '#6b7280', '#374151', '#f5f5f5', '#1e3a5f', '#14532d', '#7c3aed', '#0f172a'] },
];

/**
 * Retourne les couleurs de vêtement recommandées pour une cible et un positionnement.
 */
export function getRecommendedGarmentColors(
  targetAudience: string,
  positioning?: string
): string[] {
  const search = `${(targetAudience || '').toLowerCase()} ${(positioning || '').toLowerCase()}`.trim();
  if (!search) return DEFAULT_GARMENT_COLORS;
  for (const { keywords, colors } of RULES) {
    if (keywords.some((k) => search.includes(k))) return colors;
  }
  return DEFAULT_GARMENT_COLORS;
}
