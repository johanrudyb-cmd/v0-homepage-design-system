import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncDatabase() {
    console.log('🔧 Synchronisation de la base de données...\n');

    try {
        // Ajouter la colonne stripeCustomerId
        console.log('📝 Ajout de la colonne stripeCustomerId...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
    `);
        console.log('✅ Colonne ajoutée');

        // Créer l'index unique
        console.log('\n📝 Création de l\'index unique...');
        await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeCustomerId_key" 
      ON "User"("stripeCustomerId") 
      WHERE "stripeCustomerId" IS NOT NULL;
    `);
        console.log('✅ Index créé');

        // Vérifier
        console.log('\n🔍 Vérification...');
        const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'User' AND column_name = 'stripeCustomerId';
    `);

        console.log('Résultat:', result);

        if (Array.isArray(result) && result.length > 0) {
            console.log('\n✅ La colonne stripeCustomerId existe maintenant !');
            console.log('Type:', result[0].data_type);
            console.log('Nullable:', result[0].is_nullable);
        } else {
            console.log('\n❌ La colonne n\'a pas été créée');
        }

        console.log('\n🎉 Synchronisation terminée !');
        console.log('\nVous pouvez maintenant:');
        console.log('1. Redémarrer le serveur: npm run dev');
        console.log('2. Tester la création de compte et la connexion');

    } catch (error) {
        console.error('\n❌ Erreur:', error);
        console.error('Message:', error instanceof Error ? error.message : String(error));
    } finally {
        await prisma.$disconnect();
    }
}

syncDatabase();
