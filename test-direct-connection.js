const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
    console.log('🔍 Analyse de la connexion DB...');

    let url = process.env.DATABASE_URL;
    if (!url) {
        console.error('❌ DATABASE_URL manquante.');
        return;
    }

    console.log('Original URL (masquée):', url.replace(/:[^:/@]+@/, ':****@'));

    // Simulation de la transformation faite dans lib/prisma.ts
    if (url.includes(':6543')) {
        console.log('🔄 Transformation vers port 5432 (Direct)...');
        url = url.replace(':6543', ':5432')
            .replace('?pgbouncer=true', '?')
            .replace('&pgbouncer=true', '');

        // Nettoyage éventuel de "?&" ou "??"
        url = url.replace('?&', '?').replace('??', '?');

        console.log('New URL (masquée):', url.replace(/:[^:/@]+@/, ':****@'));
    } else {
        console.log('⚠️ L\'URL n\'utilise pas le port 6543. Pas de transformation.');
    }

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url,
            },
        },
    });

    console.log('⏳ Test de connexion query (TrendProduct)...');
    try {
        const start = Date.now();
        // On tente de récupérer 1 produit trend, comme sur la home
        const products = await prisma.trendProduct.findMany({ take: 1 });
        console.log(`✅ SUCCÈS ! Récupéré ${products.length} produit(s) en ${Date.now() - start}ms.`);
        console.log('La connexion Directe (5432) fonctionne parfaitement.');
    } catch (e) {
        console.error('❌ ÉCHEC de la connexion Directe :');
        console.error(e.message);
        console.log('\n💡 DIAGNOSTIC : Si ça échoue ici, c\'est que le port 5432 est bloqué ou que l\'URL est mal formée.');
    } finally {
        await prisma.$disconnect();
    }
}

main();
