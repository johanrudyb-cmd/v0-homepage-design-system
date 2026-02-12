#!/usr/bin/env tsx

/**
 * 📈 AUTOMATION MENSUELLE - MARQUES TENDANCES
 * 
 * Ce script utilise l'IA pour générer le Top 10 des marques tendances du mois
 * et met à jour la base de données.
 * 
 * Usage:
 *   npx tsx scripts/update-trending-brands.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { generateMonthlyTrendingBrands } from '../lib/api/chatgpt';

const prisma = new PrismaClient();

async function main() {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    console.log(`🚀 Mise à jour des marques tendances pour : ${monthKey}\n`);

    try {
        console.log('🧠 Analyse du marché via l\'IA...');
        const topBrands = await generateMonthlyTrendingBrands();

        console.log(`✅ IA a généré ${topBrands.length} marques.`);

        // On utilise une transaction pour tout mettre à jour proprement
        await prisma.$transaction(async (tx) => {
            // Facultatif : on peut décider de supprimer les anciennes marques du mois si on relance le script
            await tx.trendingBrand.deleteMany({
                where: { month: monthKey }
            });

            for (const b of topBrands) {
                await tx.trendingBrand.create({
                    data: {
                        rank: b.rank,
                        brand: b.brand,
                        score: b.score,
                        scoreValue: b.scoreValue,
                        signaturePiece: b.signaturePiece,
                        dominantStyle: b.dominantStyle,
                        cyclePhase: b.cyclePhase,
                        launchPotential: b.launchPotential,
                        indicativePrice: b.indicativePrice,
                        websiteUrl: b.websiteUrl,
                        month: monthKey,
                    }
                });
                console.log(`   [#${b.rank}] ${b.brand} ajouté.`);
            }
        });

        console.log('\n✨ Mise à jour terminée avec succès !');

    } catch (error: any) {
        console.error('💥 Erreur lors de la mise à jour:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
