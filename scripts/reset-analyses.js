/**
 * Script pour réinitialiser les analyses d'un utilisateur
 * Permet de tester sans limite
 * 
 * Usage: node scripts/reset-analyses.js <email>
 * Exemple: node scripts/reset-analyses.js user@example.com
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function resetAnalyses() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Veuillez fournir un email');
    console.log('Usage: node scripts/reset-analyses.js <email>');
    console.log('Exemple: node scripts/reset-analyses.js user@example.com');
    process.exit(1);
  }

  try {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Utilisateur avec l'email "${email}" non trouvé`);
      process.exit(1);
    }

    console.log(`👤 Utilisateur trouvé: ${user.email} (Plan: ${user.plan})`);

    // Compter les analyses
    const count = await prisma.brandSpyAnalysis.count({
      where: { userId: user.id },
    });

    console.log(`📊 Nombre d'analyses actuelles: ${count}`);

    if (count === 0) {
      console.log('✅ Aucune analyse à supprimer');
      process.exit(0);
    }

    // Supprimer les analyses
    const result = await prisma.brandSpyAnalysis.deleteMany({
      where: { userId: user.id },
    });

    console.log(`✅ ${result.count} analyse(s) supprimée(s)`);
    console.log('\n🎉 Vous pouvez maintenant tester à nouveau!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.message.includes('MaxClientsInSessionMode')) {
      console.error('\n💡 Solution:');
      console.error('   1. Arrêtez le serveur de développement (Ctrl+C dans le terminal où npm run dev est lancé)');
      console.error('   2. Attendez quelques secondes');
      console.error('   3. Relancez cette commande');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAnalyses();
