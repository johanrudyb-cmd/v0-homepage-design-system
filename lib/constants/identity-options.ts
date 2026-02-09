/**
 * Options sélectionnables pour la Phase 0 Identité (Créer ma marque).
 * Évite les erreurs de saisie et aligne avec la Phase 1 Stratégie (filtre par style).
 */

/** Public cible / cibles marketing */
export const TARGET_AUDIENCE_OPTIONS = [
  '18-24 ans, Gen Z',
  '25-34 ans, Millennials',
  '35-50 ans, actifs',
  'Femmes 18-35',
  'Femmes 35-50',
  'Hommes 18-35',
  'Hommes 35-50',
  'Unisexe 18-30',
  'Unisexe 25-45',
  'Urbains, 18-35 ans',
  'Professionnels 30-50 ans',
  'Étudiants et jeunes actifs',
  'Lifestyle premium',
  'Sportifs / outdoor',
] as const;

/** Positionnement / style (aligné avec dominantStyle des marques curatées pour la Phase 1) */
export const POSITIONING_OPTIONS = [
  'Gorpcore / Techwear',
  'Industrial Chic',
  'Fast-Fashion Tailoring',
  'Néo-Vintage Sport',
  'Quiet Luxury',
  'Heritage Streetwear',
  'Parisian Minimalist',
  'Outdoor Fusion',
  'Smart Casual',
  'Eco-Basics',
  'Streetwear',
  'Minimaliste',
  'Luxe accessible',
  'Sportswear',
  'Workwear',
  'Prêt-à-porter',
] as const;

/**
 * Pour la Phase 1 Stratégie marketing : associer le libellé positionnement
 * au style dominant des marques curatées, afin d'afficher les marques liées à ce positionnement.
 */
export const POSITIONING_TO_API_STYLE: Record<string, string> = {
  'Streetwear': 'Heritage Streetwear',
  'Minimaliste': 'Parisian Minimalist',
  'Luxe accessible': 'Quiet Luxury',
  'Sportswear': 'Néo-Vintage Sport',
  'Workwear': 'Heritage Streetwear',
  'Prêt-à-porter': 'Fast-Fashion Tailoring',
};

/** Produit phare / catégorie principale */
export const MAIN_PRODUCT_OPTIONS = [
  'Vestes',
  'Hoodies / Sweats',
  'Pantalons',
  'Maille (pulls, cardigans)',
  'T-shirts',
  'Blazers',
  'Manteaux',
  'Overshirts',
  'Survêtement',
  'Pièce technique (outdoor)',
  'Denim',
  'Lingerie / sous-vêtements',
] as const;

export type TargetAudienceOption = (typeof TARGET_AUDIENCE_OPTIONS)[number];
export type PositioningOption = (typeof POSITIONING_OPTIONS)[number];
export type MainProductOption = (typeof MAIN_PRODUCT_OPTIONS)[number];
