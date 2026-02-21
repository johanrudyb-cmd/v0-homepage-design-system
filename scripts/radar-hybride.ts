
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const SOURCES = [
    {
        name: 'asos-homme-fr',
        url: 'https://www.asos.com/api/product/search/v2/categories/27110?offset=0&limit=72&country=FR&currency=EUR&lang=fr-FR&rowlength=4&sort=freshness',
        brand: 'ASOS',
        segment: 'homme'
    },
    {
        name: 'asos-femme-fr',
        url: 'https://www.asos.com/api/product/search/v2/categories/27108?offset=0&limit=72&country=FR&currency=EUR&lang=fr-FR&rowlength=4&sort=freshness',
        brand: 'ASOS',
        segment: 'femme'
    }
];

// Liste de mots-clés à exclure (Exemple : accessoires, chaussettes...)
const EXCLUSIONS = ['chaussettes', 'pack de', 'lot de', 'gift card', 'cadeau', 'caleçons', 'boxer', 'underwear'];

async function runRadar() {
    console.log('--- 🚀 DEBUT DU RADAR HYBRIDE ---');

    // 1. NETTOYAGE (Optionnel : supprimer les tendances de plus de 7 jours)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 7);
    const deleted = await prisma.trendProduct.deleteMany({
        where: { updatedAt: { lt: oldDate } }
    });
    console.log(`[Refresh All Trends] ${deleted.count} ancienne(s) tendance(s) supprimée(s)`);

    for (const source of SOURCES) {
        try {
            const response = await axios.get(source.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' }
            });

            const rawProducts = response.data.products || [];
            let keptCount = 0;
            let excludedCount = 0;

            for (const p of rawProducts) {
                const name = p.name;
                const nameLower = name.toLowerCase();

                // LOGIQUE D'EXCLUSION
                const isExcluded = EXCLUSIONS.some(word => nameLower.includes(word)) || !p.imageUrl || p.price?.current?.value < 5;

                if (isExcluded) {
                    excludedCount++;
                    continue;
                }

                const sourceUrl = `https://www.asos.com/${p.url}`;
                const imageUrl = `https://${p.imageUrl}`;

                await (prisma.trendProduct as any).upsert({
                    where: { sourceUrl: sourceUrl },
                    update: {
                        averagePrice: p.price.current.value,
                        updatedAt: new Date()
                    },
                    create: {
                        name: name,
                        category: 'AUTRE',
                        style: 'Emergent',
                        material: 'Coton',
                        averagePrice: p.price.current.value,
                        trendScore: 75,
                        trendScoreVisual: 75,
                        saturability: 0,
                        imageUrl: imageUrl,
                        sourceUrl: sourceUrl,
                        productBrand: p.brandName || source.brand,
                        sourceBrand: source.brand,
                        marketZone: 'EUROPE',
                        segment: source.segment
                    }
                });
                keptCount++;
            }

            console.log(`[Hybrid Radar] ${source.brand}: ${rawProducts.length} bruts -> ${keptCount} après exclusions (${excludedCount} exclus)`);
            console.log(`[Refresh All Trends] ${source.name}: ${keptCount} produits enregistrés`);

        } catch (error: any) {
            console.error(`❌ Erreur sur ${source.name}:`, error.message);
        }
    }

    console.log('--- ✨ RADAR TERMINE ---');
}

runRadar()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
