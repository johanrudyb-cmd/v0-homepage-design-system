/**
 * Données curatées : top marques tendances avec pièce maîtresse et style dominant.
 * Source : classement manuel / analyse tendances EU.
 * Logos : Wikimedia Commons + fallback Clearbit (logo par domaine) pour les marques de référence.
 */

import { REFERENCE_BRAND_WEBSITES } from '@/lib/constants/audience-reference-brands';

export type CyclePhase = 'emergent' | 'croissance' | 'pic' | 'declin';
export type LaunchPotential = 'opportunite' | 'a_surveiller' | 'sature';

export interface CuratedBrand {
  rank: number;
  brand: string;
  score: string; // ex. "98/100"
  scoreValue: number; // ex. 98
  signaturePiece: string;
  dominantStyle: string;
  /** Phase du cycle de tendance */
  cyclePhase: CyclePhase;
  /** Potentiel de lancement (opportunité, à surveiller, saturé) */
  launchPotential: LaunchPotential;
  /** Prix moyen indicatif de la pièce maîtresse */
  indicativePrice: string;
}

export const CYCLE_PHASE_LABELS: Record<CyclePhase, string> = {
  emergent: 'Émergent',
  croissance: 'Croissance',
  pic: 'Pic',
  declin: 'Déclin',
};

export const LAUNCH_POTENTIAL_LABELS: Record<LaunchPotential, string> = {
  opportunite: 'Opportunité',
  a_surveiller: 'À surveiller',
  sature: 'Saturé',
};

/** URLs des logos (Wikimedia Commons). Complété par Clearbit pour les marques avec site connu. */
export const BRAND_LOGOS: Record<string, string> = {
  "arc'teryx": 'https://upload.wikimedia.org/wikipedia/en/thumb/7/72/ARC%27TERYX_logo.svg/128px-ARC%27TERYX_logo.svg.png',
  'stone island': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Stone-Island-Logo.svg',
  zara: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Zara_logo_1980.svg',
  adidas: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
  'adidas originals': 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
  'massimo dutti': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Massimo_Dutti_logo.svg',
  'carhartt wip': 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Carhartt_logo.svg',
  'ami paris': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Ami_Paris.png',
  salomon: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Salomon_logo.svg',
  'mango man': 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Logo_of_Mango_%28new%29.svg',
  mango: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Logo_of_Mango_%28new%29.svg',
  "h&m edition": 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg',
  'h&m': 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg',
  nike: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
  'nike acg': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
  corteiz: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Corteiz_Alcatraz_logo_and_slogan.png/128px-Corteiz_Alcatraz_logo_and_slogan.png',
  dickies: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Dickies_logo.svg/128px-Dickies_logo.svg.png',
};

function getBrandKey(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

/** Clé normalisée (sans accents) pour matcher les marques malgré variantes. */
function getBrandKeyNormalized(name: string): string {
  return getBrandKey(name)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[''`]/g, "'")
    .replace(/[()]/g, '');
}

/** Map clé normalisée -> URL site (pour Clearbit), construite une fois. */
const REFERENCE_WEBSITES_BY_NORMALIZED_KEY: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const [name, url] of Object.entries(REFERENCE_BRAND_WEBSITES)) {
    const k = getBrandKeyNormalized(name);
    if (k && !m.has(k)) m.set(k, url);
  }
  return m;
})();

/**
 * Retourne l'URL du logo : d'abord BRAND_LOGOS (Wikimedia), puis Clearbit si la marque a un site dans REFERENCE_BRAND_WEBSITES.
 */
export function getBrandLogoUrl(brandName: string): string | null {
  const key = getBrandKey(brandName);
  const keyNorm = getBrandKeyNormalized(brandName);
  const fromMap =
    BRAND_LOGOS[key] ??
    BRAND_LOGOS[key.replace(/'\s*/g, "'")] ??
    BRAND_LOGOS[keyNorm] ??
    BRAND_LOGOS[keyNorm.replace(/'\s*/g, "'")];
  if (fromMap) return fromMap;
  const siteUrl =
    REFERENCE_WEBSITES_BY_NORMALIZED_KEY.get(keyNorm) ??
    REFERENCE_WEBSITES_BY_NORMALIZED_KEY.get(key);
  if (siteUrl) {
    try {
      const host = new URL(siteUrl).hostname.replace(/^www\./, '');
      // Favicon Google (fiable) plutôt que Clearbit (souvent 404)
      return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
    } catch {
      return null;
    }
  }
  return null;
}

export const CURATED_TOP_BRANDS: CuratedBrand[] = [
  { rank: 1, brand: "Arc'teryx", score: '98/100', scoreValue: 98, signaturePiece: 'Veste Alpha SV (Gore-Tex)', dominantStyle: 'Gorpcore / Techwear', cyclePhase: 'pic', launchPotential: 'a_surveiller', indicativePrice: '250-400€' },
  { rank: 2, brand: 'Stone Island', score: '94/100', scoreValue: 94, signaturePiece: 'Overshirt en nylon teint', dominantStyle: 'Industrial Chic', cyclePhase: 'pic', launchPotential: 'a_surveiller', indicativePrice: '150-300€' },
  { rank: 3, brand: 'Zara', score: '91/100', scoreValue: 91, signaturePiece: 'Manteau long en laine mélangée', dominantStyle: 'Fast-Fashion Tailoring', cyclePhase: 'pic', launchPotential: 'sature', indicativePrice: '80-150€' },
  { rank: 4, brand: 'Adidas', score: '89/100', scoreValue: 89, signaturePiece: 'Pantalon de survêtement rétro', dominantStyle: 'Néo-Vintage Sport', cyclePhase: 'pic', launchPotential: 'sature', indicativePrice: '50-120€' },
  { rank: 5, brand: 'Massimo Dutti', score: '85/100', scoreValue: 85, signaturePiece: 'Blazer en flanelle structuré', dominantStyle: 'Quiet Luxury', cyclePhase: 'croissance', launchPotential: 'opportunite', indicativePrice: '120-200€' },
  { rank: 6, brand: 'Carhartt WIP', score: '82/100', scoreValue: 82, signaturePiece: 'Detroit Jacket (Workwear)', dominantStyle: 'Heritage Streetwear', cyclePhase: 'croissance', launchPotential: 'opportunite', indicativePrice: '120-180€' },
  { rank: 7, brand: 'Ami Paris', score: '79/100', scoreValue: 79, signaturePiece: 'Cardigan en maille lourde', dominantStyle: 'Parisian Minimalist', cyclePhase: 'croissance', launchPotential: 'opportunite', indicativePrice: '150-250€' },
  { rank: 8, brand: 'Salomon', score: '77/100', scoreValue: 77, signaturePiece: 'Veste technique hybride', dominantStyle: 'Outdoor Fusion', cyclePhase: 'croissance', launchPotential: 'opportunite', indicativePrice: '100-180€' },
  { rank: 9, brand: 'Mango Man', score: '74/100', scoreValue: 74, signaturePiece: 'Pantalon large à pinces', dominantStyle: 'Smart Casual', cyclePhase: 'croissance', launchPotential: 'opportunite', indicativePrice: '50-90€' },
  { rank: 10, brand: 'H&M Edition', score: '71/100', scoreValue: 71, signaturePiece: 'Pull en cachemire recyclé', dominantStyle: 'Eco-Basics', cyclePhase: 'emergent', launchPotential: 'opportunite', indicativePrice: '40-80€' },
];

/** Slug URL pour une marque (ex. "Arc'teryx" → "arc-teryx"). */
export function brandNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/'/g, '-')
    .replace(/&/g, 'and');
}

/** Retourne la marque curatée dont le slug correspond. */
export function slugToCuratedBrand(slug: string): CuratedBrand | undefined {
  return CURATED_TOP_BRANDS.find((b) => brandNameToSlug(b.brand) === slug);
}
