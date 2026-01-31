/**
 * Test du nombre de données scrapées (Radar Hybride - ASOS etc.)
 * Usage: npx tsx scripts/test-hybrid-scrape-count.ts [sourceId]
 * Ex: npx tsx scripts/test-hybrid-scrape-count.ts asos-femme-fr
 */

import { getAllSources } from '../lib/hybrid-radar-sources';
import { scrapeHybridSource } from '../lib/hybrid-radar-scraper';

async function main() {
  const sourceIdArg = process.argv[2];
  let sources = getAllSources();
  if (sourceIdArg) {
    sources = sources.filter((s) => s.id === sourceIdArg);
    if (sources.length === 0) {
      console.log(`Source "${sourceIdArg}" introuvable. Sources: ${getAllSources().map((s) => s.id).join(', ')}`);
      process.exit(1);
    }
  }
  if (sources.length === 0) {
    console.log('Aucune source configurée.');
    return;
  }

  console.log('--- Test scrape Radar Hybride ---\n');
  console.log(`Sources: ${sources.length} (${sources.map((s) => s.brand + ' ' + s.segment).join(', ')})\n`);

  for (const source of sources) {
    const url = `${source.baseUrl}${source.newInPath}`;
    console.log(`Scraping: ${source.brand} ${source.segment} (${source.marketZone})`);
    console.log(`URL: ${url}\n`);

    const start = Date.now();
    const items = await scrapeHybridSource(source);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    const withImage = items.filter((i) => i.imageUrl).length;
    const withPriceAndImage = items.filter((i) => i.price > 0 && i.imageUrl).length;

    console.log(`Résultat:`);
    console.log(`  Total produits:     ${items.length}`);
    console.log(`  Avec image:         ${withImage}`);
    console.log(`  Avec prix ET photo: ${withPriceAndImage}`);
    console.log(`  Sans image:         ${items.length - withImage}`);
    console.log(`  Durée:          ${elapsed}s\n`);

    if (items.length > 0) {
      console.log('Aperçu (3 premiers):');
      items.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name?.slice(0, 50) || '?'}... | ${p.price}€ | image: ${p.imageUrl ? 'oui' : 'non'}`);
      });
    }
    console.log('');
  }

  console.log('--- Fin du test ---');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
