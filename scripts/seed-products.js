/**
 * Script de seed pour les produits Tendances & Hits
 * Crée des produits de démonstration
 */

require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const products = [
  {
    name: 'Hoodie Oversized Streetwear',
    category: 'Hoodie',
    style: 'Streetwear',
    material: 'Coton GSM élevé',
    averagePrice: 89.99,
    trendScore: 85,
    saturability: 25,
    description: 'Hoodie oversized en coton 400GSM, coupe streetwear, logo brodé',
    searchVolume: 12500,
  },
  {
    name: 'T-shirt Minimaliste Premium',
    category: 'T-shirt',
    style: 'Minimaliste',
    material: 'Coton GSM élevé',
    averagePrice: 39.99,
    trendScore: 72,
    saturability: 45,
    description: 'T-shirt basique premium en coton 220GSM, coupe slim',
    searchVolume: 18900,
  },
  {
    name: 'Cargo Pantalon Y2K',
    category: 'Cargo',
    style: 'Y2K',
    material: 'Synthétique',
    averagePrice: 79.99,
    trendScore: 90,
    saturability: 35,
    description: 'Pantalon cargo style Y2K avec poches multiples',
    searchVolume: 15200,
  },
  {
    name: 'Hoodie Luxe Premium',
    category: 'Hoodie',
    style: 'Luxe',
    material: 'Coton GSM élevé',
    averagePrice: 149.99,
    trendScore: 68,
    saturability: 20,
    description: 'Hoodie premium en coton 500GSM, finitions luxe',
    searchVolume: 8900,
  },
  {
    name: 'T-shirt Streetwear Graphic',
    category: 'T-shirt',
    style: 'Streetwear',
    material: 'Coton GSM élevé',
    averagePrice: 49.99,
    trendScore: 78,
    saturability: 50,
    description: 'T-shirt avec graphisme streetwear, coton 240GSM',
    searchVolume: 16800,
  },
  {
    name: 'Cargo Short Y2K',
    category: 'Cargo',
    style: 'Y2K',
    material: 'Synthétique',
    averagePrice: 59.99,
    trendScore: 82,
    saturability: 30,
    description: 'Short cargo style Y2K, coupe oversized',
    searchVolume: 11200,
  },
  {
    name: 'Hoodie Minimaliste',
    category: 'Hoodie',
    style: 'Minimaliste',
    material: 'Coton GSM élevé',
    averagePrice: 69.99,
    trendScore: 65,
    saturability: 40,
    description: 'Hoodie minimaliste sans logo, coton 350GSM',
    searchVolume: 9800,
  },
  {
    name: 'T-shirt Y2K Vintage',
    category: 'T-shirt',
    style: 'Y2K',
    material: 'Coton GSM élevé',
    averagePrice: 44.99,
    trendScore: 88,
    saturability: 28,
    description: 'T-shirt vintage style Y2K, coupe oversized',
    searchVolume: 14500,
  },
  {
    name: 'Hoodie Cargo Style',
    category: 'Hoodie',
    style: 'Streetwear',
    material: 'Coton GSM élevé',
    averagePrice: 94.99,
    trendScore: 75,
    saturability: 38,
    description: 'Hoodie avec poches cargo, style streetwear',
    searchVolume: 10200,
  },
  {
    name: 'T-shirt Oversized Premium',
    category: 'T-shirt',
    style: 'Streetwear',
    material: 'Coton GSM élevé',
    averagePrice: 54.99,
    trendScore: 80,
    saturability: 42,
    description: 'T-shirt oversized premium, coton 280GSM',
    searchVolume: 15600,
  },
  {
    name: 'Cargo Pantalon Streetwear',
    category: 'Cargo',
    style: 'Streetwear',
    material: 'Synthétique',
    averagePrice: 89.99,
    trendScore: 73,
    saturability: 48,
    description: 'Pantalon cargo streetwear avec détails techniques',
    searchVolume: 13200,
  },
  {
    name: 'Hoodie Y2K Colorful',
    category: 'Hoodie',
    style: 'Y2K',
    material: 'Coton GSM élevé',
    averagePrice: 79.99,
    trendScore: 92,
    saturability: 22,
    description: 'Hoodie Y2K avec couleurs vives, coton 380GSM',
    searchVolume: 17800,
  },
];

async function main() {
  console.log('🌱 Début du seed des produits Tendances & Hits...\n');

  try {
    // Vérifier si des produits existent déjà
    const existingCount = await prisma.trendProduct.count();
    
    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} produit(s) existent déjà dans la base de données.`);
      console.log('→ Continuation automatique (ajout des nouveaux produits)...\n');
    }

    // Créer les produits
    let created = 0;
    let skipped = 0;

    for (const productData of products) {
      try {
        // Vérifier si le produit existe déjà (par nom)
        const existing = await prisma.trendProduct.findFirst({
          where: {
            name: productData.name,
          },
        });

        if (existing) {
          console.log(`⏭️  Produit "${productData.name}" existe déjà, ignoré.`);
          skipped++;
          continue;
        }

        await prisma.trendProduct.create({
          data: productData,
        });

        console.log(`✅ Produit créé : ${productData.name} (${productData.category})`);
        created++;
      } catch (error) {
        console.error(`❌ Erreur lors de la création de "${productData.name}":`, error.message);
      }
    }

    console.log('\n📊 Résumé :');
    console.log(`   ✅ ${created} produit(s) créé(s)`);
    console.log(`   ⏭️  ${skipped} produit(s) ignoré(s) (déjà existants)`);
    console.log(`   📦 Total dans la base : ${await prisma.trendProduct.count()} produit(s)\n`);

    console.log('🎉 Seed terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('❌ Erreur fatale :', error);
    process.exit(1);
  });
