/**
 * Script de seed pour les usines du Sourcing Hub
 * 
 * ⚠️ IMPORTANT : Ce script crée des données de DÉMONSTRATION uniquement
 * Les usines, contacts et informations sont FICTIFS et servent uniquement
 * à tester les fonctionnalités du Sourcing Hub.
 * 
 * Pour la production, vous devrez :
 * - Remplacer par de vraies usines vérifiées
 * - Ou créer un système d'inscription pour les usines
 * - Obtenir les autorisations nécessaires
 */

require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const factories = [
  // PORTUGAL - Qualité européenne, proximité
  {
    name: 'Textile Portugal Premium',
    country: 'Portugal',
    moq: 100,
    specialties: ['Jersey', 'Coton GSM élevé', 'Tricot'],
    leadTime: 30,
    certifications: ['OEKO-TEX', 'GOTS'],
    contactEmail: 'contact@textileportugal.pt',
    contactPhone: '+351 21 123 4567',
    rating: 4.8,
  },
  {
    name: 'Moda Lisboa Manufacturing',
    country: 'Portugal',
    moq: 50,
    specialties: ['Streetwear', 'Hoodie', 'Sweatshirt'],
    leadTime: 25,
    certifications: ['OEKO-TEX'],
    contactEmail: 'info@modalisboa.pt',
    contactPhone: '+351 21 234 5678',
    rating: 4.6,
  },
  {
    name: 'Porto Textile Works',
    country: 'Portugal',
    moq: 200,
    specialties: ['Denim', 'Coton GSM élevé', 'T-shirt'],
    leadTime: 35,
    certifications: ['GOTS', 'OEKO-TEX'],
    contactEmail: 'hello@portotextile.pt',
    contactPhone: '+351 22 345 6789',
    rating: 4.7,
  },
  {
    name: 'Lisbon Fashion Hub',
    country: 'Portugal',
    moq: 75,
    specialties: ['Minimaliste', 'Premium', 'Luxe'],
    leadTime: 28,
    certifications: ['OEKO-TEX'],
    contactEmail: 'contact@lisbonfashion.pt',
    contactPhone: '+351 21 456 7890',
    rating: 4.5,
  },
  {
    name: 'Algarve Textile Co.',
    country: 'Portugal',
    moq: 150,
    specialties: ['Jersey', 'Synthétique', 'Sportswear'],
    leadTime: 32,
    certifications: ['OEKO-TEX'],
    contactEmail: 'info@algarvetextile.pt',
    contactPhone: '+351 28 567 8901',
    rating: 4.4,
  },

  // TURQUIE - Bon rapport qualité/prix
  {
    name: 'Istanbul Fashion Manufacturing',
    country: 'Turquie',
    moq: 200,
    specialties: ['Streetwear', 'Y2K', 'Hoodie'],
    leadTime: 40,
    certifications: ['OEKO-TEX'],
    contactEmail: 'contact@istanbulfashion.tr',
    contactPhone: '+90 212 123 4567',
    rating: 4.6,
  },
  {
    name: 'Bursa Textile Experts',
    country: 'Turquie',
    moq: 300,
    specialties: ['Coton GSM élevé', 'Jersey', 'T-shirt'],
    leadTime: 35,
    certifications: ['OEKO-TEX', 'GOTS'],
    contactEmail: 'info@bursatextile.tr',
    contactPhone: '+90 224 234 5678',
    rating: 4.7,
  },
  {
    name: 'Ankara Premium Garments',
    country: 'Turquie',
    moq: 150,
    specialties: ['Luxe', 'Premium', 'Minimaliste'],
    leadTime: 45,
    certifications: ['OEKO-TEX'],
    contactEmail: 'hello@ankarapremium.tr',
    contactPhone: '+90 312 345 6789',
    rating: 4.5,
  },
  {
    name: 'Izmir Streetwear Factory',
    country: 'Turquie',
    moq: 250,
    specialties: ['Streetwear', 'Y2K', 'Cargo'],
    leadTime: 38,
    certifications: ['OEKO-TEX'],
    contactEmail: 'contact@izmirstreetwear.tr',
    contactPhone: '+90 232 456 7890',
    rating: 4.4,
  },
  {
    name: 'Antalya Textile Solutions',
    country: 'Turquie',
    moq: 100,
    specialties: ['Synthétique', 'Sportswear', 'Activewear'],
    leadTime: 42,
    certifications: ['OEKO-TEX'],
    contactEmail: 'info@antalyatextile.tr',
    contactPhone: '+90 242 567 8901',
    rating: 4.3,
  },
  {
    name: 'Gaziantep Denim Works',
    country: 'Turquie',
    moq: 500,
    specialties: ['Denim', 'Jeans', 'Cargo'],
    leadTime: 50,
    certifications: ['OEKO-TEX'],
    contactEmail: 'contact@gaziantepdenim.tr',
    contactPhone: '+90 342 678 9012',
    rating: 4.6,
  },

  // CHINE - Volume, prix compétitifs
  {
    name: 'Guangzhou Fashion Hub',
    country: 'Chine',
    moq: 500,
    specialties: ['Streetwear', 'Y2K', 'Hoodie'],
    leadTime: 45,
    certifications: ['OEKO-TEX'],
    contactEmail: 'contact@guangzhoufashion.cn',
    contactPhone: '+86 20 1234 5678',
    rating: 4.5,
  },
  {
    name: 'Shanghai Premium Textiles',
    country: 'Chine',
    moq: 300,
    specialties: ['Premium', 'Luxe', 'Minimaliste'],
    leadTime: 40,
    certifications: ['OEKO-TEX', 'GOTS'],
    contactEmail: 'info@shanghaipremium.cn',
    contactPhone: '+86 21 2345 6789',
    rating: 4.7,
  },
  {
    name: 'Shenzhen Streetwear Co.',
    country: 'Chine',
    moq: 1000,
    specialties: ['Streetwear', 'Y2K', 'T-shirt'],
    leadTime: 35,
    certifications: ['OEKO-TEX'],
    contactEmail: 'hello@shenzhenstreetwear.cn',
    contactPhone: '+86 755 3456 7890',
    rating: 4.4,
  },
  {
    name: 'Hangzhou Cotton Experts',
    country: 'Chine',
    moq: 800,
    specialties: ['Coton GSM élevé', 'Jersey', 'T-shirt'],
    leadTime: 38,
    certifications: ['OEKO-TEX', 'GOTS'],
    contactEmail: 'contact@hangzhoucotton.cn',
    contactPhone: '+86 571 4567 8901',
    rating: 4.6,
  },
  {
    name: 'Dongguan Denim Factory',
    country: 'Chine',
    moq: 600,
    specialties: ['Denim', 'Cargo', 'Jeans'],
    leadTime: 42,
    certifications: ['OEKO-TEX'],
    contactEmail: 'info@dongguandenim.cn',
    contactPhone: '+86 769 5678 9012',
    rating: 4.3,
  },
  {
    name: 'Ningbo Textile Solutions',
    country: 'Chine',
    moq: 400,
    specialties: ['Synthétique', 'Sportswear', 'Activewear'],
    leadTime: 40,
    certifications: ['OEKO-TEX'],
    contactEmail: 'contact@ningbotextile.cn',
    contactPhone: '+86 574 6789 0123',
    rating: 4.5,
  },

  // AUTRES PAYS EUROPÉENS
  {
    name: 'Barcelona Fashion Manufacturing',
    country: 'Espagne',
    moq: 100,
    specialties: ['Streetwear', 'Y2K', 'Hoodie'],
    leadTime: 30,
    certifications: ['OEKO-TEX'],
    contactEmail: 'contact@barcelonafashion.es',
    contactPhone: '+34 93 123 4567',
    rating: 4.6,
  },
  {
    name: 'Milan Premium Textiles',
    country: 'Italie',
    moq: 50,
    specialties: ['Luxe', 'Premium', 'Minimaliste'],
    leadTime: 35,
    certifications: ['OEKO-TEX', 'GOTS'],
    contactEmail: 'info@milanpremium.it',
    contactPhone: '+39 02 234 5678',
    rating: 4.8,
  },
  {
    name: 'Berlin Streetwear Hub',
    country: 'Allemagne',
    moq: 150,
    specialties: ['Streetwear', 'Y2K', 'Cargo'],
    leadTime: 28,
    certifications: ['OEKO-TEX'],
    contactEmail: 'hello@berlinstreetwear.de',
    contactPhone: '+49 30 345 6789',
    rating: 4.5,
  },
  {
    name: 'Warsaw Textile Works',
    country: 'Pologne',
    moq: 200,
    specialties: ['Coton GSM élevé', 'Jersey', 'T-shirt'],
    leadTime: 32,
    certifications: ['OEKO-TEX'],
    contactEmail: 'contact@warsawtextile.pl',
    contactPhone: '+48 22 456 7890',
    rating: 4.4,
  },
  {
    name: 'Bucharest Fashion Factory',
    country: 'Roumanie',
    moq: 250,
    specialties: ['Streetwear', 'Hoodie', 'Sweatshirt'],
    leadTime: 38,
    certifications: ['OEKO-TEX'],
    contactEmail: 'info@bucharestfashion.ro',
    contactPhone: '+40 21 567 8901',
    rating: 4.3,
  },
];

async function main() {
  console.log('🌱 Début du seed des usines (DONNÉES DE DÉMONSTRATION)...\n');
  console.log('⚠️  ATTENTION : Les données créées sont FICTIVES et servent uniquement à tester.\n');

  try {
    // Vérifier si des usines existent déjà
    const existingCount = await prisma.factory.count();
    
    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} usine(s) existent déjà dans la base de données.`);
      console.log('→ Continuation automatique (ajout des nouvelles usines)...\n');
    }

    // Créer les usines
    let created = 0;
    let skipped = 0;

    for (const factoryData of factories) {
      try {
        // Vérifier si l'usine existe déjà (par nom et pays)
        const existing = await prisma.factory.findFirst({
          where: {
            name: factoryData.name,
            country: factoryData.country,
          },
        });

        if (existing) {
          console.log(`⏭️  Usine "${factoryData.name}" existe déjà, ignorée.`);
          skipped++;
          continue;
        }

        await prisma.factory.create({
          data: factoryData,
        });

        console.log(`✅ Usine créée : ${factoryData.name} (${factoryData.country})`);
        created++;
      } catch (error) {
        console.error(`❌ Erreur lors de la création de "${factoryData.name}":`, error.message);
      }
    }

    console.log('\n📊 Résumé :');
    console.log(`   ✅ ${created} usine(s) créée(s)`);
    console.log(`   ⏭️  ${skipped} usine(s) ignorée(s) (déjà existantes)`);
    console.log(`   📦 Total dans la base : ${await prisma.factory.count()} usine(s)\n`);

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
