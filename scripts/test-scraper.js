/**
 * Script de test pour le scraper Shopify
 * Permet de tester le scraping sans passer par l'API et les limites
 * 
 * Usage: node scripts/test-scraper.js <URL>
 * Exemple: node scripts/test-scraper.js https://exemple.myshopify.com
 */

const { scrapeShopifyStore } = require('../lib/shopify-scraper');

async function testScraper() {
  const url = process.argv[2];

  if (!url) {
    console.error('❌ Veuillez fournir une URL Shopify');
    console.log('Usage: node scripts/test-scraper.js <URL>');
    console.log('Exemple: node scripts/test-scraper.js https://exemple.myshopify.com');
    process.exit(1);
  }

  console.log('🔍 Test du scraper Shopify...\n');
  console.log(`📦 URL: ${url}\n`);
  console.log('⏳ Scraping en cours (cela peut prendre 10-15 secondes)...\n');

  try {
    const startTime = Date.now();
    const data = await scrapeShopifyStore(url);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('✅ Scraping réussi!\n');
    console.log('📊 Données extraites:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🏪 Nom de la boutique: ${data.storeName}`);
    console.log(`🎨 Thème: ${data.theme.name || 'Non détecté'} ${data.theme.version ? `v${data.theme.version}` : ''}`);
    console.log(`\n🎨 Couleurs:`);
    console.log(`   - Primaire: ${data.colors.primary || 'Non détectée'}`);
    console.log(`   - Secondaire: ${data.colors.secondary || 'Non détectée'}`);
    console.log(`   - Accent: ${data.colors.accent || 'Non détectée'}`);
    console.log(`\n📝 Polices:`);
    console.log(`   - Heading: ${data.fonts.heading || 'Non détectée'}`);
    console.log(`   - Body: ${data.fonts.body || 'Non détectée'}`);
    console.log(`\n📱 Apps détectées (${data.apps.length}):`);
    if (data.apps.length > 0) {
      data.apps.forEach(app => console.log(`   - ${app}`));
    } else {
      console.log('   Aucune app détectée');
    }
    console.log(`\n🧭 Navigation (${data.navigation.length} liens):`);
    if (data.navigation.length > 0) {
      data.navigation.slice(0, 5).forEach(link => {
        console.log(`   - ${link.text} → ${link.href}`);
      });
      if (data.navigation.length > 5) {
        console.log(`   ... et ${data.navigation.length - 5} autres`);
      }
    } else {
      console.log('   Aucun lien de navigation détecté');
    }
    console.log(`\n🛍️ Produits détectés (${data.products.length}):`);
    if (data.products.length > 0) {
      data.products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.title} - ${product.price || 'Prix non disponible'}`);
      });
    } else {
      console.log('   Aucun produit détecté');
    }
    if (data.logo) {
      console.log(`\n🖼️ Logo: ${data.logo}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n⏱️ Temps d'exécution: ${duration}s`);
    console.log('\n✅ Test terminé avec succès!');
  } catch (error) {
    console.error('\n❌ Erreur lors du scraping:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testScraper();
