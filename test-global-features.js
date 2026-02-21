const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function testDatabase() {
    console.log('--- TEST 1: BASE DE DONNÉES (Supabase) ---');
    try {
        const start = Date.now();
        const userCount = await prisma.user.count();
        console.log(`✅ Connexion OK (${Date.now() - start}ms) | Users: ${userCount}`);
        return true;
    } catch (e) {
        console.error('❌ ECHEC Connexion DB:', e.message);
        return false;
    }
}

async function testTrends() {
    console.log('\n--- TEST 2: TENDANCES (Home/Radar) ---');
    try {
        const count = await prisma.trendProduct.count();
        console.log(`📊 Nombre total de produits: ${count}`);

        if (count > 0) {
            const sample = await prisma.trendProduct.findFirst({
                select: { name: true, trendScore: true, outfityIVS: true } // si outfityIVS existe dans le schéma
            });
            console.log(`✅ Exemple produit: "${sample.name}" (Score: ${sample.trendScore})`);
        } else {
            console.warn('⚠️ Table TrendProduct vide (normal si pas de scrape)');
        }
        return true;
    } catch (e) {
        console.error('❌ ECHEC Trends:', e.message);
        return false;
    }
}

async function testBlog() {
    console.log('\n--- TEST 3: BLOG (Articles) ---');
    try {
        const count = await prisma.blogPost.count({ where: { published: true } });
        console.log(`📝 Articles publiés: ${count}`);
        return true;
    } catch (e) {
        console.error('❌ ECHEC Blog:', e.message);
        return false;
    }
}

function testMarketIndex() {
    console.log('\n--- TEST 4: BOURSE (Fichier JSON) ---');
    const jsonPath = path.join(process.cwd(), 'market-index.json');

    if (!fs.existsSync(jsonPath)) {
        console.warn('⚠️ Fichier market-index.json NON TROUVÉ. La Bourse sera vide.');
        return false;
    }

    try {
        const data = fs.readFileSync(jsonPath, 'utf-8');
        const index = JSON.parse(data);
        console.log(`✅ Fichier chargé (${index.length} entrées).`);

        if (index.length > 0) {
            const sample = index[0];
            console.log(`   Exemple: ${sample.category} (${sample.segment}) - Growth: ${sample.growthPercent}%`);
        }
        return true;
    } catch (e) {
        console.error('❌ ECHEC Lecture JSON Bourse:', e.message);
        return false;
    }
}

async function main() {
    console.log('🔍 DÉMARRAGE DIAGNOSTIC COMPLET...\n');

    const dbOk = await testDatabase();
    if (dbOk) {
        await testTrends();
        await testBlog();
    }

    testMarketIndex();

    console.log('\n🏁 FIN DU DIAGNOSTIC.');
    await prisma.$disconnect();
}

main();
