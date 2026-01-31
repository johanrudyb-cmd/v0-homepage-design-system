/**
 * Script de seed pour créer des produits de démo dans Tendances & Hits
 * 
 * Usage: node scripts/seed-trends.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const demoProducts = [
  {
    name: 'Hoodie Oversized Streetwear',
    category: 'Haut',
    style: 'Streetwear',
    material: 'Coton 400GSM',
    averagePrice: 89.99,
    trendScore: 8.5,
    saturability: 3.2,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-0a9f77e0c7fd?w=500',
    description: 'Hoodie oversized en coton premium, coupe streetwear, logo brodé',
  },
  {
    name: 'T-shirt Coton Bio Essential',
    category: 'Haut',
    style: 'Minimaliste',
    material: 'Coton Bio 300GSM',
    averagePrice: 29.99,
    trendScore: 7.8,
    saturability: 5.1,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    description: 'T-shirt essentiel en coton bio, coupe classique, qualité premium',
  },
  {
    name: 'Cargo Pantalon Technique',
    category: 'Bas',
    style: 'Techwear',
    material: 'Polyester Technique',
    averagePrice: 129.99,
    trendScore: 9.2,
    saturability: 2.8,
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500',
    description: 'Pantalon cargo technique, poches multiples, coupe moderne',
  },
  {
    name: 'Sweatshirt Premium French Terry',
    category: 'Haut',
    style: 'Casual',
    material: 'French Terry 350GSM',
    averagePrice: 79.99,
    trendScore: 8.1,
    saturability: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500',
    description: 'Sweatshirt premium en French Terry, qualité supérieure',
  },
  {
    name: 'Short Cargo Streetwear',
    category: 'Bas',
    style: 'Streetwear',
    material: 'Coton 400GSM',
    averagePrice: 59.99,
    trendScore: 7.5,
    saturability: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500',
    description: 'Short cargo streetwear, poches latérales, coupe oversized',
  },
  {
    name: 'Veste Bomber Nylon',
    category: 'Haut',
    style: 'Streetwear',
    material: 'Nylon Technique',
    averagePrice: 149.99,
    trendScore: 8.9,
    saturability: 3.5,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    description: 'Veste bomber en nylon technique, coupe moderne',
  },
  {
    name: 'Polo Premium Piqué',
    category: 'Haut',
    style: 'Classique',
    material: 'Coton Piqué 250GSM',
    averagePrice: 49.99,
    trendScore: 6.8,
    saturability: 5.5,
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
    description: 'Polo premium en coton piqué, qualité supérieure',
  },
  {
    name: 'Jean Slim Fit Premium',
    category: 'Bas',
    style: 'Classique',
    material: 'Denim 14oz',
    averagePrice: 99.99,
    trendScore: 7.2,
    saturability: 6.1,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
    description: 'Jean slim fit premium, denim qualité supérieure',
  },
  {
    name: 'T-shirt Graphique Print',
    category: 'Haut',
    style: 'Streetwear',
    material: 'Coton 300GSM',
    averagePrice: 39.99,
    trendScore: 8.3,
    saturability: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    description: 'T-shirt avec print graphique, design unique',
  },
  {
    name: 'Hoodie Zip Premium',
    category: 'Haut',
    style: 'Streetwear',
    material: 'Coton 450GSM',
    averagePrice: 109.99,
    trendScore: 9.0,
    saturability: 3.0,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-0a9f77e0c7fd?w=500',
    description: 'Hoodie zip premium, qualité supérieure, coupe moderne',
  },
  // Ajouter plus de produits...
];

async function seedTrends() {
  try {
    console.log('🌱 Début du seed des produits tendances...');

    // Vérifier si des produits existent déjà
    const count = await prisma.trendProduct.count();
    if (count > 0) {
      console.log(`⚠️  ${count} produits existent déjà. Voulez-vous continuer ? (O/N)`);
      // Pour script automatique, on continue
    }

    // Créer les produits
    const created = await prisma.trendProduct.createMany({
      data: demoProducts,
      skipDuplicates: true,
    });

    console.log(`✅ ${created.count} produits créés avec succès !`);

    // Afficher quelques exemples
    const sample = await prisma.trendProduct.findMany({
      take: 5,
    });

    console.log('\n📦 Exemples de produits créés :');
    sample.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - ${p.style} - ${p.averagePrice}€`);
    });

    console.log('\n✅ Seed terminé !');
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seed
seedTrends();
