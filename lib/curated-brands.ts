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
  /** URL officielle (dynamique IA) */
  websiteUrl?: string;
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

/** Mapping pour Simple Icons */
export const SIMPLE_ICONS_MAP: Record<string, string> = {
  nike: 'nike',
  adidas: 'adidas',
  zara: 'zara',
  'h&m': 'handm',
  'massimo dutti': 'massimodutti',
  'carhartt wip': 'carhartt',
  carhartt: 'carhartt',
  salomon: 'salomon',
  mango: 'mango',
  uniqlo: 'uniqlo',
  puma: 'puma',
  'the north face': 'thenorthface',
  'new balance': 'newbalance',
  asos: 'asos',
  levis: 'levi',
  'levi s': 'levi',
  'levi\'s': 'levi',
  bershka: 'bershka',
  'pull&bear': 'pullandbear',
  converse: 'converse',
  vans: 'vans',
  supreme: 'supreme',
  arcteryx: 'arcteryx',
  "arc'teryx": 'arcteryx',
  'stone island': 'stoneisland',
  patagonia: 'patagonia',
  'ralph lauren': 'ralphlauren',
  'tommy hilfiger': 'tommy',
  'calvin klein': 'calvinklein',
  champion: 'champion',
  dickies: 'dickies',
  stussy: 'stussy',
  'stüssy': 'stussy',
  palace: 'palace',
  'fear of god': 'fearofgod',
  'fendi': 'fendi',
  'gucci': 'gucci',
  'prada': 'prada',
  'versace': 'versace',
  'balenciaga': 'balenciaga',
  'moncler': 'moncler',
  'burberry': 'burberry',
  'valentino': 'valentino',
  'givenchy': 'givenchy',
  'kenzo': 'kenzo',
  'lacoste': 'lacoste',
  'oakley': 'oakley',
  'hoka': 'hoka',
  'on running': 'on-running',
  'under armour': 'underarmour',
  'reebok': 'reebok',
  'kappa': 'kappa',
  'fila': 'fila',
  'umbro': 'umbro',
};

/** URLs des logos fiables (Simple Icons ou Clearbit). */
export const BRAND_LOGOS: Record<string, string> = {
  "arc'teryx": 'https://cdn.simpleicons.org/arcteryx/000000',
  'stone island': 'https://cdn.simpleicons.org/stoneisland/000000',
  zara: 'https://cdn.simpleicons.org/zara/000000',
  adidas: 'https://cdn.simpleicons.org/adidas/000000',
  'adidas originals': 'https://cdn.simpleicons.org/adidas/000000',
  'massimo dutti': 'https://logo.clearbit.com/massimodutti.com',
  'carhartt wip': 'https://cdn.simpleicons.org/carhartt/000000',
  'ami paris': 'https://logo.clearbit.com/amiparis.com',
  salomon: 'https://cdn.simpleicons.org/salomon/000000',
  'mango man': 'https://logo.clearbit.com/mango.com',
  mango: 'https://logo.clearbit.com/mango.com',
  "h&m edition": 'https://cdn.simpleicons.org/handm/000000',
  'h&m': 'https://cdn.simpleicons.org/handm/000000',
  nike: 'https://cdn.simpleicons.org/nike/000000',
  'nike acg': 'https://cdn.simpleicons.org/nike/000000',
  corteiz: 'https://logo.clearbit.com/crtz.xyz',
  'trapstar': 'https://logo.clearbit.com/trapstarlondon.com',
  'hellstar': 'https://logo.clearbit.com/hellstar.com',
  'jaded london': 'https://logo.clearbit.com/jadedlondon.com',
  'broken planet': 'https://logo.clearbit.com/brokenplanetmarket.com',
  'stüssy': 'https://cdn.simpleicons.org/stussy/000000',
  'stussy': 'https://cdn.simpleicons.org/stussy/000000',
  'supreme': 'https://cdn.simpleicons.org/supreme/000000',
};

export function getBrandKey(name: string): string {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function getBrandKeyNormalized(name: string): string {
  if (!name) return '';
  return getBrandKey(name)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[''`]/g, "'")
    .replace(/[().]/g, ''); // Suppression points aussi pour "A.P.C."
}

let _refWebsitesCache: Map<string, string> | null = null;
function getReferenceWebsitesMap(): Map<string, string> {
  if (_refWebsitesCache) return _refWebsitesCache;
  const m = new Map<string, string>();
  for (const [name, url] of Object.entries(REFERENCE_BRAND_WEBSITES)) {
    const k = getBrandKeyNormalized(name);
    if (k && !m.has(k)) m.set(k, url);
    const kRaw = getBrandKey(name);
    if (kRaw && !m.has(kRaw)) m.set(kRaw, url);
  }
  _refWebsitesCache = m;
  return m;
}

export function getBrandLogoUrl(brandName: string, websiteUrl?: string | null): string | null {
  if (!brandName) return null;
  const key = getBrandKey(brandName);
  const keyNorm = getBrandKeyNormalized(brandName);

  // 1. BRAND_LOGOS (hardcoded)
  const fromMap =
    BRAND_LOGOS[key] ??
    BRAND_LOGOS[keyNorm] ??
    BRAND_LOGOS[key.replace(/ /g, '')] ??
    BRAND_LOGOS[keyNorm.replace(/ /g, '')];
  if (fromMap) return fromMap;

  // 2. Simple Icons
  const simpleIconSlug = SIMPLE_ICONS_MAP[keyNorm] ?? SIMPLE_ICONS_MAP[key];
  if (simpleIconSlug) return `https://cdn.simpleicons.org/${simpleIconSlug}/000000`;

  // 3. Clearbit via websiteUrl direct
  if (websiteUrl && websiteUrl.startsWith('http')) {
    try {
      const host = new URL(websiteUrl).hostname.replace(/^www\./, '');
      return `https://logo.clearbit.com/${host}`;
    } catch { }
  }

  // 4. Clearbit via référence
  const refMap = getReferenceWebsitesMap();
  const siteUrl = refMap.get(keyNorm) ?? refMap.get(key);
  if (siteUrl) {
    try {
      const host = new URL(siteUrl).hostname.replace(/^www\./, '');
      return `https://logo.clearbit.com/${host}`;
    } catch { }
  }

  // 5. Fallback : Favicon Google (si siteUrl trouvé mais Clearbit échoue côté client, on tente ça)
  if (siteUrl) {
    try {
      const host = new URL(siteUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
    } catch { }
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
