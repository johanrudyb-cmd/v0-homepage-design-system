/**
 * Système de scoring intelligent pour les tendances
 * 
 * Calcule un score de tendance (0-100) basé sur plusieurs indicateurs :
 * 1. Récurrence : Combien de fois le produit apparaît dans les scrapes
 * 2. Fraîcheur : Depuis combien de temps le produit est présent
 * 3. Multi-zones : Présence dans plusieurs marchés (EU, US, ASIA)
 * 4. Croissance : Données de croissance du site source (si disponibles)
 * 5. Engagement : Favoris, vues (si disponibles)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TrendScoreFactors {
    /** Nombre de fois vu dans les scrapes (0-10+) */
    recurrenceCount: number;
    /** Jours depuis première apparition (0-30+) */
    daysSinceFirstSeen: number;
    /** Jours depuis dernière apparition (0-7+) */
    daysSinceLastSeen: number;
    /** Nombre de zones géographiques (1-3) */
    marketZoneCount: number;
    /** Pourcentage de croissance source (0-100) */
    sourceGrowthPercent?: number;
    /** Nombre de favoris utilisateurs (0-100+) */
    favoritesCount?: number;
    /** Présence dans plusieurs segments (homme + femme) */
    multiSegment?: boolean;
}

export interface TrendScoreResult {
    score: number; // 0-100
    shouldKeep: boolean; // true si score >= seuil
    reason: string; // Explication du score
    breakdown: {
        recurrenceScore: number;
        freshnessScore: number;
        multiZoneScore: number;
        growthScore: number;
        engagementScore: number;
    };
}

/**
 * Calcule le score de tendance d'un produit
 */
export function calculateTrendScore(factors: TrendScoreFactors): TrendScoreResult {
    // 1. Score de récurrence (40 points max)
    // Plus un produit apparaît souvent, plus il est tendance
    const recurrenceScore = Math.min(40, factors.recurrenceCount * 5);

    // 2. Score de fraîcheur (25 points max)
    // Produits récents = plus tendance
    // Pénalité si pas vu récemment
    let freshnessScore = 0;

    // Bonus si récent (< 7 jours)
    if (factors.daysSinceFirstSeen <= 7) {
        freshnessScore += 15;
    } else if (factors.daysSinceFirstSeen <= 14) {
        freshnessScore += 10;
    } else if (factors.daysSinceFirstSeen <= 30) {
        freshnessScore += 5;
    }

    // Pénalité si pas vu récemment
    if (factors.daysSinceLastSeen === 0) {
        freshnessScore += 10; // Vu aujourd'hui
    } else if (factors.daysSinceLastSeen <= 3) {
        freshnessScore += 7;
    } else if (factors.daysSinceLastSeen <= 7) {
        freshnessScore += 3;
    } else {
        freshnessScore -= (factors.daysSinceLastSeen - 7) * 2; // Pénalité croissante
    }

    freshnessScore = Math.max(0, Math.min(25, freshnessScore));

    // 3. Score multi-zones (20 points max)
    // Présent dans plusieurs marchés = tendance globale
    const multiZoneScore = Math.min(20, (factors.marketZoneCount - 1) * 10);

    // 4. Score de croissance source (10 points max)
    // Si le site source donne un % de croissance
    const growthScore = factors.sourceGrowthPercent
        ? Math.min(10, factors.sourceGrowthPercent / 10)
        : 0;

    // 5. Score d'engagement (5 points max)
    // Favoris, vues, etc.
    const engagementScore = factors.favoritesCount
        ? Math.min(5, factors.favoritesCount / 2)
        : 0;

    // Bonus multi-segment (+5 points)
    const multiSegmentBonus = factors.multiSegment ? 5 : 0;

    // Score total
    const totalScore = Math.min(
        100,
        recurrenceScore + freshnessScore + multiZoneScore + growthScore + engagementScore + multiSegmentBonus
    );

    // Seuil de conservation : 30 points minimum
    const KEEP_THRESHOLD = 30;
    const shouldKeep = totalScore >= KEEP_THRESHOLD;

    // Explication
    let reason = '';
    if (totalScore >= 70) {
        reason = 'Tendance forte : récurrence élevée et présence récente';
    } else if (totalScore >= 50) {
        reason = 'Tendance modérée : présence régulière';
    } else if (totalScore >= KEEP_THRESHOLD) {
        reason = 'Tendance émergente : à surveiller';
    } else if (factors.daysSinceLastSeen > 14) {
        reason = 'Tendance obsolète : pas vu depuis 2+ semaines';
    } else {
        reason = 'Tendance faible : récurrence insuffisante';
    }

    return {
        score: Math.round(totalScore),
        shouldKeep,
        reason,
        breakdown: {
            recurrenceScore: Math.round(recurrenceScore),
            freshnessScore: Math.round(freshnessScore),
            multiZoneScore: Math.round(multiZoneScore),
            growthScore: Math.round(growthScore),
            engagementScore: Math.round(engagementScore),
        },
    };
}

/**
 * Calcule les facteurs de score pour un produit existant en base
 */
export async function getTrendFactorsForProduct(productId: string): Promise<TrendScoreFactors> {
    const product = await prisma.trendProduct.findUnique({
        where: { id: productId },
        include: {
            favorites: true,
        },
    });

    if (!product) {
        throw new Error(`Product ${productId} not found`);
    }

    // Compter les occurrences de produits similaires (même signature)
    const similarProducts = await prisma.trendProduct.findMany({
        where: {
            productSignature: product.productSignature,
        },
    });

    const recurrenceCount = similarProducts.length;

    // Calculer les jours depuis première/dernière apparition
    const now = new Date();
    const daysSinceFirstSeen = Math.floor(
        (now.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysSinceLastSeen = Math.floor(
        (now.getTime() - product.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Compter les zones géographiques uniques
    const uniqueZones = new Set(
        similarProducts.map((p) => p.marketZone).filter(Boolean)
    );
    const marketZoneCount = uniqueZones.size;

    // Compter les segments uniques
    const uniqueSegments = new Set(
        similarProducts.map((p) => p.segment).filter(Boolean)
    );
    const multiSegment = uniqueSegments.size > 1;

    return {
        recurrenceCount,
        daysSinceFirstSeen,
        daysSinceLastSeen,
        marketZoneCount,
        sourceGrowthPercent: product.trendGrowthPercent ?? undefined,
        favoritesCount: product.favorites.length,
        multiSegment,
    };
}

/**
 * Met à jour le score de tendance d'un produit
 */
export async function updateProductTrendScore(productId: string): Promise<TrendScoreResult> {
    const factors = await getTrendFactorsForProduct(productId);
    const scoreResult = calculateTrendScore(factors);

    await prisma.trendProduct.update({
        where: { id: productId },
        data: {
            trendScore: scoreResult.score,
        },
    });

    return scoreResult;
}

/**
 * Nettoie les anciennes tendances (score < seuil)
 * Retourne le nombre de produits supprimés
 */
export async function cleanupOldTrends(dryRun = false): Promise<{
    toDelete: number;
    deletedIds: string[];
    keptIds: string[];
}> {
    const allProducts = await prisma.trendProduct.findMany({
        include: { favorites: true },
    });

    const toDelete: string[] = [];
    const kept: string[] = [];

    for (const product of allProducts) {
        const factors = await getTrendFactorsForProduct(product.id);
        const scoreResult = calculateTrendScore(factors);

        if (!scoreResult.shouldKeep) {
            toDelete.push(product.id);
        } else {
            kept.push(product.id);
        }
    }

    if (!dryRun && toDelete.length > 0) {
        await prisma.trendProduct.deleteMany({
            where: {
                id: { in: toDelete },
            },
        });
    }

    return {
        toDelete: toDelete.length,
        deletedIds: toDelete,
        keptIds: kept,
    };
}

/**
 * Recalcule tous les scores de tendance
 */
export async function recalculateAllTrendScores(): Promise<{
    updated: number;
    averageScore: number;
}> {
    const allProducts = await prisma.trendProduct.findMany();
    let totalScore = 0;

    for (const product of allProducts) {
        const scoreResult = await updateProductTrendScore(product.id);
        totalScore += scoreResult.score;
    }

    return {
        updated: allProducts.length,
        averageScore: allProducts.length > 0 ? totalScore / allProducts.length : 0,
    };
}
