/**
 * Script pour scanner directement les tendances (sans passer par l'API)
 * 
 * Usage: npx tsx scripts/scan-trends-direct.ts
 */

import { scrapeAllBigBrands } from '@/lib/big-brands-scraper';
import { saveTrendSignals } from '@/lib/trend-detector';

async function main() {
  console.log('🚀 Début du scan des grandes marques...\n');

  try {
    // Scraper toutes les marques (inclure les marques moyennes)
    console.log('📡 Scraping des marques en cours...');
    const products = await scrapeAllBigBrands(true);

    if (products.length === 0) {
      console.log('⚠️  Aucun produit trouvé');
      return;
    }

    console.log(`✅ ${products.length} produits scrapés\n`);

    // Sauvegarder et détecter les tendances
    console.log('🔍 Détection des tendances...');
    const result = await saveTrendSignals(products);

    console.log('\n📊 Résultats :');
    console.log('─'.repeat(50));
    console.log(`   Produits scrapés : ${products.length}`);
    console.log(`   Signaux créés : ${result.created}`);
    console.log(`   Signaux mis à jour : ${result.updated}`);
    console.log(`   Tendances confirmées : ${result.confirmed}`);
    console.log('');

    if (result.confirmed > 0) {
      console.log('✅ Des tendances ont été confirmées !');
      console.log('   → Allez sur /trends pour les voir');
    } else {
      console.log('⚠️  Aucune tendance confirmée pour le moment');
      console.log('   → Les tendances nécessitent 3+ marques avec le même produit');
      console.log('   → Relancez le scan après quelques heures pour plus de données');
    }

    console.log('');
  } catch (error: any) {
    console.error('❌ Erreur lors du scan:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
