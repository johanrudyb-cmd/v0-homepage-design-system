#!/usr/bin/env tsx

/**
 * ⚡ SCRAPING TOTAL - OUTFITY
 * 
 * Scrape TOUTES les sources configurées (Zalando, Zara, ASOS 18-24, etc.)
 * et envoie les données au Webhook intelligent pour filtrage IA et enrichissement.
 * 
 * Usage:
 *   npx tsx scripts/scrape-all-trends.ts              # Toutes les sources
 *   npx tsx scripts/scrape-all-trends.ts --quick      # 2 sources (Zalando + ASOS)
 */

import 'dotenv/config';
import { getAllSources } from '../lib/hybrid-radar-sources';
import { scrapeHybridSource } from '../lib/hybrid-radar-scraper';
import { notifyAdmin } from '../lib/admin-notifications';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const WEBHOOK_URL = `${BASE_URL}/api/webhooks/n8n-trend-save`;
const API_KEY = process.env.N8N_WEBHOOK_SECRET || 'bmad_n8n_secret_default_2024';

async function main() {
    const args = process.argv.slice(2);
    const quick = args.includes('--quick');

    console.log('🚀 Démarrage du Scraping Global (Zalando, ASOS 18-24, Zara)\n');

    let sources = getAllSources();

    // Filtrage si mode rapide
    if (quick) {
        console.log('⚡ Mode Rapide activé (2 sources sélectionnées)');
        const zalando = sources.find(s => s.id === 'zalando-trend-femme-paris');
        const asos = sources.find(s => s.id === 'asos-18-24-homme');
        const asosFille = sources.find(s => s.id === 'asos-fille-fr');
        sources = [zalando, asos, asosFille].filter(Boolean) as any;
    }

    console.log(`📡 Sources à scraper : ${sources.length}`);
    console.log(`🔗 Webhook cible : ${WEBHOOK_URL}\n`);

    for (const source of sources) {
        console.log(`\n🔍 Scrape en cours : ${source.id} (${source.brand})`);

        try {
            const items = await scrapeHybridSource(source);
            console.log(`✅ ${items.length} produits extraits.`);

            if (items.length > 0) {
                console.log(`📤 Envoi de ${items.length} produits au Webhook IA (par lots de 5)...`);

                const batchSize = 5;
                let totalSaved = 0;
                let totalSkipped = 0;

                for (let i = 0; i < items.length; i += batchSize) {
                    const batch = items.slice(i, i + batchSize);

                    // Préparation des données pour le webhook
                    const webhookData = {
                        items: batch.map(item => ({
                            name: item.name,
                            price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0,
                            imageUrl: item.imageUrl,
                            sourceUrl: item.sourceUrl,
                            sourceBrand: source.brand,
                            marketZone: source.marketZone,
                            segment: source.segment,
                            trendGrowthPercent: item.trendGrowthPercent,
                            trendLabel: item.trendLabel,
                            productBrand: item.name.split(' ')[0], // Extraction naïve de la marque
                            composition: item.composition,
                            color: item.color,
                            articleNumber: item.articleNumber
                        }))
                    };

                    console.log(`📡 Envoye lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}...`);

                    // Envoi au Webhook (avec l'IA Bouncer et l'Enrichissement)
                    const response = await fetch(WEBHOOK_URL, {
                        method: 'POST',
                        headers: {
                            'x-api-key': API_KEY,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(webhookData)
                    });

                    if (!response.ok) {
                        console.error(`❌ Échec du lot à l'index ${i}: Erreur HTTP ${response.status}`);
                        continue;
                    }

                    const result = await response.json() as any;
                    totalSaved += result.saved || 0;
                    totalSkipped += (result.skipped || 0) + (result.banned || 0);
                }

                console.log(`✨ Résultats cumulés : ${totalSaved} sauvés, ${totalSkipped} ignorés.`);
            }

        } catch (error: any) {
            console.error(`❌ Erreur sur la source ${source.id}:`, error.message);
            // On notifie mais on ne bloque pas les autres sources
            notifyAdmin({
                title: `Erreur Source: ${source.id}`,
                message: error.message,
                type: 'scrape_error',
                priority: 'high'
            });
        }
    }

    console.log('\n🏁 Scraping Global Terminé !');
    console.log('Les produits sont maintenant filtrés par l\'IA et enrichis en base de données.');

    await notifyAdmin({
        title: 'Scraping Terminé',
        message: 'Le scraping global est terminé. Les nouvelles tendances sont en ligne.',
        emoji: '🏁',
        type: 'scrape_success',
        priority: 'normal'
    });
}

main().catch(async err => {
    console.error('💥 Erreur fatale:', err);
    await notifyAdmin({
        title: 'Crash Script Scraping',
        message: String(err),
        type: 'system_error',
        priority: 'critical'
    });
    process.exit(1);
});
