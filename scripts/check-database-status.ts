/**
 * Script pour vérifier l'état de la base de données
 * 
 * Usage: npx tsx scripts/check-database-status.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification de l\'état de la base de données...\n');

  // 1. Vérifier les marques scrapables
  const brands = await prisma.scrapableBrand.findMany();
  const activeBrands = await prisma.scrapableBrand.count({
    where: { isActive: true },
  });
  
  console.log('📦 MARQUES SCRAPABLES');
  console.log('─'.repeat(50));
  console.log(`   Total : ${brands.length} marques`);
  console.log(`   Actives : ${activeBrands} marques`);
  console.log(`   Inactives : ${brands.length - activeBrands} marques`);
  
  if (brands.length > 0) {
    const byCategory = await prisma.scrapableBrand.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: true,
    });
    console.log('\n   Par catégorie :');
    byCategory.forEach(cat => {
      console.log(`   • ${cat.category || 'Non catégorisé'} : ${cat._count} marques`);
    });
  }
  console.log('');

  // 2. Vérifier les signaux de tendance
  const signals = await prisma.trendSignal.findMany();
  const confirmedSignals = await prisma.trendSignal.count({
    where: { isConfirmed: true },
  });
  const unconfirmedSignals = await prisma.trendSignal.count({
    where: { isConfirmed: false },
  });
  
  console.log('📊 SIGNAUX DE TENDANCE (TrendSignal)');
  console.log('─'.repeat(50));
  console.log(`   Total : ${signals.length} signaux`);
  console.log(`   Confirmés : ${confirmedSignals} signaux`);
  console.log(`   Non confirmés : ${unconfirmedSignals} signaux`);
  
  if (signals.length > 0) {
    const byBrand = await prisma.trendSignal.groupBy({
      by: ['brand'],
      _count: true,
      orderBy: { _count: { brand: 'desc' } },
      take: 10,
    });
    console.log('\n   Top 10 marques :');
    byBrand.forEach(b => {
      console.log(`   • ${b.brand} : ${b._count} signaux`);
    });

    const byCountry = await prisma.trendSignal.groupBy({
      by: ['country'],
      _count: true,
      orderBy: { _count: { country: 'desc' } },
      take: 5,
    });
    console.log('\n   Par pays :');
    byCountry.forEach(c => {
      console.log(`   • ${c.country || 'Non spécifié'} : ${c._count} signaux`);
    });

    const byStyle = await prisma.trendSignal.groupBy({
      by: ['style'],
      _count: true,
      orderBy: { _count: { style: 'desc' } },
      take: 5,
    });
    console.log('\n   Par style :');
    byStyle.forEach(s => {
      console.log(`   • ${s.style || 'Non spécifié'} : ${s._count} signaux`);
    });

    // Derniers signaux
    const recentSignals = await prisma.trendSignal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        productName: true,
        productType: true,
        brand: true,
        isConfirmed: true,
        createdAt: true,
      },
    });
    console.log('\n   Derniers signaux :');
    recentSignals.forEach(s => {
      const status = s.isConfirmed ? '✅ Confirmé' : '⏳ En attente';
      console.log(`   • ${s.productName} (${s.productType}) - ${s.brand} - ${status}`);
    });
  }
  console.log('');

  // 3. Vérifier les autres tables importantes
  console.log('🗄️  AUTRES TABLES');
  console.log('─'.repeat(50));
  
  const users = await prisma.user.count();
  console.log(`   Users : ${users} utilisateurs`);
  
  const brands_user = await prisma.brand.count();
  console.log(`   Brands (utilisateurs) : ${brands_user} marques`);
  
  const designs = await prisma.design.count();
  console.log(`   Designs : ${designs} designs`);
  
  const factories = await prisma.factory.count();
  console.log(`   Factories : ${factories} usines`);
  
  const quotes = await prisma.quote.count();
  console.log(`   Quotes : ${quotes} devis`);
  
  const trendProducts = await prisma.trendProduct.count();
  console.log(`   TrendProduct : ${trendProducts} produits tendance`);
  
  console.log('');

  // 4. Résumé et recommandations
  console.log('💡 RÉSUMÉ ET RECOMMANDATIONS');
  console.log('─'.repeat(50));
  
  if (activeBrands === 0) {
    console.log('   ⚠️  Aucune marque active !');
    console.log('   → Exécutez : npm run add:strategic-brands');
  } else if (activeBrands < 40) {
    console.log(`   ⚠️  Seulement ${activeBrands} marques actives (attendu : 49)`);
    console.log('   → Exécutez : npm run add:strategic-brands');
  } else {
    console.log(`   ✅ ${activeBrands} marques actives configurées`);
  }
  
  if (signals.length === 0) {
    console.log('   ⚠️  Aucun signal de tendance dans la base !');
    console.log('   → Lancez un scan : POST /api/trends/scan-big-brands');
    console.log('   → Ou via l\'interface : /trends → "Lancer le scan"');
  } else if (confirmedSignals === 0) {
    console.log(`   ⚠️  ${signals.length} signaux mais aucun confirmé !`);
    console.log('   → Les tendances nécessitent 3+ marques avec le même produit');
    console.log('   → Relancez un scan pour avoir plus de données');
  } else {
    console.log(`   ✅ ${confirmedSignals} tendances confirmées disponibles`);
  }
  
  if (factories === 0) {
    console.log('   ⚠️  Aucune usine dans la base !');
    console.log('   → Exécutez : npm run db:seed-factories');
  } else {
    console.log(`   ✅ ${factories} usines disponibles`);
  }
  
  console.log('');
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
