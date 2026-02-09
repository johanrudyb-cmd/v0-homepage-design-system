/**
 * Script de test de connexion à Supabase
 * Vérifie que la connection string est correcte
 */

require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

async function testConnection() {
  console.log('🔌 Test de connexion à Supabase...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL n\'est pas défini dans .env');
    console.log('💡 Ajoutez DATABASE_URL="postgresql://..." dans votre .env');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  
  // Vérifier le format
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('❌ DATABASE_URL doit être une URL PostgreSQL');
    console.log('   Format attendu: postgresql://user:password@host:port/database');
    console.log(`   Format actuel: ${dbUrl.substring(0, 50)}...`);
    console.log('\n💡 Pour Supabase :');
    console.log('   1. Allez sur supabase.com/dashboard');
    console.log('   2. Settings → Database → Connection string → URI');
    console.log('   3. Copiez la connection string dans votre .env\n');
    process.exit(1);
  }

  // Masquer le mot de passe dans les logs
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
  console.log(`📋 Connection string: ${maskedUrl}\n`);

  const pool = new Pool({
    connectionString: dbUrl,
  });

  try {
    console.log('🔄 Connexion en cours...');
    const client = await pool.connect();
    console.log('✅ Connexion réussie !\n');

    // Tester une requête simple
    console.log('🧪 Test de requête...');
    const versionResult = await client.query('SELECT version()');
    console.log('✅ Requête réussie !\n');

    // Vérifier les tables existantes
    console.log('📊 Vérification des tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows;
    
    if (tables.length === 0) {
      console.log('⚠️  Aucune table trouvée.');
      console.log('💡 Exécutez "npm run db:push" pour créer les tables.\n');
    } else {
      console.log(`✅ ${tables.length} table(s) trouvée(s) :`);
      tables.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.table_name}`);
      });
      console.log('');
    }

    // Vérifier les tables attendues (noms Prisma = noms de tables par défaut)
    const expectedTables = [
      'User', 'Account', 'Session', 'VerificationToken',
      'Brand', 'LaunchMap', 'LaunchMapDesignDraft', 'Design', 'Factory', 'Quote', 'BrandSpyAnalysis'
    ];
    
    const foundTables = tables.map(t => t.table_name);
    const missingTables = expectedTables.filter(t => !foundTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('⚠️  Tables manquantes :');
      missingTables.forEach(t => console.log(`   - ${t}`));
      console.log('\n💡 Exécutez "npm run db:push" pour créer les tables manquantes.\n');
    } else {
      console.log('🎉 Toutes les tables attendues sont présentes !\n');
    }

    // Vérification spécifique historique designs (LaunchMapDesignDraft)
    if (foundTables.includes('LaunchMapDesignDraft')) {
      console.log('📋 Vérification table LaunchMapDesignDraft (historique designs)...');
      try {
        const countResult = await client.query('SELECT COUNT(*) as count FROM "LaunchMapDesignDraft"');
        console.log(`   ✅ Table accessible. Nombre d\'entrées : ${countResult.rows[0].count}\n`);
      } catch (e) {
        console.log('   ❌ Erreur sur LaunchMapDesignDraft :', e.message);
        console.log('   💡 Exécutez "npm run db:push" pour synchroniser le schéma.\n');
      }
    }

    client.release();
    console.log('✅ Tout fonctionne correctement !');
    console.log('💡 Vous pouvez maintenant utiliser votre application.\n');

  } catch (error) {
    console.error('❌ Erreur de connexion :\n');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('password')) {
      console.log('💡 Solutions possibles :');
      console.log('   1. Vérifiez que le mot de passe dans DATABASE_URL est correct');
      console.log('   2. Le mot de passe peut contenir des caractères spéciaux');
      console.log('   3. Encodez les caractères spéciaux dans l\'URL (ex: @ devient %40)\n');
    } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      console.log('💡 Solutions possibles :');
      console.log('   1. Vérifiez votre connexion internet');
      console.log('   2. Vérifiez que le projet Supabase est actif');
      console.log('   3. Vérifiez que l\'URL est correcte\n');
    } else if (error.message.includes('does not exist')) {
      console.log('💡 Solutions possibles :');
      console.log('   1. Vérifiez que le nom de la base de données est correct');
      console.log('   2. Supabase utilise généralement "postgres" comme nom de base\n');
    } else {
      console.log('💡 Vérifiez :');
      console.log('   1. Que DATABASE_URL est correct dans .env');
      console.log('   2. Que le projet Supabase est créé et actif');
      console.log('   3. Que vous avez les bonnes permissions\n');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
