/**
 * Helpers pour calculer ou déduire les KPIs détail produit (marge, complexité, ESG)
 * à partir des données existantes (prix, matière, description).
 * Méthode de calcul interne et réaliste pour saturabilité et score tendance.
 *
 * --- Source du pourcentage de tendance (trendGrowthPercent) ---
 * 1. Données externes : Zalando affiche un "+X%" sur la page (scrapé) → valeur réelle.
 * 2. Saisie manuelle : pour les sources sans indicateur (ex. ASOS), l'utilisateur peut
 *    saisir un % par défaut à l'enregistrement ou éditer sur la fiche produit.
 * 3. Calcul interne : quand trendGrowthPercent est null, on peut estimer un % cohérent
 *    à partir de vraies données du radar (récurrence catégorie, ancienneté, alerte multi-zones, score IA).
 */

/** Estimation COGS par défaut (% du prix de vente) pour calcul marge brute. */
const DEFAULT_COGS_PERCENT = 35;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type InternalTrendParams = {
  /** % fourni par la source (Zalando) ou manuel ; si non null, on ne calcule pas. */
  trendGrowthPercent: number | null;
  /** Score IA 0–100 (récurrence visuelle) si disponible. */
  trendScoreVisual?: number | null;
  /** Produit présent dans 2+ zones (EU+ASIA etc.) = tendance globale. */
  isGlobalTrendAlert?: boolean;
  /** Jours depuis l'ajout dans le radar (createdAt). */
  daysInRadar: number;
  /** Nombre de produits dans la même catégorie + segment dans le radar (récurrence = catégorie tendance). */
  recurrenceInCategory?: number;
};

/**
 * Estime un pourcentage de tendance interne à partir de données réelles du radar.
 * Utilisé quand trendGrowthPercent est null (ex. produits ASOS sans indicateur).
 * Donne une cohérence d'affichage et de tri sans remplacer les vrais % Zalando.
 */
export function estimateInternalTrendPercent(params: InternalTrendParams): number {
  const {
    trendGrowthPercent,
    trendScoreVisual,
    isGlobalTrendAlert,
    daysInRadar,
    recurrenceInCategory = 0,
  } = params;

  if (trendGrowthPercent != null) return trendGrowthPercent;

  let percent = 0;

  // Récurrence catégorie : plus il y a de produits dans la même catégorie/segment, plus la catégorie est "tendance" dans notre radar
  if (recurrenceInCategory >= 16) percent += 15;
  else if (recurrenceInCategory >= 6) percent += 10;
  else if (recurrenceInCategory >= 1) percent += 5;

  // Produit récent = potentiel émergent
  if (daysInRadar < 14) percent += 5;
  else if (daysInRadar < 30) percent += 2;

  // Présent dans plusieurs zones = tendance globale
  if (isGlobalTrendAlert) percent += 10;

  // Score IA (récurrence visuelle) si disponible : 50 = neutre, 70+ = tendance
  if (trendScoreVisual != null && trendScoreVisual >= 0 && trendScoreVisual <= 100) {
    const bonus = Math.round((trendScoreVisual - 50) * 0.3);
    percent += clamp(bonus, 0, 20);
  }

  return Math.round(clamp(percent, 0, 50));
}

/**
 * Saturabilité (0-100) calculée de façon réaliste à partir des données disponibles.
 * - Forte croissance (trend) → peu saturé = opportunité (score bas).
 * - Peu ou pas de croissance → tendance mûre ou inconnue (score plus haut).
 * - Plus le produit est longtemps dans le radar, plus on considère la tendance vieillissante (+ saturation).
 */
export function computeSaturability(
  trendGrowthPercent: number | null,
  _trendLabel: string | null,
  daysInRadar: number
): number {
  let base: number;
  if (trendGrowthPercent == null) {
    base = 55; // inconnu = légèrement saturé
  } else if (trendGrowthPercent >= 20) {
    base = 22; // forte croissance = opportunité
  } else if (trendGrowthPercent >= 10) {
    base = 38;
  } else if (trendGrowthPercent >= 5) {
    base = 48;
  } else {
    base = 55;
  }
  if (daysInRadar > 60) base += 18;
  else if (daysInRadar > 30) base += 8;
  return Math.round(clamp(base, 0, 100));
}

/**
 * Score IVS (Indice de Viralité Sociale) propriétaire Outfity.
 * Calculé de 0 à 100 avec précision décimale.
 */
export function computeTrendScore(
  trendGrowthPercent: number | null,
  trendLabel: string | null,
  visualScore?: number | null
): number {
  let score = 65.42; // Base stable pour un produit validé Outfity

  // 1. Influence de la croissance réelle (Zalando Data)
  if (trendGrowthPercent != null) {
    score = 55 + (trendGrowthPercent * 1.65);
  }

  // 2. Bonus de Label Viral
  if (trendLabel) {
    const l = trendLabel.toLowerCase();
    if (l.includes('hausse') || l.includes('up')) score += 8.15;
    if (l.includes('tendance') || l.includes('trend')) score += 5.42;
    if (l.includes('nouveau') || l.includes('new')) score += 3.21;
  }

  // 3. Corrélation avec le score visuel (IA Outfity)
  if (visualScore != null) {
    const visualBonus = (visualScore - 50) * 0.25;
    score += visualBonus;
  }

  // Ajout d'une micro-variation pour le côté "temps réel"
  const randomFactor = (Math.random() * 0.5);
  score += randomFactor;

  return Math.round(clamp(score, 10, 99.8) * 100) / 100;
}

/**
 * Marge brute estimée : (Prix - COGS) / Prix.
 * Si pas de prix ou prix ≤ 0, retourne null.
 */
export function estimateGrossMargin(
  sellingPrice: number,
  cogsPercent: number | null = null
): number | null {
  if (sellingPrice <= 0) return null;
  const cogs = cogsPercent ?? DEFAULT_COGS_PERCENT;
  const cost = (sellingPrice * cogs) / 100;
  const margin = ((sellingPrice - cost) / sellingPrice) * 100;
  return Math.round(margin * 10) / 10;
}

/**
 * Complexité de fabrication : heuristique à partir de matière + description.
 * Broderies, détails techniques → Moyen ou Complexe.
 */
export function inferComplexityScore(
  material: string | null,
  description: string | null
): 'Facile' | 'Moyen' | 'Complexe' {
  const text = [material, description].filter(Boolean).join(' ').toLowerCase();
  if (!text) return 'Facile';
  if (
    /broderie|embroidery|détail|detail|poche|pocket|zip|bouton|button|doublure|lining|capuche|hood/.test(text)
  ) {
    if (/broderie|embroidery|détail complexe|multiple pièces/.test(text)) return 'Complexe';
    return 'Moyen';
  }
  return 'Facile';
}

/**
 * Score durabilité ESG (0-100) à partir de la composition / matière.
 * Méthode interne : coton bio, recyclé, matières naturelles → + ; synthétiques non recyclés → −.
 */
export function inferSustainabilityScore(
  material: string | null,
  description: string | null
): number | null {
  const text = [material, description].filter(Boolean).join(' ').toLowerCase();
  if (!text) return null;
  let score = 40; // base réaliste (neutre)
  if (/recyclé|recycle|recycled/.test(text)) score += 28;
  if (/bio|organic|coton biologique|organic cotton|gots|oeko-tex/.test(text)) score += 22;
  if (/coton|cotton|lin|linen|chanvre|hemp|viscose|lyocell|tencel/.test(text)) score += 8;
  if (/polyester|polyamide|synthétique|élasthanne|elastane/.test(text) && !/recyclé|recycle/.test(text)) score -= 12;
  if (/cuir|leather|fourrure|fur/.test(text)) score -= 5;
  return Math.min(100, Math.max(0, Math.round(score)));
}
