import { PrismaClient } from '@prisma/client';

async function testConnection() {
  console.log('🔍 Test de connexion Supabase...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL non configurée dans les variables d\'environnement\n');
    console.log('💡 Solutions :');
    console.log('   1. Créez un fichier .env à la racine du projet');
    console.log('   2. Ajoutez DATABASE_URL="postgresql://..."');
    console.log('   3. Utilisez le Session Pooler de Supabase (port 6543)\n');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    // Test 1 : Connexion basique
    console.log('1️⃣ Test connexion basique...');
    await prisma.$connect();
    console.log('   ✅ Connexion réussie\n');

    // Test 2 : Requête simple
    console.log('2️⃣ Test requête simple...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Nombre d'utilisateurs : ${userCount}\n`);

    // Test 3 : Requête avec relations
    console.log('3️⃣ Test requête avec relations...');
    const brands = await prisma.brand.findMany({
      take: 5,
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });
    console.log(`   ✅ Marques récupérées : ${brands.length}\n`);

    // Test 4 : Performance
    console.log('4️⃣ Test performance...');
    const start = Date.now();
    await prisma.user.findMany({ take: 10 });
    const duration = Date.now() - start;
    console.log(`   ✅ Temps de réponse : ${duration}ms\n`);

    // Test 5 : Vérification du pooler
    console.log('5️⃣ Vérification configuration...');
    const dbUrl = process.env.DATABASE_URL || '';
    const usesPooler = dbUrl.includes('pooler') || dbUrl.includes(':6543');
    const usesDirect = dbUrl.includes(':5432') && !dbUrl.includes('pooler');
    
    if (usesPooler) {
      console.log('   ✅ Session Pooler détecté (recommandé)\n');
    } else if (usesDirect) {
      console.log('   ⚠️  Connexion directe détectée (non recommandé pour production)\n');
      console.log('   💡 Utilisez le Session Pooler pour de meilleures performances\n');
    } else {
      console.log('   ⚠️  Type de connexion non détecté\n');
    }

    console.log('✅ Tous les tests sont passés !\n');
    console.log('📊 Informations de connexion :');
    console.log(`   - URL : ${dbUrl.substring(0, 60)}...`);
    console.log(`   - Pooler : ${usesPooler ? 'Oui ✅' : 'Non ⚠️'}`);
    console.log(`   - Port : ${dbUrl.includes(':6543') ? '6543 (Pooler) ✅' : dbUrl.includes(':5432') ? '5432 (Direct) ⚠️' : 'Inconnu'}`);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Erreur de connexion :\n');
    console.error(`   ${errorMessage}\n`);
    
    // Diagnostic automatique
    if (errorMessage.includes('P1001') || errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED')) {
      console.log('💡 Diagnostic : Erreur de connexion\n');
      console.log('   Solutions possibles :');
      console.log('   1. Vérifiez que DATABASE_URL est correct dans .env');
      console.log('   2. Utilisez le Session Pooler (port 6543)');
      console.log('   3. Vérifiez que le projet Supabase est actif');
      console.log('   4. Vérifiez votre connexion internet');
      console.log('   5. Vérifiez les logs Supabase (Dashboard → Logs)\n');
    } else if (errorMessage.includes('password') || errorMessage.includes('authentication') || errorMessage.includes('P1000')) {
      console.log('💡 Diagnostic : Erreur d\'authentification\n');
      console.log('   Solutions possibles :');
      console.log('   1. Vérifiez le mot de passe dans DATABASE_URL');
      console.log('   2. Encodez les caractères spéciaux dans l\'URL (ex: @ devient %40)');
      console.log('   3. Régénérez le mot de passe dans Supabase Dashboard');
      console.log('   4. Vérifiez le format de l\'URL (doit commencer par postgresql://)\n');
    } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      console.log('💡 Diagnostic : Timeout de connexion\n');
      console.log('   Solutions possibles :');
      console.log('   1. Utilisez le Session Pooler (plus rapide et stable)');
      console.log('   2. Vérifiez votre connexion internet');
      console.log('   3. Ajoutez connect_timeout=30 dans DATABASE_URL');
      console.log('   4. Vérifiez les limites de connexions dans Supabase\n');
    } else if (errorMessage.includes('P2002') || errorMessage.includes('unique')) {
      console.log('💡 Diagnostic : Contrainte unique violée\n');
      console.log('   Ce n\'est pas un problème de connexion, mais de données.');
      console.log('   La connexion fonctionne correctement.\n');
    } else {
      console.log('💡 Vérifiez :');
      console.log('   1. Que DATABASE_URL est correct');
      console.log('   2. Que le projet Supabase est créé et actif');
      console.log('   3. Que vous avez les bonnes permissions');
      console.log('   4. Les logs Supabase pour plus de détails');
      console.log('   5. Les logs Vercel si en production\n');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
