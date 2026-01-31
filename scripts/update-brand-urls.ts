/**
 * Met à jour les URLs New In et Best Sellers des marques scrapables
 *
 * Usage: npx tsx scripts/update-brand-urls.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseUrl(fullUrl: string): { baseUrl: string; path: string } {
  const u = new URL(fullUrl);
  return {
    baseUrl: u.origin,
    path: u.pathname + u.search,
  };
}

const BRAND_URLS: Record<
  string,
  { new_in: string; best_sellers: string }
> = {
  Zara: {
    new_in: 'https://www.zara.com/fr/fr/homme-nouveau-l711.html',
    best_sellers: 'https://www.zara.com/fr/fr/homme-meilleures-ventes-l888.html',
  },
  ASOS: {
    new_in: 'https://www.asos.com/fr/homme/nouveautes/cat/?cid=27110',
    best_sellers: 'https://www.asos.com/fr/homme/meilleures-ventes/cat/?cid=13506',
  },
  Zalando: {
    new_in: 'https://www.zalando.fr/mode-homme-nouveautes/',
    best_sellers: 'https://www.zalando.fr/mode-homme/?sort=popularity',
  },
  'H&M': {
    new_in: 'https://www2.hm.com/fr_fr/homme/nouveautes/view-all.html',
    best_sellers: 'https://www2.hm.com/fr_fr/homme/en-ce-moment/best-sellers.html',
  },
  Nike: {
    new_in: 'https://www.nike.com/fr/w/hommes-nouveautes-3n82y',
    best_sellers: 'https://www.nike.com/fr/w/hommes-meilleures-ventes-3cii8z76m50zed1qznik1',
  },
  'Pull&Bear': {
    new_in: 'https://www.pullandbear.com/fr/homme-n6228',
    best_sellers: 'https://www.pullandbear.com/fr/homme/vetements/best-sellers-n6312',
  },
  Adidas: {
    new_in: 'https://www.adidas.fr/hommes-nouveautes',
    best_sellers: 'https://www.adidas.fr/hommes-meilleures_ventes',
  },
};

async function main() {
  console.log('🔄 Mise à jour des URLs New In / Best Sellers...\n');

  let updated = 0;
  let notFound = 0;

  for (const [brandName, urls] of Object.entries(BRAND_URLS)) {
    try {
      const brand = await prisma.scrapableBrand.findUnique({
        where: { name: brandName },
      });

      if (!brand) {
        console.log(`⚠️  ${brandName} : non trouvée en base`);
        notFound++;
        continue;
      }

      const parsedNewIn = parseUrl(urls.new_in);
      const parsedBestSellers = parseUrl(urls.best_sellers);

      await prisma.scrapableBrand.update({
        where: { name: brandName },
        data: {
          baseUrl: parsedNewIn.baseUrl,
          newInUrl: parsedNewIn.path,
          bestSellersUrl: parsedBestSellers.path,
        },
      });

      console.log(`✅ ${brandName}`);
      console.log(`   New In:       ${parsedNewIn.baseUrl}${parsedNewIn.path}`);
      console.log(`   Best Sellers: ${parsedBestSellers.baseUrl}${parsedBestSellers.path}`);
      updated++;
    } catch (e: unknown) {
      console.error(`❌ ${brandName}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.log('\n📊 Résumé :');
  console.log(`   Mis à jour : ${updated} marques`);
  if (notFound > 0) console.log(`   Non trouvées : ${notFound} marques`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
