/**
 * Script de configuration de la base de données
 * Utilise Prisma Client directement pour créer les tables
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const databaseUrl = process.env.DATABASE_URL || '';
const isAccelerateUrl = databaseUrl.startsWith('prisma+');

const prisma = new PrismaClient(
  isAccelerateUrl ? { accelerateUrl: databaseUrl } : {}
);

async function main() {
  console.log('🔌 Connexion à la base de données...');
  
  try {
    // Test de connexion
    await prisma.$connect();
    console.log('✅ Connexion réussie !');
    
    // Vérifier si les tables existent
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log(`📊 Tables existantes: ${tables.length}`);
    
    if (tables.length === 0) {
      console.log('⚠️  Aucune table trouvée. Exécutez "npm run db:push" pour créer les tables.');
    } else {
      console.log('✅ Tables trouvées:', tables.map(t => t.table_name).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Solutions possibles:');
    console.log('1. Vérifiez que DATABASE_URL est correct dans .env');
    console.log('2. Vérifiez que PostgreSQL est démarré');
    console.log('3. Vérifiez que la base de données existe');
  } finally {
    await prisma.$disconnect();
  }
}

main();
