import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inferCategory } from '@/lib/infer-trend-category';
import { cleanProductTitle } from '@/lib/utils';
import { computeSaturability, computeTrendScore } from '@/lib/trend-product-kpis';

/**
 * Webhook sécurisé pour n8n afin d'enregistrer des nouvelles tendances.
 * Sécurité : Requiert un header 'x-api-key' correspondant à N8N_WEBHOOK_SECRET
 * 
 * Body attendu :
 * {
 *   items: [
 *     {
 *       name: string,
 *       price: number,
 *       imageUrl: string,
 *       sourceUrl: string,
 *       sourceBrand: "Zalando" | "ASOS" | "Zara", // Utilisé en interne uniquement
 *       marketZone: "FR" | "EU" | "US",
 *       segment: "homme" | "femme",
 *       trendGrowthPercent?: number,
 *       trendLabel?: string,
 *       productBrand?: string, // La vraie marque (ex: Nike) - si absente, on nettoie
 *       composition?: string,
 *       color?: string,
 *       articleNumber?: string
 *     }
 *   ]
 * }
 */

import { isProductValidClothing, enrichProductDetails } from '@/lib/api/chatgpt';

export async function POST(req: Request) {
    try {
        const apiKey = req.headers.get('x-api-key');
        const secret = process.env.N8N_WEBHOOK_SECRET || 'bmad_n8n_secret_default_2024';

        if (process.env.NODE_ENV === 'production' && secret === 'bmad_n8n_secret_default_2024') {
            console.warn('[WEBHOOK] ATTENTION: Utilisation du secret par défaut en production !');
        }

        if (apiKey !== secret) {
            console.error('[WEBHOOK] Tentative échouée avec clé:', apiKey?.slice(0, 4) + '...');
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { items } = await req.json();

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Aucun item fourni' }, { status: 400 });
        }

        let savedCount = 0;
        let skippedCount = 0;
        let bannedCount = 0;

        for (const item of items) {
            if (!item.name || !item.sourceUrl) {
                skippedCount++;
                continue;
            }

            // 1. Filtrage Intelligent "Bouncer" (IA Vision)
            const validation = await isProductValidClothing(item.imageUrl || '', item.name);
            if (!validation.valid) {
                console.log(`[Bouncer] Banni: ${item.name} - Raison: ${validation.reason}`);
                bannedCount++;
                continue;
            }

            // 2. Nettoyage du titre (et anonymisation source)
            let cleanName = (cleanProductTitle(item.name) || item.name).trim().slice(0, 500);

            // On retire explicitement toute mention de ASOS ou de ses sous-marques
            const anonymizeRegex = /\b(asos design|asos edition|asos luxe|asos curve|asos unique|asos white|asos)\b/gi;
            cleanName = cleanName.replace(anonymizeRegex, '').replace(/\s{2,}/g, ' ').trim();

            // 3. Identification de la marque "propre"
            let finalBrand = item.productBrand?.trim();
            const forbiddenBrands = ['zalando', 'asos', 'zara', 'global partner', 'partner'];

            if (!finalBrand || forbiddenBrands.includes(finalBrand.toLowerCase()) || anonymizeRegex.test(finalBrand)) {
                const firstWords = cleanName.split(' ')[0];
                if (firstWords && firstWords.length > 2 && !forbiddenBrands.includes(firstWords.toLowerCase())) {
                    finalBrand = firstWords;
                } else {
                    finalBrand = null;
                }
            }

            const initialCategory = inferCategory(item.name);

            // 4. Enrichissement IA Complet (Business, Design, Style)
            // On ne le fait que si le produit n'existe pas encore ou s'il est vide
            const existing = await prisma.trendProduct.findFirst({
                where: { sourceUrl: item.sourceUrl }
            });

            let enrichment: any = {};
            if (!existing || !existing.businessAnalysis) {
                try {
                    enrichment = await enrichProductDetails({
                        name: cleanName,
                        category: initialCategory,
                        averagePrice: item.price || 0,
                        imageUrl: item.imageUrl,
                        productBrand: finalBrand,
                    });
                } catch (e) {
                    console.error('[IA Enrichment Error]', e);
                }
            }

            // 5. Calculs KPIs initiaux
            const trendGrowth = item.trendGrowthPercent ?? 15;
            const trendLabel = item.trendLabel ?? 'En hausse';
            const saturability = computeSaturability(trendGrowth, trendLabel, 0);
            const trendScore = computeTrendScore(trendGrowth, trendLabel);

            const productData = {
                name: cleanName,
                category: enrichment.category || initialCategory,
                averagePrice: item.price || 0,
                imageUrl: item.imageUrl,
                trendGrowthPercent: trendGrowth,
                trendLabel: trendLabel,
                productBrand: enrichment.productBrand || finalBrand,
                description: enrichment.description || (item.composition ? `Composition: ${item.composition}` : undefined),
                color: enrichment.color || item.color,
                articleNumber: item.articleNumber,
                style: enrichment.style || '',
                material: enrichment.material || item.composition || 'Non spécifié',
                businessAnalysis: enrichment.businessAnalysis,
                complexityScore: enrichment.complexityScore,
                estimatedCogsPercent: enrichment.estimatedCogsPercent,
                sustainabilityScore: enrichment.sustainabilityScore,
                visualAttractivenessScore: enrichment.visualAttractivenessScore,
                dominantAttribute: enrichment.dominantAttribute,
                cut: enrichment.cut,
            };

            if (existing) {
                await prisma.trendProduct.update({
                    where: { id: existing.id },
                    data: productData,
                });
            } else {
                await prisma.trendProduct.create({
                    data: {
                        ...productData,
                        sourceUrl: item.sourceUrl,
                        sourceBrand: item.sourceBrand || 'Partner',
                        marketZone: item.marketZone || 'EU',
                        segment: item.segment || 'homme',
                        trendScore,
                        trendScoreVisual: enrichment.visualAttractivenessScore || trendScore,
                        saturability,
                    },
                });
            }

            savedCount++;
        }

        return NextResponse.json({
            success: true,
            saved: savedCount,
            skipped: skippedCount
        });

    } catch (error: any) {
        console.error('[N8N Webhook Error]', error);
        if (error.stack) console.error(error.stack);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
