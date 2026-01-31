/**
 * Algorithme de Prédiction de Tendances
 * 
 * Analyse multi-critères pour prédire les tendances avant qu'elles ne deviennent mainstream
 * 
 * Critères analysés :
 * 1. Vitesse de croissance (trend velocity)
 * 2. Diversité des marques (pas seulement les 5 grandes)
 * 3. Diversité géographique
 * 4. Historique temporel (première apparition, évolution)
 * 5. Prix moyen et stabilité
 * 6. Section (New In = émergent, Best Sellers = confirmé)
 * 7. Style et cohérence
 */

import { prisma } from '@/lib/prisma';

export interface TrendPrediction {
  productKey: string; // "type|cut|material"
  productName: string;
  productType: string;
  cut: string | null;
  material: string | null;
  color: string | null;
  
  // Scores de prédiction (0-100)
  predictionScore: number; // Score global de prédiction
  velocityScore: number; // Vitesse de croissance
  diversityScore: number; // Diversité marques + pays
  emergenceScore: number; // Score d'émergence (New In vs Best Sellers)
  priceStabilityScore: number; // Stabilité du prix
  
  // Métriques
  brands: string[];
  countries: string[];
  averagePrice: number;
  priceRange: { min: number; max: number };
  firstSeenAt: Date;
  lastSeenAt: Date;
  daysSinceFirstSeen: number;
  appearanceCount: number;
  newInCount: number; // Nombre de fois en "New In"
  bestSellersCount: number; // Nombre de fois en "Best Sellers"
  
  // Prédiction
  predictedPeakDate: Date | null; // Date estimée du pic de tendance
  confidenceLevel: 'low' | 'medium' | 'high'; // Niveau de confiance
  trendPhase: 'emerging' | 'growing' | 'peak' | 'declining'; // Phase de la tendance
  style: string | null;
}

/**
 * Calculer le score de vitesse de croissance (trend velocity)
 * 
 * Plus un produit apparaît rapidement dans plusieurs marques,
 * plus le score est élevé.
 */
function calculateVelocityScore(
  firstSeenAt: Date,
  lastSeenAt: Date,
  appearanceCount: number,
  uniqueBrands: number
): number {
  const daysDiff = Math.max(1, Math.ceil((lastSeenAt.getTime() - firstSeenAt.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Vitesse = (nombre d'apparitions * nombre de marques) / jours écoulés
  const velocity = (appearanceCount * uniqueBrands) / daysDiff;
  
  // Normaliser entre 0 et 100
  // Vitesse > 2 = très rapide (score 100)
  // Vitesse 1-2 = rapide (score 50-100)
  // Vitesse < 1 = lent (score 0-50)
  const score = Math.min(100, (velocity / 2) * 100);
  
  return Math.round(score);
}

/**
 * Calculer le score de diversité
 * 
 * Plus il y a de marques et de pays différents, plus le score est élevé.
 */
function calculateDiversityScore(
  uniqueBrands: number,
  uniqueCountries: number
): number {
  // Score basé sur le nombre de marques (max 5 grandes marques, mais peut être plus)
  const brandScore = Math.min(100, (uniqueBrands / 5) * 100);
  
  // Score basé sur le nombre de pays (max 10 pays = score 100)
  const countryScore = Math.min(100, (uniqueCountries / 10) * 100);
  
  // Moyenne pondérée : 60% marques, 40% pays
  const diversityScore = (brandScore * 0.6) + (countryScore * 0.4);
  
  return Math.round(diversityScore);
}

/**
 * Calculer le score d'émergence
 * 
 * Les produits en "New In" sont plus prédictifs que ceux en "Best Sellers"
 * (qui sont déjà mainstream).
 */
function calculateEmergenceScore(
  newInCount: number,
  bestSellersCount: number,
  totalCount: number
): number {
  if (totalCount === 0) return 0;
  
  // Ratio New In / Total
  const newInRatio = newInCount / totalCount;
  
  // Plus le ratio New In est élevé, plus c'est émergent
  // 100% New In = score 100 (très émergent)
  // 0% New In = score 0 (déjà mainstream)
  const emergenceScore = newInRatio * 100;
  
  return Math.round(emergenceScore);
}

/**
 * Calculer le score de stabilité du prix
 * 
 * Un prix stable indique une tendance mature et fiable.
 */
function calculatePriceStabilityScore(
  prices: number[]
): number {
  if (prices.length === 0) return 50; // Score moyen si pas de données
  
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  
  // Coefficient de variation (stdDev / avg)
  const cv = stdDev / avg;
  
  // Plus le CV est faible, plus le prix est stable
  // CV < 0.1 = très stable (score 100)
  // CV 0.1-0.3 = stable (score 70-100)
  // CV > 0.3 = instable (score 0-70)
  const stabilityScore = Math.max(0, 100 - (cv * 200));
  
  return Math.round(stabilityScore);
}

/**
 * Déterminer la phase de la tendance
 */
function determineTrendPhase(
  daysSinceFirstSeen: number,
  velocityScore: number,
  appearanceCount: number
): 'emerging' | 'growing' | 'peak' | 'declining' {
  // Emerging : < 7 jours, vitesse élevée, peu d'apparitions
  if (daysSinceFirstSeen < 7 && velocityScore > 70 && appearanceCount < 5) {
    return 'emerging';
  }
  
  // Growing : 7-30 jours, vitesse élevée, apparitions croissantes
  if (daysSinceFirstSeen >= 7 && daysSinceFirstSeen < 30 && velocityScore > 50) {
    return 'growing';
  }
  
  // Peak : 30-90 jours, beaucoup d'apparitions, vitesse modérée
  if (daysSinceFirstSeen >= 30 && daysSinceFirstSeen < 90 && appearanceCount > 10) {
    return 'peak';
  }
  
  // Declining : > 90 jours ou vitesse faible
  if (daysSinceFirstSeen >= 90 || velocityScore < 30) {
    return 'declining';
  }
  
  // Par défaut, growing
  return 'growing';
}

/**
 * Calculer le niveau de confiance
 */
function calculateConfidenceLevel(
  predictionScore: number,
  uniqueBrands: number,
  appearanceCount: number
): 'low' | 'medium' | 'high' {
  // High : Score > 70, 3+ marques, 5+ apparitions
  if (predictionScore > 70 && uniqueBrands >= 3 && appearanceCount >= 5) {
    return 'high';
  }
  
  // Medium : Score 50-70, 2+ marques, 3+ apparitions
  if (predictionScore >= 50 && uniqueBrands >= 2 && appearanceCount >= 3) {
    return 'medium';
  }
  
  // Low : Sinon
  return 'low';
}

/**
 * Prédire la date du pic de tendance
 */
function predictPeakDate(
  firstSeenAt: Date,
  trendPhase: 'emerging' | 'growing' | 'peak' | 'declining',
  velocityScore: number
): Date | null {
  if (trendPhase === 'peak' || trendPhase === 'declining') {
    return null; // Déjà passé le pic
  }
  
  // Estimation basée sur la phase et la vitesse
  let daysToPeak = 30; // Par défaut 30 jours
  
  if (trendPhase === 'emerging') {
    // Très rapide = pic dans 2-3 semaines
    // Lent = pic dans 6-8 semaines
    daysToPeak = velocityScore > 70 ? 14 : 45;
  } else if (trendPhase === 'growing') {
    // En croissance, pic dans 2-4 semaines
    daysToPeak = velocityScore > 60 ? 14 : 28;
  }
  
  const peakDate = new Date(firstSeenAt);
  peakDate.setDate(peakDate.getDate() + daysToPeak);
  
  return peakDate;
}

/**
 * Prédire les tendances depuis les signaux existants
 */
export async function predictTrends(limit: number = 20): Promise<TrendPrediction[]> {
  // Récupérer tous les signaux (même non confirmés) pour l'analyse
  const signals = await prisma.trendSignal.findMany({
    orderBy: {
      lastSeenAt: 'desc',
    },
    take: 500, // Analyser les 500 plus récents
  });

  // Grouper par produit (type + cut + material)
  const productGroups = new Map<string, typeof signals>();
  
  for (const signal of signals) {
    const key = `${signal.productType}|${signal.cut || ''}|${signal.material || ''}`;
    if (!productGroups.has(key)) {
      productGroups.set(key, []);
    }
    productGroups.get(key)!.push(signal);
  }

  const predictions: TrendPrediction[] = [];

  for (const [key, groupSignals] of productGroups.entries()) {
    if (groupSignals.length === 0) continue;

    const firstSignal = groupSignals[0];
    const uniqueBrands = new Set(groupSignals.map(s => s.brand));
    const uniqueCountries = new Set(groupSignals.map(s => s.country).filter(Boolean));
    const prices = groupSignals.map(s => s.price);
    
    // Compter New In vs Best Sellers
    const newInCount = groupSignals.filter(s => s.sourceSection === 'new_in').length;
    const bestSellersCount = groupSignals.filter(s => s.sourceSection === 'best_sellers').length;
    
    // Dates
    const firstSeenAt = new Date(Math.min(...groupSignals.map(s => s.firstSeenAt.getTime())));
    const lastSeenAt = new Date(Math.max(...groupSignals.map(s => s.lastSeenAt.getTime())));
    const daysSinceFirstSeen = Math.ceil((lastSeenAt.getTime() - firstSeenAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculer les scores
    const velocityScore = calculateVelocityScore(
      firstSeenAt,
      lastSeenAt,
      groupSignals.length,
      uniqueBrands.size
    );
    
    const diversityScore = calculateDiversityScore(
      uniqueBrands.size,
      uniqueCountries.size
    );
    
    const emergenceScore = calculateEmergenceScore(
      newInCount,
      bestSellersCount,
      groupSignals.length
    );
    
    const priceStabilityScore = calculatePriceStabilityScore(prices);
    
    // Score global de prédiction (moyenne pondérée)
    // Velocity 30%, Diversity 25%, Emergence 25%, Price Stability 20%
    const predictionScore = Math.round(
      (velocityScore * 0.30) +
      (diversityScore * 0.25) +
      (emergenceScore * 0.25) +
      (priceStabilityScore * 0.20)
    );
    
    // Déterminer la phase
    const trendPhase = determineTrendPhase(
      daysSinceFirstSeen,
      velocityScore,
      groupSignals.length
    );
    
    // Niveau de confiance
    const confidenceLevel = calculateConfidenceLevel(
      predictionScore,
      uniqueBrands.size,
      groupSignals.length
    );
    
    // Prédire la date du pic
    const predictedPeakDate = predictPeakDate(firstSeenAt, trendPhase, velocityScore);
    
    // Style le plus fréquent
    const styles = groupSignals.map(s => s.style).filter(Boolean);
    const styleCounts = new Map<string, number>();
    styles.forEach(s => styleCounts.set(s!, (styleCounts.get(s!) || 0) + 1));
    const mostCommonStyle = Array.from(styleCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const prediction: TrendPrediction = {
      productKey: key,
      productName: firstSignal.productName,
      productType: firstSignal.productType,
      cut: firstSignal.cut,
      material: firstSignal.material,
      color: firstSignal.color,
      
      predictionScore,
      velocityScore,
      diversityScore,
      emergenceScore,
      priceStabilityScore,
      
      brands: Array.from(uniqueBrands),
      countries: Array.from(uniqueCountries) as string[],
      averagePrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
      firstSeenAt,
      lastSeenAt,
      daysSinceFirstSeen,
      appearanceCount: groupSignals.length,
      newInCount,
      bestSellersCount,
      
      predictedPeakDate,
      confidenceLevel,
      trendPhase,
      style: mostCommonStyle,
    };

    predictions.push(prediction);
  }

  // Trier par score de prédiction décroissant
  predictions.sort((a, b) => b.predictionScore - a.predictionScore);

  return predictions.slice(0, limit);
}

/**
 * Obtenir les tendances émergentes (phase = emerging)
 */
export async function getEmergingTrends(limit: number = 10): Promise<TrendPrediction[]> {
  const predictions = await predictTrends(100);
  return predictions
    .filter(p => p.trendPhase === 'emerging')
    .slice(0, limit);
}

/**
 * Obtenir les tendances en croissance (phase = growing)
 */
export async function getGrowingTrends(limit: number = 10): Promise<TrendPrediction[]> {
  const predictions = await predictTrends(100);
  return predictions
    .filter(p => p.trendPhase === 'growing')
    .slice(0, limit);
}
