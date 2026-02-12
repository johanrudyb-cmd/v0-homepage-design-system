#!/usr/bin/env tsx

/**
 * Script de nettoyage automatique des tendances
 * 
 * À exécuter après chaque scraping pour :
 * 1. Recalculer tous les scores de tendance
 * 2. Supprimer les tendances obsolètes (score < 30)
 * 3. Afficher un rapport détaillé
 * 
 * Usage:
 *   npx tsx scripts/cleanup-trends.ts
 *   npx tsx scripts/cleanup-trends.ts --dry-run  (simulation sans suppression)
 */

import {
    recalculateAllTrendScores,
    cleanupOldTrends,
    getTrendFactorsForProduct,
    calculateTrendScore,
} from '../lib/trend-scoring';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const dryRun = process.argv.includes('--dry-run');

    console.log('🧹 Nettoyage automatique des tendances\n');
    console.log(`Mode: ${dryRun ? '🔍 SIMULATION (dry-run)' : '⚠️  SUPPRESSION RÉELLE'}\n`);

    // 1. Recalculer tous les scores
    console.log('📊 Étape 1/3 : Recalcul des scores de tendance...');
    const { updated, averageScore } = await recalculateAllTrendScores();
    console.log(`✅ ${updated} produits mis à jour`);
    console.log(`📈 Score moyen : ${averageScore.toFixed(1)}/100\n`);

    // 2. Identifier les produits à supprimer
    console.log('🔍 Étape 2/3 : Identification des tendances obsolètes...');
    const cleanup = await cleanupOldTrends(dryRun);
    console.log(`🗑️  ${cleanup.toDelete} produits à supprimer`);
    console.log(`✅ ${cleanup.keptIds.length} produits conservés\n`);

    // 3. Afficher les détails des produits supprimés (top 10)
    if (cleanup.deletedIds.length > 0) {
        console.log('📋 Détails des produits supprimés (top 10) :');
        const toShow = cleanup.deletedIds.slice(0, 10);

        for (const id of toShow) {
            const product = await prisma.trendProduct.findUnique({
                where: { id },
            });

            if (product) {
                const factors = await getTrendFactorsForProduct(id);
                const scoreResult = calculateTrendScore(factors);

                console.log(`\n  • ${product.name}`);
                console.log(`    Score: ${scoreResult.score}/100 - ${scoreResult.reason}`);
                console.log(`    Récurrence: ${factors.recurrenceCount}x | Vu il y a ${factors.daysSinceLastSeen}j`);
            }
        }

        if (cleanup.deletedIds.length > 10) {
            console.log(`\n  ... et ${cleanup.deletedIds.length - 10} autres produits`);
        }
    }

    // 4. Statistiques finales
    console.log('\n\n📊 Statistiques finales :');

    const stats = await prisma.trendProduct.groupBy({
        by: ['marketZone'],
        _count: true,
    });

    console.log('\nProduits par zone géographique :');
    for (const stat of stats) {
        console.log(`  ${stat.marketZone || 'Non défini'}: ${stat._count} produits`);
    }

    const segmentStats = await prisma.trendProduct.groupBy({
        by: ['segment'],
        _count: true,
    });

    console.log('\nProduits par segment :');
    for (const stat of segmentStats) {
        console.log(`  ${stat.segment || 'Non défini'}: ${stat._count} produits`);
    }

    // 5. Top tendances
    console.log('\n\n🔥 Top 10 tendances actuelles :');
    const topTrends = await prisma.trendProduct.findMany({
        orderBy: { trendScore: 'desc' },
        take: 10,
    });

    for (let i = 0; i < topTrends.length; i++) {
        const product = topTrends[i];
        console.log(`  ${i + 1}. ${product.name}`);
        console.log(`     Score: ${product.trendScore}/100 | ${product.category} | ${product.marketZone}`);
    }

    console.log('\n\n✅ Nettoyage terminé !\n');

    if (dryRun) {
        console.log('💡 Pour effectuer les suppressions réelles, relancez sans --dry-run\n');
    }

    await prisma.$disconnect();
}

main().catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
});
