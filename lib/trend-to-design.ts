/**
 * Utilitaires pour convertir une tendance en design
 * 
 * Permet de copier une tendance directement dans le Design Studio
 */

import { TrendSignal } from './trend-detector';

export interface TrendToDesignData {
  type: string;
  cut: string | null;
  material: string | null;
  details: {
    seams: boolean;
    pockets: boolean;
    zipper: boolean;
    buttons: boolean;
    hood: boolean;
    collar: boolean;
  };
  customPrompt: string;
}

/**
 * Convertir une tendance en données pour le Design Studio
 */
export function trendToDesign(trend: TrendSignal): TrendToDesignData {
  // Déterminer les détails basés sur le type et la coupe
  const details = inferDetailsFromTrend(trend);

  // Créer un prompt personnalisé avec les infos de la tendance
  const customPrompt = generateDesignPrompt(trend);

  return {
    type: trend.productType,
    cut: trend.cut || null,
    material: trend.material || null,
    details,
    customPrompt,
  };
}

/**
 * Inférer les détails du design depuis la tendance
 */
function inferDetailsFromTrend(trend: TrendSignal): {
  seams: boolean;
  pockets: boolean;
  zipper: boolean;
  buttons: boolean;
  hood: boolean;
  collar: boolean;
} {
  const typeLower = trend.productType.toLowerCase();
  const nameLower = trend.productName.toLowerCase();

  return {
    seams: true, // Toujours présent
    pockets: typeLower.includes('cargo') || nameLower.includes('pocket') || nameLower.includes('poche'),
    zipper: typeLower.includes('jacket') || typeLower.includes('veste') || nameLower.includes('zip'),
    buttons: typeLower.includes('shirt') || nameLower.includes('button'),
    hood: typeLower.includes('hoodie') || nameLower.includes('hood'),
    collar: typeLower.includes('shirt') || typeLower.includes('polo') || nameLower.includes('collar'),
  };
}

/**
 * Générer un prompt personnalisé pour le design
 */
function generateDesignPrompt(trend: TrendSignal): string {
  const parts: string[] = [];

  parts.push(`Produit tendance détecté : ${trend.productName}`);
  parts.push(`Type : ${trend.productType}`);
  
  if (trend.cut) {
    parts.push(`Coupe : ${trend.cut}`);
  }
  
  if (trend.material) {
    parts.push(`Matériau : ${trend.material}`);
  }
  
  if (trend.color) {
    parts.push(`Couleur : ${trend.color}`);
  }
  
  if (trend.style) {
    parts.push(`Style : ${trend.style}`);
  }
  
  parts.push(`Détecté chez ${trend.brands.length} marques : ${trend.brands.join(', ')}`);
  parts.push(`Prix moyen marché : ${trend.averagePrice.toFixed(2)}€`);
  
  if (trend.country) {
    parts.push(`Tendance forte en : ${trend.country}`);
  }

  return parts.join('\n');
}
