require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'test@example.com';
    const password = 'test1234';
    const name = 'Utilisateur Test';

    console.log('🔍 Vérification si l\'utilisateur existe déjà...');
    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('✅ Utilisateur existe déjà:', email);
      console.log('   Vous pouvez vous connecter avec :');
      console.log(`   Email: ${email}`);
      console.log(`   Mot de passe: ${password}`);
      return;
    }

    console.log('🔐 Hachage du mot de passe...');
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('👤 Création de l\'utilisateur...');
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        plan: 'free',
      },
    });

    console.log('✅ Utilisateur créé avec succès !\n');
    console.log('📧 Identifiants de connexion :');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}\n`);
    console.log('💡 Vous pouvez maintenant vous connecter sur /auth/signin');
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
