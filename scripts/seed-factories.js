/**
 * Script de seed pour les usines du Sourcing Hub
 *
 * Remplace les anciens fournisseurs test par la liste des fournisseurs réels.
 */

require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

// Limiter à 1 connexion pour éviter MaxClientsInSessionMode (Supabase)
const url = process.env.DATABASE_URL || '';
const dbUrl = url.includes('?') ? `${url}&connection_limit=1` : `${url}?connection_limit=1`;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const factories = [
  {
    name: 'ASBX',
    country: 'Portugal',
    moq: 50,
    specialties: ['Knitwear', 'Streetwear', 'Luxury Jersey', 'Sustainable', 'Custom Manufacturing'],
    leadTime: 30,
    certifications: ['OEKO-TEX', 'GOTS'],
    contactEmail: 'hello@asbx.pt',
    contactPhone: null,
    website: 'https://asbx.pt',
    rating: 4.8,
  },
  {
    name: 'Tetriberica',
    country: 'Portugal',
    moq: 100,
    specialties: ['Luxury Knits', 'Eco-fashion', 'Knitting textiles', 'Dyeing', 'Printing', 'Embroidery'],
    leadTime: 84,
    certifications: ['OEKO-TEX', 'GOTS'],
    contactEmail: 'info@tetriberica.pt',
    contactPhone: null,
    website: 'https://tetriberica.pt',
    rating: 4.7,
  },
  {
    name: 'Create Fashion Brand',
    country: 'Portugal',
    moq: 50,
    specialties: ['Premium Streetwear', 'Heavyweight Cotton', 'Jackets', 'Denim', 'Chinos', 'Sports wear', 'Organic Cotton'],
    leadTime: 70,
    certifications: ['OEKO-TEX', 'GOTS', 'OCS', 'Global Recycled Standard'],
    contactEmail: 'hello@createfashionbrand.com',
    contactPhone: null,
    website: 'https://createfashionbrand.com',
    rating: 4.9,
  },
  {
    name: 'Chantuque',
    country: 'Turkey',
    moq: 100,
    specialties: ['High-end contemporary apparel', 'Istanbul'],
    leadTime: 45,
    certifications: ['OEKO-TEX'],
    contactEmail: 'info@chantuque.com',
    contactPhone: null,
    website: 'https://chantuque.com',
    rating: 4.5,
  },
  {
    name: 'Kardem',
    country: 'Turkey',
    moq: 500,
    specialties: ['Ready-made garments', 'Mass production', 'Global Retail', 'Turkey & Serbia'],
    leadTime: 45,
    certifications: ['OEKO-TEX'],
    contactEmail: 'info@kardem.com',
    contactPhone: null,
    website: 'https://kardem.com',
    rating: 4.3,
  },
  {
    name: 'Hermin',
    country: 'Turkey',
    moq: 200,
    specialties: ['Textiles', 'Shirting', 'Woven garments'],
    leadTime: 40,
    certifications: ['OEKO-TEX'],
    contactEmail: 'info@hermin.com.tr',
    contactPhone: null,
    website: 'https://hermin.com.tr',
    rating: 4.4,
  },
  {
    name: 'MPY Textile',
    country: 'Turkey',
    moq: 150,
    specialties: ['Fashion collection development'],
    leadTime: 38,
    certifications: ['OEKO-TEX'],
    contactEmail: 'info@mpytextile.com',
    contactPhone: null,
    website: 'https://mpytextile.com',
    rating: 4.6,
  },
  {
    name: 'Confetil',
    country: 'Portugal',
    moq: 100,
    specialties: ['Activewear', 'High-tech jerseys'],
    leadTime: 32,
    certifications: ['OEKO-TEX'],
    contactEmail: 'info@confetil.pt',
    contactPhone: null,
    website: 'https://confetil.pt',
    rating: 4.6,
  },
  {
    name: 'Sportinout',
    country: 'Portugal',
    moq: 100,
    specialties: ['Technical Sportswear', 'Performance fabrics'],
    leadTime: 35,
    certifications: ['OEKO-TEX'],
    contactEmail: 'info@sportinout.com',
    contactPhone: null,
    website: 'https://sportinout.com',
    rating: 4.5,
  },
  {
    name: 'Quanzhou Haixin Garment Technology Co., Ltd',
    country: 'China',
    moq: 500,
    specialties: ['Garments', 'Apparel', 'Clothing technology', 'Quanzhou'],
    leadTime: 50,
    certifications: ['OEKO-TEX'],
    contactEmail: null,
    contactPhone: null,
    website: null,
    rating: 4.4,
  },
  {
    name: 'QZHIC',
    country: 'China',
    moq: 500,
    specialties: ['Garments', 'Apparel', 'Alibaba', 'Quanzhou'],
    leadTime: 50,
    certifications: ['OEKO-TEX'],
    contactEmail: null,
    contactPhone: null,
    website: 'https://qzhic.en.alibaba.com/fr_FR/company_profile.html',
    rating: 4.4,
  },
];

async function main() {
  console.log('🌱 Remplacement des fournisseurs test par la nouvelle liste...\n');

  try {
    // Supprimer tous les anciens fournisseurs
    const deleted = await prisma.factory.deleteMany({});
    console.log(`🗑️  ${deleted.count} ancien(s) fournisseur(s) supprimé(s).\n`);

    // Créer les nouveaux fournisseurs
    let created = 0;

    for (const factoryData of factories) {
      await prisma.factory.create({
        data: factoryData,
      });
      console.log(`✅ ${factoryData.name} (${factoryData.country})`);
      created++;
    }

    console.log('\n📊 Résumé :');
    console.log(`   ✅ ${created} fournisseur(s) créé(s)`);
    console.log(`   📦 Total dans la base : ${await prisma.factory.count()} fournisseur(s)\n`);
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
