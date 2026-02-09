/**
 * Configuration des quotas par pack "Fashion Launch" (Coût de revient : 3,15€).
 * Limites par pack acheté — usage mensuel.
 */

export type QuotaFeatureKey =
  | 'brand_analyze'
  | 'brand_strategy'
  | 'strategy_view' // Consultation d'une stratégie template (débitée des quotas)
  | 'ugc_scripts'
  | 'brand_logo'
  | 'trends_check_image'
  | 'ugc_shooting_photo'
  | 'ugc_shooting_product'
  | 'launch_map_site_texts'
  | 'factories_match'
  | 'ugc_virtual_tryon'; // Module Premium (payant à l'essai)

/** Clé AIUsage pour le mapping */
export const QUOTA_TO_AI_FEATURE: Record<QuotaFeatureKey, string> = {
  brand_analyze: 'brand_analyze',
  brand_strategy: 'brand_strategy',
  strategy_view: 'strategy_view',
  ugc_scripts: 'ugc_scripts',
  brand_logo: 'brand_logo',
  trends_check_image: 'trends_check_image',
  ugc_shooting_photo: 'ugc_shooting_photo',
  ugc_shooting_product: 'ugc_shooting_product',
  launch_map_site_texts: 'launch_map_site_texts',
  factories_match: 'factories_match',
  ugc_virtual_tryon: 'ugc_virtual_tryon',
};

/** -1 = illimité */
export const QUOTA_CONFIG = {
  fashion_launch: {
    brand_analyze_limit: 10,
    brand_strategy_limit: 10,
    strategy_view_limit: 10, // Consultations de stratégies templates par mois
    ugc_scripts_limit: 10, // lots de 5 scripts
    brand_logo_limit: 10,
    trends_check_limit: 3,
    ugc_shooting_photo_limit: 5,
    ugc_shooting_product_limit: 1,
    site_texts_limit: 999, // Illimité pour l'usage pratique
    factories_match: -1, // Illimité (base de données statique)
  },
} as const;

/** Limite consultation stratégie en onboarding (3 vues max) */
export const STRATEGY_VIEW_ONBOARDING_LIMIT = 3;

export type PackId = keyof typeof QUOTA_CONFIG;

export const QUOTA_LIMITS: Record<QuotaFeatureKey, number> = {
  brand_analyze: QUOTA_CONFIG.fashion_launch.brand_analyze_limit,
  brand_strategy: QUOTA_CONFIG.fashion_launch.brand_strategy_limit,
  strategy_view: QUOTA_CONFIG.fashion_launch.strategy_view_limit,
  ugc_scripts: QUOTA_CONFIG.fashion_launch.ugc_scripts_limit,
  brand_logo: QUOTA_CONFIG.fashion_launch.brand_logo_limit,
  trends_check_image: QUOTA_CONFIG.fashion_launch.trends_check_limit,
  ugc_shooting_photo: QUOTA_CONFIG.fashion_launch.ugc_shooting_photo_limit,
  ugc_shooting_product: QUOTA_CONFIG.fashion_launch.ugc_shooting_product_limit,
  launch_map_site_texts: QUOTA_CONFIG.fashion_launch.site_texts_limit,
  factories_match: QUOTA_CONFIG.fashion_launch.factories_match,
  ugc_virtual_tryon: -1, // Premium : payant à l'essai (7,90€)
};

/** Labels pour l'UI */
export const QUOTA_LABELS: Record<QuotaFeatureKey, string> = {
  brand_analyze: 'Analyse de marque',
  brand_strategy: 'Stratégie marque',
  strategy_view: 'Consultation stratégies',
  ugc_scripts: 'Scripts UGC (lots de 5)',
  brand_logo: 'Génération logos',
  trends_check_image: 'Vérification tendance (image)',
  ugc_shooting_photo: 'Shooting photo',
  ugc_shooting_product: 'Shooting produit (4 images)',
  launch_map_site_texts: 'Textes site',
  factories_match: 'Matching usines',
  ugc_virtual_tryon: 'Virtual Try-On',
};

/** Catégories pour le regroupement UI */
export type QuotaCategory = 'intelligence' | 'identite' | 'marketing' | 'premium';

export const QUOTA_CATEGORIES: Record<QuotaCategory, QuotaFeatureKey[]> = {
  intelligence: ['brand_analyze', 'brand_strategy', 'strategy_view', 'trends_check_image'],
  identite: ['brand_logo', 'launch_map_site_texts'],
  marketing: ['ugc_scripts', 'ugc_shooting_photo', 'ugc_shooting_product'],
  premium: ['ugc_virtual_tryon'],
};

export const CATEGORY_LABELS: Record<QuotaCategory, string> = {
  intelligence: 'Intelligence',
  identite: 'Identité',
  marketing: 'Marketing',
  premium: 'Premium',
};

/** Prix module Try-On à l'essai */
export const TRYON_PREMIUM_PRICE = 7.9;
