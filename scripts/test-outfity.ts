
import * as dotenv from 'dotenv';
dotenv.config();

import { enrichProductDetails } from '../lib/api/chatgpt'; // Utilisons ChatGPT pour le test si Claude est bloqué
import { computeTrendScore } from '../lib/trend-product-kpis';

async function testOutfity() {
    console.log('🚀 Test du moteur Outfity Intelligence (via ChatGPT)...\n');

    const products = [
        {
            name: "Hoodie Oversized Bordeaux avec Nœuds",
            category: "Hoodie",
            averagePrice: 45,
            description: "Un hoodie large avec des détails de nœuds sur les manches, couleur cerise foncée."
        },
        {
            name: "T-shirt Blanc Basique",
            category: "T-shirt",
            averagePrice: 15,
            description: "T-shirt simple col rond blanc."
        }
    ];

    for (const p of products) {
        console.log(`--- Analyse de : "${p.name}" ---`);
        try {
            const result = await enrichProductDetails(p as any);

            // Calcul du score IVS via notre nouvel algo
            const ivs = computeTrendScore(
                null,
                null,
                result.visualAttractivenessScore as number
            );

            console.log(`✅ IVS calculé : ${ivs}%`);
            console.log(`📌 Attribut Dominant : ${result.dominantAttribute}`);
            console.log(`📊 Analyse Outfity : ${result.businessAnalysis || 'N/A'}`);
            console.log(`✨ Style : ${result.style || 'N/A'}`);

            if (ivs < 70) {
                console.log('⚠️  VERDICT : Ce produit serait FILTRÉ (IVS < 70)\n');
            } else {
                console.log('🔥 VERDICT : Ce produit est VALIDÉ (Top 15 Outfity)\n');
            }
        } catch (e) {
            console.error('Erreur analyse:', e);
        }
    }
}

testOutfity().catch(console.error);
