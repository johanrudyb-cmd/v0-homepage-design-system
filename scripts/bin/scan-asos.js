
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// URL de l'API ASOS (Catégorie Nouveautés Homme - cid 27110)
const API_URL = 'https://www.asos.com/api/product/search/v2/categories/27110?offset=0&limit=72&country=FR&currency=EUR&keyStoreDataversion=j7p1ckf-38&lang=fr-FR&rowlength=4&sort=freshness';

async function run() {
    console.log('⚡ DÉMARRAGE ASOS API-DIRECT (V11)...');
    try {
        const response = await axios.get(API_URL, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'accept': 'application/json'
            }
        });

        const products = response.data.products;
        console.log(`✅ ${products.length} articles récupérés instantanément via l'API !`);

        for (const p of products) {
            const sourceUrl = `https://www.asos.com/${p.url}`;
            const imageUrl = p.imageUrl ? `https://${p.imageUrl}` : "";

            await prisma.trendProduct.upsert({
                where: { sourceUrl: sourceUrl },
                update: { averagePrice: p.price.current.value, updatedAt: new Date() },
                create: {
                    name: p.name,
                    category: 'AUTRE',
                    style: 'Emergent',
                    material: 'Coton',
                    averagePrice: p.price.current.value,
                    trendScore: 70,
                    trendScoreVisual: 70,
                    saturability: 0,
                    imageUrl: imageUrl,
                    sourceUrl: sourceUrl,
                    productBrand: p.brandName,
                    sourceBrand: 'ASOS',
                    marketZone: 'EUROPE'
                }
            });
        }
        console.log('✨ Base de données mise à jour.');
    } catch (e) {
        console.error('❌ Erreur API:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
run();
