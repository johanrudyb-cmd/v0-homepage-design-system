/**
 * Liste complète des styles de mode pour l'application
 * Utilisée dans les préférences, filtres, et formulaires
 */

export const FASHION_STYLES = [
  'Streetwear',
  'Minimaliste',
  'Luxe',
  'Y2K',
  'Vintage',
  'Sportswear',
  'Casual',
  'Formel',
  'Bohème',
  'Gothique',
  'Preppy',
  'Athleisure',
  'Workwear',
  'Punk',
  'Grunge',
  'Chic',
  'Élégant',
  'Décontracté',
  'Féminin',
  'Masculin',
  'Unisexe',
  'Éthique',
  'Durable',
  'Haute couture',
  'Prêt-à-porter',
] as const;

export type FashionStyle = typeof FASHION_STYLES[number];

/**
 * Styles par catégorie pour faciliter la navigation
 */
export const STYLES_BY_CATEGORY = {
  urbain: ['Streetwear', 'Punk', 'Grunge', 'Workwear'],
  élégant: ['Luxe', 'Chic', 'Élégant', 'Haute couture', 'Prêt-à-porter'],
  casual: ['Casual', 'Décontracté', 'Sportswear', 'Athleisure'],
  alternatif: ['Bohème', 'Gothique', 'Vintage', 'Y2K'],
  minimaliste: ['Minimaliste', 'Éthique', 'Durable'],
  genré: ['Féminin', 'Masculin', 'Unisexe'],
  formel: ['Formel', 'Preppy'],
} as const;
