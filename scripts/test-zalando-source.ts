/**
 * Test qu'au moins une source Zalando renvoie des produits.
 * Usage: npx tsx scripts/test-zalando-source.ts [sourceId]
 * Ex: npx tsx scripts/test-zalando-source.ts
 *     npx tsx scripts/test-zalando-source.ts zalando-trend-homme-paris
 *
 * Exit 0 si au moins 1 produit ; exit 1 sinon.
 */

import { getAllSources } from '../lib/hybrid-radar-sources';
import { scrapeHybridSource } from '../lib/hybrid-radar-scraper';

const DEFAULT_ZALANDO_SOURCE_ID = 'zalando-trend-homme-paris';

async function main(): Promise<void> {
  const sourceIdArg = process.argv[2];
  const allSources = getAllSources();
  const zalandoSources = allSources.filter((s) => s.brand === 'Zalando');

  if (zalandoSources.length === 0) {
    console.error('Aucune source Zalando configurée dans hybrid-radar-sources.');
    process.exit(1);
  }

  let source = zalandoSources[0];
  if (sourceIdArg) {
    const found = zalandoSources.find((s) => s.id === sourceIdArg);
    if (!found) {
      console.error(
        `Source Zalando "${sourceIdArg}" introuvable. Exemples: ${zalandoSources.slice(0, 3).map((s) => s.id).join(', ')}...`
      );
      process.exit(1);
    }
    source = found;
  } else {
    source = zalandoSources.find((s) => s.id === DEFAULT_ZALANDO_SOURCE_ID) ?? zalandoSources[0];
  }

  const url = `${source.baseUrl}${source.newInPath}`;
  console.log('--- Test source Zalando ---');
  console.log(`Source: ${source.id} (${source.segment}, ${source.marketZone})`);
  console.log(`URL: ${url}`);
  console.log('Scraping...\n');

  const start = Date.now();
  const items = await scrapeHybridSource(source);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  const withImage = items.filter((i) => i.imageUrl).length;
  const withPrice = items.filter((i) => (typeof i.price === 'number' ? i.price : 0) > 0).length;

  console.log(`Résultat: ${items.length} produit(s) (${elapsed}s)`);
  console.log(`  Avec image: ${withImage}`);
  console.log(`  Avec prix:  ${withPrice}`);

  if (items.length >= 1) {
    console.log('\nOK: au moins une source Zalando renvoie des produits.');
    console.log('Aperçu (3 premiers):');
    items.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. ${(p.name || '—').slice(0, 55)}... | ${p.price} € | image: ${p.imageUrl ? 'oui' : 'non'}`);
    });
    process.exit(0);
  }

  console.error('\nÉCHEC: la source Zalando n\'a renvoyé aucun produit.');
  console.error('Vérifier: URLs (Trend Spotter), sélecteurs, exclusions, chargement de la page (lazy-load).');
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
