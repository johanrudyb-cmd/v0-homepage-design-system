/**
 * Segment Audience → Styles Dominants → Marques de Référence (Top & Niche).
 * Utilisé en Phase 1 Stratégie marketing pour afficher les marques selon le public cible et le positionnement.
 */

import { TARGET_AUDIENCE_OPTIONS } from '@/lib/constants/identity-options';

export interface AudienceReferenceRow {
  /** Libellé segment (aligné avec TARGET_AUDIENCE_OPTIONS ou clé de mapping) */
  audience: string;
  styles: string[];
  brands: string[];
}

/** Correspondance option Phase 0 "Public cible" → clé dans AUDIENCE_REFERENCE_BRANDS */
export const AUDIENCE_TO_REFERENCE_KEY: Record<string, string> = {
  'Étudiants et jeunes actifs': 'Étudiants / J. Actifs',
};

export const AUDIENCE_REFERENCE_BRANDS: AudienceReferenceRow[] = [
  { audience: '18-24 ans, Gen Z', styles: ['Streetwear', 'Gorpcore', 'Fast-Fashion'], brands: ['Corteiz', 'Hellstar', 'Jaded London', 'Trapstar', 'No Faith Studios', 'Zara', 'Broken Planet', 'Minus Two', 'PACCBET'] },
  { audience: '25-34 ans, Millennials', styles: ['Parisian Minimalist', 'Smart Casual', 'Gorpcore'], brands: ['Ami Paris', 'Our Legacy', 'Arket', "Arc'teryx", 'Axel Arigato', 'Nanushka', 'Ganni', 'A.P.C.', 'Maison Kitsuné', 'Wood Wood'] },
  { audience: '35-50 ans, actifs', styles: ['Smart Casual', 'Quiet Luxury', 'Workwear'], brands: ['Massimo Dutti', 'Loro Piana', 'Carhartt WIP', 'Boglioli', 'Canali', "Tod's", 'Façonnable', 'Hackett', 'Barbour', 'Santoni'] },
  { audience: 'Femmes 18-35', styles: ['Luxe accessible', 'Minimaliste', 'Fast-Fashion'], brands: ['Jacquemus', 'Ganni', 'Sandro', 'Maje', 'Rouje', 'Reformation', 'COS', 'Mango', 'Musier Paris', 'Paloma Wool', 'Staud'] },
  { audience: 'Femmes 35-50', styles: ['Quiet Luxury', 'Parisian Minimalist', 'Prêt-à-porter'], brands: ['The Row', 'Khaite', 'Toteme', 'Lemaire', 'Loewe', 'Old Céline', 'Max Mara', 'Joseph', 'Phoebe Philo', 'Jil Sander'] },
  { audience: 'Hommes 18-35', styles: ['Néo-Vintage Sport', 'Streetwear', 'Gorpcore'], brands: ['Aimé Leon Dore', 'Represent', 'Salomon', 'Kith', 'Rhude', 'Autry', 'Fear of God (Essentials)', 'Stüssy', 'JJJJound'] },
  { audience: 'Hommes 35-50', styles: ['Smart Casual', 'Workwear', 'Industrial Chic'], brands: ['Officine Générale', 'Stone Island', 'Dickies', 'Filson', 'C.P. Company', 'Engineered Garments', "Drake's", 'Belstaff'] },
  { audience: 'Unisexe 18-30', styles: ['Streetwear', 'Heritage Streetwear', 'Eco-Basics'], brands: ['Supreme', 'Palace', 'Stüssy', 'Colorful Standard', 'Vans', 'Converse', 'Pangaia', 'Telfar', 'Marine Serre', '1989 Studio'] },
  { audience: 'Unisexe 25-45', styles: ['Minimaliste', 'Parisian Minimalist', 'Eco-Basics'], brands: ['Studio Nicholson', 'Sunspel', 'Norse Projects', 'Patagonia', 'Veja', 'Asket', 'Margaret Howell', 'Auralee', 'Lemaire'] },
  { audience: 'Urbains, 18-35 ans', styles: ['Industrial Chic', 'Gorpcore', 'Techwear'], brands: ['A-Cold-Wall*', '1017 ALYX 9SM', 'Nike ACG', 'Snow Peak', 'White Mountaineering', 'GR10K', 'Affix', 'Post Archive Faction'] },
  { audience: 'Professionnels 30-50 ans', styles: ['Quiet Luxury', 'Smart Casual', 'Minimaliste'], brands: ['Brunello Cucinelli', 'Zegna', 'Theory', 'Vince', 'SuitSupply', 'Reiss', 'Auralee', 'Jil Sander', 'Canali', 'Dunhill'] },
  { audience: 'Étudiants / J. Actifs', styles: ['Fast-Fashion Tailoring', 'Néo-Vintage Sport'], brands: ['Bershka', 'Pull&Bear', 'Weekday', 'Adidas Originals', 'New Balance', 'Uniqlo', 'Reserved', 'H&M', 'Dickies', 'Champion'] },
  { audience: 'Lifestyle premium', styles: ['Luxe accessible', 'Prêt-à-porter', 'Design'], brands: ['Maison Margiela', 'Dries Van Noten', 'Prada', 'Miu Miu', 'Rick Owens', 'Casablanca', 'Acne Studios', 'Jacquemus'] },
  { audience: 'Sportifs / outdoor', styles: ['Gorpcore', 'Sportswear', 'Performance'], brands: ['Nike', 'Under Armour', 'On Running', 'Haglöfs', 'Mammut', 'Descente', 'Goldwin', 'Oakley', 'Hoka', 'District Vision'] },
];

export interface ReferenceBrandDisplay {
  name: string;
  slug: string;
}

/** Sites web des marques de référence (pour favicon + liens Phase 1) */
export const REFERENCE_BRAND_WEBSITES: Record<string, string> = {
  'Zara': 'https://www.zara.com',
  'Adidas': 'https://www.adidas.com',
  'Adidas Originals': 'https://www.adidas.com',
  'Nike': 'https://www.nike.com',
  'H&M': 'https://www.hm.com',
  'Mango': 'https://www.mango.com',
  'Mango Man': 'https://www.mango.com',
  "Arc'teryx": 'https://www.arcteryx.com',
  'Stone Island': 'https://www.stoneisland.com',
  'Carhartt WIP': 'https://www.carhartt-wip.com',
  'Ami Paris': 'https://www.amiparis.com',
  'Salomon': 'https://www.salomon.com',
  'Massimo Dutti': 'https://www.massimodutti.com',
  'H&M Edition': 'https://www.hm.com',
  'Uniqlo': 'https://www.uniqlo.com',
  'Converse': 'https://www.converse.com',
  'Vans': 'https://www.vans.com',
  'Patagonia': 'https://www.patagonia.com',
  'Veja': 'https://www.veja-store.com',
  'Prada': 'https://www.prada.com',
  'Jacquemus': 'https://www.jacquemus.com',
  'New Balance': 'https://www.newbalance.com',
  'COS': 'https://www.cosstores.com',
  'Supreme': 'https://www.supremenewyork.com',
  'Palace': 'https://www.palaceskateboards.com',
  'Stüssy': 'https://www.stussy.com',
  'Dickies': 'https://www.dickies.com',
  'Champion': 'https://www.champion.com',
  'Under Armour': 'https://www.underarmour.com',
  'Oakley': 'https://www.oakley.com',
  'Hoka': 'https://www.hoka.com',
  'On Running': 'https://www.on-running.com',
  'Reformation': 'https://www.thereformation.com',
  'Sandro': 'https://www.sandro-paris.com',
  'Maje': 'https://www.maje.com',
  'Lemaire': 'https://www.lemaire.fr',
  'Loewe': 'https://www.loewe.com',
  'Jil Sander': 'https://www.jilsander.com',
  'Aimé Leon Dore': 'https://www.aimeleondore.com',
  'Kith': 'https://www.kith.com',
  'Ganni': 'https://www.ganni.com',
  'Our Legacy': 'https://www.ourlegacy.se',
  'Arket': 'https://www.arket.com',
  'Bershka': 'https://www.bershka.com',
  'Pull&Bear': 'https://www.pullandbear.com',
  'Reserved': 'https://www.reserved.com',
  'Corteiz': 'https://www.crtz.xyz',
  'Trapstar': 'https://www.trapstarlondon.com',
  'Pangaia': 'https://www.pangaia.com',
  'Telfar': 'https://www.telfar.net',
  'Marine Serre': 'https://www.marineserre.com',
  'Norse Projects': 'https://www.norseprojects.com',
  'Asket': 'https://www.asket.com',
  'SuitSupply': 'https://www.suitsupply.com',
  'Theory': 'https://www.theory.com',
  'Brunello Cucinelli': 'https://www.brunellocucinelli.com',
  'Zegna': 'https://www.zegna.com',
  'Canali': 'https://www.canali.com',
  'Belstaff': 'https://www.belstaff.com',
  'Filson': 'https://www.filson.com',
  'Barbour': 'https://www.barbour.com',
  'Loro Piana': 'https://www.loropiana.com',
  "Tod's": 'https://www.tods.com',
  'Maison Margiela': 'https://www.maisonmargiela.com',
  'Dries Van Noten': 'https://www.driesvannoten.com',
  'Miu Miu': 'https://www.miumiu.com',
  'Rick Owens': 'https://www.rickowens.eu',
  'Acne Studios': 'https://www.acnestudios.com',
  'Haglöfs': 'https://www.haglofs.com',
  'Mammut': 'https://www.mammut.com',
  'Descente': 'https://www.descente.com',
  'Officine Générale': 'https://www.officinegenerale.com',
  'C.P. Company': 'https://www.cpcompany.com',
  'Engineered Garments': 'https://www.engineeredgarments.com',
  "Drake's": 'https://www.drakes.com',
  // Marques supplémentaires (favicon = logo affiché)
  'Hellstar': 'https://www.hellstar.com',
  'Jaded London': 'https://www.jadedlondon.com',
  'Broken Planet': 'https://www.brokenplanetmarket.com',
  'Minus Two': 'https://www.minustwo.com',
  'Axel Arigato': 'https://www.axelarigato.com',
  'Nanushka': 'https://www.nanushka.com',
  'A.P.C.': 'https://www.apc.fr',
  'Maison Kitsuné': 'https://www.maisonkitsune.com',
  'Wood Wood': 'https://www.woodwood.com',
  'Boglioli': 'https://www.boglioli.com',
  'Façonnable': 'https://www.faconnable.com',
  'Hackett': 'https://www.hackett.com',
  'Santoni': 'https://www.santoni.com',
  'Rouje': 'https://www.rouje.com',
  'Musier Paris': 'https://www.musier-paris.com',
  'Paloma Wool': 'https://www.palomawool.com',
  'Staud': 'https://www.staud.clothing',
  'The Row': 'https://www.therow.com',
  'Khaite': 'https://www.khaite.com',
  'Toteme': 'https://www.toteme-studio.com',
  'Max Mara': 'https://www.maxmara.com',
  'Joseph': 'https://www.joseph-fashion.com',
  'Represent': 'https://www.representclothing.com',
  'Rhude': 'https://www.rhude.com',
  'Autry': 'https://www.autry.com',
  'Fear of God (Essentials)': 'https://www.fearofgod.com',
  'JJJJound': 'https://www.jjjjound.com',
  'Colorful Standard': 'https://www.colorfulstandard.com',
  '1989 Studio': 'https://www.1989studio.com',
  'Studio Nicholson': 'https://www.studionicholson.com',
  'Sunspel': 'https://www.sunspel.com',
  'Margaret Howell': 'https://www.margarethowell.com',
  'Auralee': 'https://www.auralee.jp',
  'A-Cold-Wall*': 'https://www.acoldwall.com',
  '1017 ALYX 9SM': 'https://www.alyxstudio.com',
  'Nike ACG': 'https://www.nike.com',
  'Snow Peak': 'https://www.snowpeak.com',
  'White Mountaineering': 'https://www.whitemountaineering.com',
  'GR10K': 'https://www.gr10k.com',
  'Vince': 'https://www.vince.com',
  'Reiss': 'https://www.reiss.com',
  'Dunhill': 'https://www.dunhill.com',
  'Weekday': 'https://www.weekday.com',
  'Casablanca': 'https://www.casablancaparis.com',
  'Goldwin': 'https://www.goldwin.jp',
  'District Vision': 'https://www.districtvision.com',
  // Complément pour favicon (toutes les marques de référence)
  'No Faith Studios': 'https://nofaithstudios.com',
  'Post Archive Faction': 'https://postarchivefaction.com',
  'Phoebe Philo': 'https://www.phoebephilo.com',
  'Old Céline': 'https://www.celine.com',
  'Affix': 'https://affix-works.com',
};

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/'/g, '-')
    .replace(/&/g, 'and')
    .replace(/[()]/g, '');
}

function rowToDisplay(row: AudienceReferenceRow): ReferenceBrandDisplay[] {
  return row.brands.map((name) => ({
    name: name.trim(),
    slug: toSlug(name),
  }));
}

/** Liste de secours : toutes les marques de référence (tous segments), dédupliquées par nom. */
function getAllReferenceBrandsFallback(): ReferenceBrandDisplay[] {
  const seen = new Set<string>();
  const out: ReferenceBrandDisplay[] = [];
  for (const row of AUDIENCE_REFERENCE_BRANDS) {
    for (const name of row.brands) {
      const n = name.trim();
      if (n && !seen.has(n.toLowerCase())) {
        seen.add(n.toLowerCase());
        out.push({ name: n, slug: toSlug(n) });
      }
    }
  }
  return out;
}

/**
 * Tokens de style dérivés du positionnement (ex. "Gorpcore / Techwear" → ["gorpcore", "techwear"]).
 */
function positioningToStyleTokens(positioning: string): string[] {
  const raw = positioning
    .toLowerCase()
    .trim()
    .split(/[/,]| et /)
    .map((s) => s.trim())
    .filter(Boolean);
  const tokens = new Set<string>();
  for (const t of raw) {
    tokens.add(t);
    if (t.includes(' ')) tokens.add(t.replace(/\s+/g, ' '));
  }
  return Array.from(tokens);
}

/** Nombre max de marques affichées par positionnement (évite des listes trop longues pour des styles larges). */
const MAX_BRANDS_PER_POSITIONING = 20;

/**
 * Retourne l’index du premier style de la ligne qui matche un token (0 = style principal).
 * Retourne -1 si aucun match.
 */
function getBestStyleMatchIndex(rowStyles: string[], tokens: string[]): number {
  for (let i = 0; i < rowStyles.length; i++) {
    const s = rowStyles[i];
    if (tokens.some((t) => s === t || s.includes(t) || t.includes(s))) return i;
  }
  return -1;
}

/**
 * Retourne les marques de référence en priorité par positionnement (style).
 * Les segments où le style est en tête (ex. Gorpcore en 1er) sont prioritaires ; le nombre de marques est plafonné.
 * Ne retourne jamais [] : fallback sur toutes les marques si aucun match.
 */
export function getReferenceBrandsForPositioning(positioning: string): ReferenceBrandDisplay[] {
  if (!positioning?.trim()) return getAllReferenceBrandsFallback();
  const tokens = positioningToStyleTokens(positioning);
  const rowsWithScore: { row: AudienceReferenceRow; styleIndex: number }[] = [];
  for (const row of AUDIENCE_REFERENCE_BRANDS) {
    const rowStyles = row.styles.map((s) => s.toLowerCase().trim());
    const styleIndex = getBestStyleMatchIndex(rowStyles, tokens);
    if (styleIndex >= 0) rowsWithScore.push({ row, styleIndex });
  }
  // Trier : d’abord les lignes où le style est en tête (styleIndex 0), puis 1, puis 2…
  rowsWithScore.sort((a, b) => a.styleIndex - b.styleIndex);
  const seen = new Set<string>();
  const out: ReferenceBrandDisplay[] = [];
  for (const { row } of rowsWithScore) {
    if (out.length >= MAX_BRANDS_PER_POSITIONING) break;
    for (const name of row.brands) {
      if (out.length >= MAX_BRANDS_PER_POSITIONING) break;
      const n = name.trim();
      if (!n) continue;
      const key = n.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ name: n, slug: toSlug(n) });
    }
  }
  return out.length ? out : getAllReferenceBrandsFallback();
}

/**
 * Retourne les libellés "Public cible" compatibles avec le positionnement choisi.
 * Seules les cibles dont les styles correspondent au positionnement sont proposées, pour éviter les erreurs.
 */
export function getTargetAudienceOptionsForPositioning(positioning: string): string[] {
  if (!positioning?.trim()) return [];
  const tokens = positioningToStyleTokens(positioning);
  const matchingRows = AUDIENCE_REFERENCE_BRANDS.filter((row) => {
    const rowStyles = row.styles.map((s) => s.toLowerCase().trim());
    return tokens.some(
      (t) =>
        rowStyles.some((s) => s === t || s.includes(t) || t.includes(s))
    );
  });
  const matchingAudienceKeys = new Set(
    matchingRows.map((r) => r.audience.toLowerCase().trim())
  );
  return (TARGET_AUDIENCE_OPTIONS as readonly string[]).filter((option) => {
    const refKey = (AUDIENCE_TO_REFERENCE_KEY[option] ?? option).toLowerCase().trim();
    return (
      matchingAudienceKeys.has(refKey) ||
      [...matchingAudienceKeys].some(
        (mk) => mk.includes(refKey) || refKey.includes(mk)
      )
    );
  });
}

/**
 * Retourne les marques de référence pour un segment audience. Ne retourne jamais [] :
 * - correspondance exacte sur le libellé audience,
 * - sinon correspondance partielle (audience contient le segment ou l’inverse),
 * - sinon liste de secours (toutes les marques, dédupliquées).
 */
export function getReferenceBrandsForAudience(
  targetAudience: string,
  _positioning?: string
): ReferenceBrandDisplay[] {
  if (!targetAudience?.trim()) return getAllReferenceBrandsFallback();
  const key = (AUDIENCE_TO_REFERENCE_KEY[targetAudience] ?? targetAudience).toLowerCase().trim();
  let row = AUDIENCE_REFERENCE_BRANDS.find(
    (r) => r.audience.toLowerCase().trim() === key
  );
  if (row) return rowToDisplay(row);
  row = AUDIENCE_REFERENCE_BRANDS.find(
    (r) => r.audience.toLowerCase().includes(key) || key.includes(r.audience.toLowerCase())
  );
  if (row) return rowToDisplay(row);
  return getAllReferenceBrandsFallback();
}

/**
 * Retourne la ligne de référence pour un segment audience (ou undefined).
 */
function getRowForAudience(targetAudience: string): AudienceReferenceRow | undefined {
  if (!targetAudience?.trim()) return undefined;
  const key = (AUDIENCE_TO_REFERENCE_KEY[targetAudience] ?? targetAudience).toLowerCase().trim();
  return AUDIENCE_REFERENCE_BRANDS.find(
    (r) =>
      r.audience.toLowerCase().trim() === key ||
      r.audience.toLowerCase().includes(key) ||
      key.includes(r.audience.toLowerCase())
  );
}

/**
 * Détecte une incohérence entre le positionnement choisi et le public cible :
 * le segment audience a des "styles dominants" typiques ; si le positionnement
 * ne correspond à aucun de ces styles, on considère que c'est incohérent.
 * Retourne true si cohérent, false si incohérent (ou si l'un des deux est vide, on considère cohérent).
 */
export function isPositioningConsistentWithAudience(
  positioning: string,
  targetAudience: string
): boolean {
  if (!positioning?.trim() || !targetAudience?.trim()) return true;
  const row = getRowForAudience(targetAudience);
  if (!row) return true;
  const p = positioning.toLowerCase().trim();
  const styles = row.styles.map((s) => s.toLowerCase().trim());
  return styles.some((s) => {
    const pFirst = p.split(/[/,]/)[0]?.trim() ?? p;
    return p.includes(s) || s.includes(p) || s.includes(pFirst) || pFirst.includes(s);
  });
}

/**
 * Message d'alerte en cas d'incohérence positionnement / public cible.
 */
export function getPositioningAudienceInconsistencyMessage(
  positioning: string,
  targetAudience: string
): string | null {
  if (isPositioningConsistentWithAudience(positioning, targetAudience)) return null;
  const row = getRowForAudience(targetAudience);
  const typicalStyles = row?.styles.join(', ') ?? '';
  return `Le positionnement « ${positioning} » ne correspond pas aux styles habituels du segment « ${targetAudience} » (typiquement : ${typicalStyles}). Vous pouvez modifier l'un ou l'autre en Phase 0 Identité pour plus de cohérence.`;
}
