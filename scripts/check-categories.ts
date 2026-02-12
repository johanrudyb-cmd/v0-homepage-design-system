
import { prisma } from '../lib/prisma';

async function main() {
    const launchWindow = new Date();
    launchWindow.setHours(launchWindow.getHours() - 1); // Only items from the last hour (the recent scrape)

    const items = await prisma.trendProduct.findMany({
        where: {
            createdAt: { gte: launchWindow }
        },
        select: {
            category: true,
            sourceBrand: true
        }
    });

    console.log(`\n📊 Statistiques du scraping (dernière heure) :`);
    console.log(`Total nouveaux produits : ${items.length}`);

    const byCategory = items.reduce((acc, item) => {
        const cat = item.category || 'Non spécifié';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log('\nBreakdown par Catégorie :');
    console.table(Object.entries(byCategory).map(([cat, count]) => ({ Catégorie: cat, Nombre: count })));

    const bySource = items.reduce((acc, item) => {
        const src = item.sourceBrand || 'Inconnue';
        acc[src] = (acc[src] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log('\nBreakdown par Source :');
    console.table(Object.entries(bySource).map(([src, count]) => ({ Source: src, Nombre: count })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
