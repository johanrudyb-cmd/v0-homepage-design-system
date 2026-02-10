/**
 * Script de seed automatique pour la production
 * 
 * Ce script vérifie si les données sont déjà présentes avant de seed
 * pour éviter les doublons.
 * 
 * Usage:
 *   npm run seed:production
 *   ou
 *   npx tsx scripts/seed-production.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFactories() {
  console.log('🌱 Vérification des usines...');
  
  const factoryCount = await prisma.factory.count();
  
  if (factoryCount > 0) {
    console.log(`✅ ${factoryCount} usine(s) déjà présentes. Seed des usines ignoré.`);
    return;
  }

  console.log('📦 Seed des usines...');
  
  // Vérifier si des usines existent déjà avec les mêmes noms
  // Si oui, on skip. Sinon, on utilise la route API ou on crée directement
  // Pour simplifier, on utilise createMany avec skipDuplicates
  const factories = [
    {
      name: 'ASBX',
      country: 'Portugal',
      moq: 50,
      specialties: ['Knitwear', 'Streetwear', 'Luxury Jersey', 'Sustainable', 'Custom Manufacturing'],
      leadTime: 30,
      certifications: ['OEKO-TEX', 'GOTS'],
      contactEmail: 'hello@asbx.pt',
      website: 'https://asbx.pt',
      rating: 4.8,
    },
  ];
  
  // Utiliser createMany avec skipDuplicates pour éviter les doublons
  await prisma.factory.createMany({
    data: factories,
    skipDuplicates: true,
  });
  
  console.log('✅ Seed des usines terminé.');
}

async function seedTrends() {
  console.log('🌱 Vérification des produits tendances...');
  
  const trendCount = await prisma.trendProduct.count();
  
  if (trendCount > 0) {
    console.log(`✅ ${trendCount} produit(s) tendance déjà présents. Seed des tendances ignoré.`);
    return;
  }

  console.log('📦 Seed des produits tendances...');
  
  // Importer et exécuter le seed des tendances
  // Note: Le script seed-trends.js doit être adapté pour être importable
  // Pour l'instant, on appelle la route API si elle existe
  try {
    const response = await fetch('http://localhost:3000/api/trends/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${data.seeded || 0} produit(s) tendance créé(s).`);
    } else {
      console.warn('⚠️ Impossible d\'appeler la route de seed des tendances. Vérifiez que le serveur est démarré.');
    }
  } catch (error) {
    console.warn('⚠️ Impossible d\'appeler la route de seed des tendances:', error);
    console.log('💡 Exécutez manuellement: npm run seed:trends');
  }
}

async function main() {
  try {
    console.log('🚀 Démarrage du seed de production...\n');
    
    await seedFactories();
    console.log('');
    
    await seedTrends();
    console.log('');
    
    console.log('✅ Seed de production terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
