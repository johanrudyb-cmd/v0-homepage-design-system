
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Tagger : Analyse visuelle ultra-rapide pour classer les produits
 * Coût estimé : ~0.005$ pour 100 produits (GPT-4o-mini)
 */
async function runAITagging() {
    console.log('🤖 Démarrage du AI Tagger (Classification Visuelle)...');

    // 1. Trouver les produits mal classés (pas de style ou style générique)
    // On prend ceux qui ont une image mais pas de style défini
    const productsToTag = await prisma.trendProduct.findMany({
        where: {
            imageUrl: { not: null },
            // Style est obligatoire, pas de null
            style: { in: ['', 'Autre', 'Inconnu', 'Basique'] }
        },
        take: 50 // On fait par lots de 50 pour tester
    });

    console.log(`📸 ${productsToTag.length} produits trouvés à analyser.`);

    if (productsToTag.length === 0) {
        console.log('✅ Tous les produits sont déjà taggués !');
        return;
    }

    let successCount = 0;

    for (const product of productsToTag) {
        if (!product.imageUrl) continue;

        try {
            console.log(`   > Analyse de ${product.name.substring(0, 30)}...`);

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Modèle Vision Rapide & Pas Cher
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Tu es un expert mode. Analyse ce vêtement et classe-le dans une catégorie SIMPLE et un style SIMPLE compréhensible par tous. Réponds UNIQUEMENT avec un objet JSON : { \"category\": \"STRING\", \"style\": \"STRING\" }. \n\nCatégories autorisées (Liste stricte): \n- T-SHIRT\n- CHEMISE\n- PULL\n- SWEAT\n- VESTE\n- MANTEAU\n- JEAN\n- PANTALON\n- SHORT\n- ROBE\n- JUPE\n- ENSEMBLE\n\nStyles autorisés (Liste stricte): \n- Basique\n- Oversize\n- Slim\n- Large\n- Court\n- Long\n- Imprimé\n- Sport\n- Chic\n\nExemple de réponse:\n{ \"category\": \"PANTALON\", \"style\": \"Large\" }"
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: product.imageUrl,
                                    detail: "low"
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 50,
            });

            const content = response.choices[0].message.content;
            if (!content) continue;

            // Nettoyage du JSON (parfois GPT ajoute ```json ... ```)
            const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const tags = JSON.parse(jsonString);

            if (tags.category && tags.style) {
                // Mise à jour DB avec un NOM SIMPLE et PUR
                const cleanName = `${tags.category} ${tags.style}`; // Ex: "JEAN Large"

                await prisma.trendProduct.update({
                    where: { id: product.id },
                    data: {
                        category: tags.category,
                        style: tags.style,
                        name: cleanName // On écrase l'ancien nom compliqué
                    }
                });
                console.log(`      ✅ Renommé en : ${cleanName}`);
                successCount++;
            }

        } catch (error) {
            console.error(`      ❌ Erreur sur ${product.id}:`, error);
        }
    }

    console.log(`🎉 Terminé ! ${successCount}/${productsToTag.length} produits taggués et classés.`);
}

// Exécution directe
runAITagging()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
