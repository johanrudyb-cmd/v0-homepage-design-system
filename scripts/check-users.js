require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs dans la base de données...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données.\n');
      console.log('💡 Vous devez créer un compte via /auth/signup\n');
      return;
    }

    console.log(`✅ ${users.length} utilisateur(s) trouvé(s) :\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Nom: ${user.name || 'Non défini'}`);
      console.log(`   Plan: ${user.plan}`);
      console.log(`   Créé le: ${user.createdAt}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
