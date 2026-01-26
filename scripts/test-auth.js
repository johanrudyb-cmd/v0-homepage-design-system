require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    const email = 'johanrudy.b@gmail.com';
    const password = '12345678';

    console.log('🔍 Test d\'authentification...\n');
    console.log(`Email: ${email}`);
    console.log(`Mot de passe: ${password}\n`);

    console.log('1️⃣ Recherche de l\'utilisateur...');
    const startTime = Date.now();
    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const queryTime = Date.now() - startTime;
    console.log(`   ✅ Requête terminée en ${queryTime}ms`);

    if (!user) {
      console.log('   ❌ Utilisateur non trouvé');
      return;
    }

    console.log(`   ✅ Utilisateur trouvé: ${user.name || user.email}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔑 Mot de passe hashé: ${user.password ? 'Oui' : 'Non'}\n`);

    if (!user.password) {
      console.log('   ❌ Pas de mot de passe pour cet utilisateur');
      return;
    }

    console.log('2️⃣ Vérification du mot de passe...');
    const compareStart = Date.now();
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    const compareTime = Date.now() - compareStart;
    console.log(`   ✅ Vérification terminée en ${compareTime}ms`);

    if (isPasswordValid) {
      console.log('   ✅ Mot de passe correct !\n');
      console.log('🎉 Authentification réussie !');
    } else {
      console.log('   ❌ Mot de passe incorrect\n');
      console.log('💡 Le mot de passe que vous avez testé n\'est pas correct.');
      console.log('   Essayez avec le mot de passe que vous avez utilisé lors de l\'inscription.');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
