import { prisma } from './prisma';
import { fetchFashionNews } from './news-ingestor';
import { fetchSocialSignals } from './social-ingestor';
import { refreshAllTrends } from './refresh-all-trends';
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.CHATGPT_API_KEY || process.env.OPENAI_API_KEY,
});

/**
 * L'ORCHESTRATEUR "BRAIN" (Outfity Engine)
 * Cycle complet : News -> Social -> Products -> AI Analysis -> DB
 */
export async function runBiangoryCycle(fastMode: boolean = false) {
    console.log(`--- [Outfity Brain] Starting ${fastMode ? 'TURBO' : 'Daily'} Cycle ---`);

    // 1. COLLECTER L'INTELLIGENCE (Zéro Budget)
    console.log('[Step 1/4] Collecting News & Events...');
    const news = await fetchFashionNews();
    const contextNews = news.map(n => n.title).join(' | ');

    console.log('[Step 2/4] Collecting Social Signals (TikTok/Pinterest)...');
    const signals = await fetchSocialSignals();
    const contextSocial = signals.map(s => `${s.platform}: ${s.trendName}`).join(', ');

    // 3. COLLECTER LES DONNÉES DE RÉFÉRENCE (Fournisseurs & Marque)
    console.log('[Step 3/5] Loading Reference Data (Factories & Brand)...');
    const factories = await prisma.factory.findMany({
        select: { id: true, name: true, specialties: true, country: true, moq: true }
    });
    const brand = await prisma.brand.findFirst();
    const brandContext = brand ? `Marque: ${brand.name}, Style Guide: ${JSON.stringify(brand.styleGuide)}` : "Positionnement mode standard européen (Milieu de gamme)";

    const factoriesContext = factories.map(f => `ID: ${f.id}, Nom: ${f.name}, Spécialités: ${f.specialties.join(', ')}, Pays: ${f.country}`).join(' | ');

    // 4. COLLECTER LES PRODUITS (Zara/ASOS existants)
    console.log('[Step 4/5] Scraping Retailers (Zara/Asos)...');
    // En mode TURBO on ne prend que 5 articles par source pour aller hyper vite
    const refreshResult = await refreshAllTrends(2, fastMode ? 5 : undefined);

    if (refreshResult.savedCount === 0) {
        console.log('No new products to analyze.');
        return;
    }

    // 5. ANALYSE IA GÉNÉRALE
    console.log('[Step 5/5] Brain Processing (GPT-4o Analysis)...');

    const latestProducts = await prisma.trendProduct.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    for (const product of latestProducts) {
        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `Tu es le cerveau stratégique de Outfity. Ta mission est d'analyser un produit en fonction de l'actualité, du social, et de ton catalogue FOURNISSEURS.
                        
                        CONTEXTE MONDIAL DU JOUR : ${contextNews}
                        SIGNAUX SOCIAUX : ${contextSocial}
                        CONTEXTE MARQUE : ${brandContext}
                        LISTE FOURNISSEURS DISPONIBLES : ${factoriesContext}
                        
                        Réponds en JSON strict avec :
                        - productSignature: Un "Ticker" court de style (ex: "OVERSIZE_TEE", "RETRO_JERSEY", "BAGGY_JEANS") pour regrouper ce produit avec ses semblables.
                        - predictedScore60d: (0-100)
                        - productionSafety: "SÛR" | "RISQUÉ" | "DANGER"
                        - suggestedRetailPrice: Calculer le prix de vente idéal (Float) par rapport au positionnement de la marque et au prix marché de ${product.averagePrice}€
                        - matchedSupplierId: L'ID de l'usine la plus adaptée (parmi la liste fournie) pour produire ce type de pièce
                        - opportunityReason: Pourquoi c'est une opportunité maintenant ?
                        - upcomingCatalysts: JSON array [{name, impact}]
                        - aiConfidence: (0-100)`
                    },
                    {
                        role: 'user',
                        content: `Analyse ce produit : ${product.name} (Catégorie: ${product.category}, Marque: ${product.sourceBrand})`
                    }
                ],
                response_format: { type: 'json_object' }
            });

            const result = JSON.parse(completion.choices[0].message.content || '{}');

            await (prisma.trendProduct.update as any)({
                where: { id: product.id },
                data: {
                    productSignature: result.productSignature || product.category.toUpperCase().replace(' ', '_'),
                    predictedScore60d: result.predictedScore60d || 50,
                    productionSafety: result.productionSafety || 'SÛR',
                    suggestedRetailPrice: result.suggestedRetailPrice || product.averagePrice,
                    matchedSupplierId: result.matchedSupplierId || null,
                    opportunityReason: result.opportunityReason || '',
                    upcomingCatalysts: result.upcomingCatalysts || [],
                    aiConfidence: result.aiConfidence || 90
                }
            });
            console.log(`[AI Analysis] Optimized product with Supplier & Price: ${product.name}`);
        } catch (err) {
            console.error(`Failed to optimize product ${product.name}:`, err);
        }
    }

    console.log('--- [Outfity Brain] Cycle Complete ---');
}
