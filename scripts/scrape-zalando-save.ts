/**
 * Scrape Zalando (Trend Spotter) depuis le terminal et enregistre en base.
 * Permet de lancer le scrape sans bloquer l'app : une fois terminé, ouvrez /trends
 * et rafraîchissez pour voir les résultats dans « Tendances par marché ».
 *
 * Usage:
 *   npx tsx scripts/scrape-zalando-save.ts              # toutes les sources Zalando
 *   npx tsx scripts/scrape-zalando-save.ts --quick      # 1 source (Milan femme, ~1 min)
 *   npx tsx scripts/scrape-zalando-save.ts <sourceId>   # une source donnée
 *
 * Ex: npx tsx scripts/scrape-zalando-save.ts zalando-trend-homme-paris
 */

import 'dotenv/config';
import { getAllSources } from '../lib/hybrid-radar-sources';
import { scrapeHybridSource } from '../lib/hybrid-radar-scraper';
import { inferCategory } from '../lib/infer-trend-category';
import { prisma } from '../lib/prisma';

const QUICK_SOURCE_ID = 'zalando-trend-homme-paris';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const quick = args.includes('--quick');
  const sourceIdArg = args.find((a) => !a.startsWith('--'));

  const allSources = getAllSources();
  let sources = allSources.filter((s) => s.brand === 'Zalando');

  if (sources.length === 0) {
    console.error('Aucune source Zalando configurée.');
    process.exit(1);
  }

  if (quick) {
    const one = sources.find((s) => s.id === QUICK_SOURCE_ID) ?? sources[0];
    sources = [one];
    console.log(`Mode rapide: 1 source — Paris Homme (${one.id})\n`);
  } else if (sourceIdArg) {
    const found = sources.find((s) => s.id === sourceIdArg);
    if (!found) {
      console.error(`Source "${sourceIdArg}" introuvable. Exemples: ${sources.slice(0, 3).map((s) => s.id).join(', ')}`);
      process.exit(1);
    }
    sources = [found];
  }

  console.log(`Scrape Zalando → ${sources.length} source(s). Les résultats seront enregistrés en base.`);
  console.log('Rafraîchissez la page /trends après le script pour voir « Tendances par marché ».\n');

  const start = Date.now();
  let totalItems = 0;
  const results: Array<{ sourceId: string; brand: string; marketZone: string; itemCount: number; items: Array<{
    name: string;
    price: number;
    imageUrl: string | null;
    sourceUrl: string;
    trendGrowthPercent?: number | null;
    trendLabel?: string | null;
    composition?: string | null;
    careInstructions?: string | null;
    color?: string | null;
    sizes?: string | null;
    countryOfOrigin?: string | null;
    articleNumber?: string | null;
  }> }> = [];

  for (const source of sources) {
    process.stdout.write(`  ${source.id}... `);
    const items = await scrapeHybridSource(source);
    const withPrice = items.filter((i) => (typeof i.price === 'number' ? i.price : parseFloat(String(i.price)) || 0) > 0).length;
    console.log(`${items.length} produits (${withPrice} avec prix)`);
    totalItems += items.length;
    results.push({
      sourceId: source.id,
      brand: source.brand,
      marketZone: source.marketZone,
      itemCount: items.length,
      items: items.map((i) => ({
        name: i.name,
        price: typeof i.price === 'number' ? i.price : parseFloat(String(i.price)) || 0,
        imageUrl: i.imageUrl,
        sourceUrl: i.sourceUrl,
        trendGrowthPercent: i.trendGrowthPercent ?? null,
        trendLabel: i.trendLabel ?? null,
        composition: i.composition ?? null,
        careInstructions: i.careInstructions ?? null,
        color: i.color ?? null,
        sizes: i.sizes ?? null,
        countryOfOrigin: i.countryOfOrigin ?? null,
        articleNumber: i.articleNumber ?? null,
      })),
    });
  }

  let savedCount = 0;
  for (const source of results) {
    const fullSource = sources.find((s) => s.id === source.sourceId);
    const segment = fullSource?.segment ?? null;
    for (const item of source.items) {
      if (!item.name || !item.sourceUrl) continue;
      const category = inferCategory(item.name);
      const material = item.composition || 'Non spécifié';
      const descParts: string[] = [];
      if (item.composition) descParts.push(`Composition: ${item.composition}`);
      if (item.careInstructions) descParts.push(`Entretien: ${item.careInstructions}`);
      if (item.color) descParts.push(`Couleur: ${item.color}`);
      if (item.sizes) descParts.push(`Tailles: ${item.sizes}`);
      if (item.countryOfOrigin) descParts.push(`Origine: ${item.countryOfOrigin}`);
      if (item.articleNumber) descParts.push(`Ref: ${item.articleNumber}`);
      const description = descParts.length > 0 ? descParts.join('\n') : null;
      const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
      const trendGrowthPercent = item.trendGrowthPercent ?? null;
      const trendLabel = item.trendLabel ?? null;
      const existing = await prisma.trendProduct.findFirst({
        where: {
          sourceUrl: item.sourceUrl,
          marketZone: source.marketZone,
          sourceBrand: source.brand,
        },
      });
      if (existing) {
        await prisma.trendProduct.update({
          where: { id: existing.id },
          data: {
            name: item.name.slice(0, 500),
            category,
            material,
            averagePrice: price,
            imageUrl: item.imageUrl,
            description,
            segment,
            trendGrowthPercent,
            trendLabel,
          },
        });
      } else {
        await prisma.trendProduct.create({
          data: {
            name: item.name.slice(0, 500),
            category,
            style: '',
            material,
            averagePrice: price,
            trendScore: 50,
            saturability: 50,
            imageUrl: item.imageUrl,
            description,
            marketZone: source.marketZone,
            sourceBrand: source.brand,
            sourceUrl: item.sourceUrl,
            segment,
            trendGrowthPercent,
            trendLabel,
            trendScoreVisual: 50,
          },
        });
      }
      savedCount++;
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log('');
  console.log(`Terminé en ${elapsed}s. ${totalItems} produits scrapés, ${savedCount} enregistrés en base.`);
  console.log('→ Ouvrez /trends et rafraîchissez pour voir les tendances par marché.');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
