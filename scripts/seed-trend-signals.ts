/**
 * Script pour créer des données de test dans TrendSignal
 * 
 * Usage: npx tsx scripts/seed-trend-signals.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Données de test pour TrendSignal
const TEST_TREND_SIGNALS = [
  // Tendance 1 : Hoodie Oversized (confirmée - 5 marques)
  {
    productName: 'Hoodie Oversized Streetwear',
    productType: 'Hoodie',
    cut: 'Oversized',
    material: 'Coton',
    color: 'Noir',
    brand: 'Zara',
    sourceUrl: 'https://www.zara.com/fr/fr/hoodie-oversized',
    sourceSection: 'new_in',
    country: 'FR',
    style: 'Streetwear',
    price: 89.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 5,
    confirmedAt: new Date(),
  },
  {
    productName: 'Hoodie Oversized Streetwear',
    productType: 'Hoodie',
    cut: 'Oversized',
    material: 'Coton',
    color: 'Noir',
    brand: 'ASOS',
    sourceUrl: 'https://www.asos.com/hoodie-oversized',
    sourceSection: 'new_in',
    country: 'UK',
    style: 'Streetwear',
    price: 79.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 5,
    confirmedAt: new Date(),
  },
  {
    productName: 'Hoodie Oversized Streetwear',
    productType: 'Hoodie',
    cut: 'Oversized',
    material: 'Coton',
    color: 'Noir',
    brand: 'H&M',
    sourceUrl: 'https://www2.hm.com/hoodie-oversized',
    sourceSection: 'best_sellers',
    country: 'SE',
    style: 'Streetwear',
    price: 69.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 5,
    confirmedAt: new Date(),
  },
  {
    productName: 'Hoodie Oversized Streetwear',
    productType: 'Hoodie',
    cut: 'Oversized',
    material: 'Coton',
    color: 'Noir',
    brand: 'Uniqlo',
    sourceUrl: 'https://www.uniqlo.com/hoodie-oversized',
    sourceSection: 'new_in',
    country: 'JP',
    style: 'Streetwear',
    price: 59.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 5,
    confirmedAt: new Date(),
  },
  {
    productName: 'Hoodie Oversized Streetwear',
    productType: 'Hoodie',
    cut: 'Oversized',
    material: 'Coton',
    color: 'Noir',
    brand: 'Zalando',
    sourceUrl: 'https://www.zalando.fr/hoodie-oversized',
    sourceSection: 'best_sellers',
    country: 'DE',
    style: 'Streetwear',
    price: 84.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 5,
    confirmedAt: new Date(),
  },

  // Tendance 2 : Cargo Loose Fit (confirmée - 4 marques)
  {
    productName: 'Cargo Pantalon Loose Fit',
    productType: 'Cargo',
    cut: 'Loose Fit',
    material: 'Coton',
    color: 'Beige',
    brand: 'Zara',
    sourceUrl: 'https://www.zara.com/fr/fr/cargo-loose-fit',
    sourceSection: 'new_in',
    country: 'FR',
    style: 'Streetwear',
    price: 89.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 4,
    confirmedAt: new Date(),
  },
  {
    productName: 'Cargo Pantalon Loose Fit',
    productType: 'Cargo',
    cut: 'Loose Fit',
    material: 'Coton',
    color: 'Beige',
    brand: 'ASOS',
    sourceUrl: 'https://www.asos.com/cargo-loose-fit',
    sourceSection: 'new_in',
    country: 'UK',
    style: 'Streetwear',
    price: 79.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 4,
    confirmedAt: new Date(),
  },
  {
    productName: 'Cargo Pantalon Loose Fit',
    productType: 'Cargo',
    cut: 'Loose Fit',
    material: 'Coton',
    color: 'Beige',
    brand: 'H&M',
    sourceUrl: 'https://www2.hm.com/cargo-loose-fit',
    sourceSection: 'best_sellers',
    country: 'SE',
    style: 'Streetwear',
    price: 69.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 4,
    confirmedAt: new Date(),
  },
  {
    productName: 'Cargo Pantalon Loose Fit',
    productType: 'Cargo',
    cut: 'Loose Fit',
    material: 'Coton',
    color: 'Beige',
    brand: 'Uniqlo',
    sourceUrl: 'https://www.uniqlo.com/cargo-loose-fit',
    sourceSection: 'new_in',
    country: 'JP',
    style: 'Streetwear',
    price: 59.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 4,
    confirmedAt: new Date(),
  },

  // Tendance 3 : T-shirt Oversized (confirmée - 3 marques)
  {
    productName: 'T-shirt Oversized Minimaliste',
    productType: 'T-shirt',
    cut: 'Oversized',
    material: 'Coton',
    color: 'Blanc',
    brand: 'Zara',
    sourceUrl: 'https://www.zara.com/fr/fr/tshirt-oversized',
    sourceSection: 'new_in',
    country: 'FR',
    style: 'Minimaliste',
    price: 29.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 3,
    confirmedAt: new Date(),
  },
  {
    productName: 'T-shirt Oversized Minimaliste',
    productType: 'T-shirt',
    cut: 'Oversized',
    material: 'Coton',
    color: 'Blanc',
    brand: 'ASOS',
    sourceUrl: 'https://www.asos.com/tshirt-oversized',
    sourceSection: 'new_in',
    country: 'UK',
    style: 'Minimaliste',
    price: 24.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 3,
    confirmedAt: new Date(),
  },
  {
    productName: 'T-shirt Oversized Minimaliste',
    productType: 'T-shirt',
    cut: 'Oversized',
    material: 'Coton',
    color: 'Blanc',
    brand: 'H&M',
    sourceUrl: 'https://www2.hm.com/tshirt-oversized',
    sourceSection: 'best_sellers',
    country: 'SE',
    style: 'Minimaliste',
    price: 19.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 3,
    confirmedAt: new Date(),
  },

  // Tendance 4 : Jeans Wide Leg (confirmée - 3 marques)
  {
    productName: 'Jeans Wide Leg Denim',
    productType: 'Jeans',
    cut: 'Wide Leg',
    material: 'Denim',
    color: 'Bleu',
    brand: 'Levi\'s',
    sourceUrl: 'https://www.levi.com/jeans-wide-leg',
    sourceSection: 'new_in',
    country: 'US',
    style: 'Casual',
    price: 99.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 3,
    confirmedAt: new Date(),
  },
  {
    productName: 'Jeans Wide Leg Denim',
    productType: 'Jeans',
    cut: 'Wide Leg',
    material: 'Denim',
    color: 'Bleu',
    brand: 'Zara',
    sourceUrl: 'https://www.zara.com/fr/fr/jeans-wide-leg',
    sourceSection: 'new_in',
    country: 'FR',
    style: 'Casual',
    price: 79.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 3,
    confirmedAt: new Date(),
  },
  {
    productName: 'Jeans Wide Leg Denim',
    productType: 'Jeans',
    cut: 'Wide Leg',
    material: 'Denim',
    color: 'Bleu',
    brand: 'ASOS',
    sourceUrl: 'https://www.asos.com/jeans-wide-leg',
    sourceSection: 'best_sellers',
    country: 'UK',
    style: 'Casual',
    price: 89.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 3,
    confirmedAt: new Date(),
  },

  // Tendance 5 : Veste Bomber (confirmée - 3 marques)
  {
    productName: 'Veste Bomber Technique',
    productType: 'Veste',
    cut: 'Regular Fit',
    material: 'Nylon',
    color: 'Noir',
    brand: 'Nike',
    sourceUrl: 'https://www.nike.com/bomber',
    sourceSection: 'new_in',
    country: 'US',
    style: 'Sportswear',
    price: 129.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 3,
    confirmedAt: new Date(),
  },
  {
    productName: 'Veste Bomber Technique',
    productType: 'Veste',
    cut: 'Regular Fit',
    material: 'Nylon',
    color: 'Noir',
    brand: 'Adidas',
    sourceUrl: 'https://www.adidas.fr/bomber',
    sourceSection: 'new_in',
    country: 'DE',
    style: 'Sportswear',
    price: 119.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 3,
    confirmedAt: new Date(),
  },
  {
    productName: 'Veste Bomber Technique',
    productType: 'Veste',
    cut: 'Regular Fit',
    material: 'Nylon',
    color: 'Noir',
    brand: 'Puma',
    sourceUrl: 'https://www.puma.com/bomber',
    sourceSection: 'best_sellers',
    country: 'DE',
    style: 'Sportswear',
    price: 109.99,
    priceCurrency: 'EUR',
    imageUrl: null,
    appearanceCount: 1,
    isConfirmed: true,
    confirmationScore: 3,
    confirmedAt: new Date(),
  },
];

async function main() {
  console.log('🌱 Création de données de test pour TrendSignal...\n');

  let created = 0;
  let skipped = 0;

  for (const signal of TEST_TREND_SIGNALS) {
    try {
      // Vérifier si existe déjà
      const existing = await prisma.trendSignal.findFirst({
        where: {
          productName: signal.productName,
          brand: signal.brand,
          sourceUrl: signal.sourceUrl,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.trendSignal.create({
        data: signal,
      });
      created++;
    } catch (error: any) {
      console.error(`❌ Erreur pour ${signal.productName} - ${signal.brand}:`, error.message);
    }
  }

  console.log(`\n📊 Résultats :`);
  console.log(`   ➕ Créés : ${created}`);
  console.log(`   ⏭️  Ignorés (déjà existants) : ${skipped}`);
  console.log(`   📦 Total : ${created + skipped} signaux\n`);

  // Vérifier les tendances confirmées
  const confirmedCount = await prisma.trendSignal.count({
    where: { isConfirmed: true },
  });

  console.log(`✅ ${confirmedCount} tendances confirmées dans la base`);
  console.log('   → Allez sur /trends pour les voir\n');
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
