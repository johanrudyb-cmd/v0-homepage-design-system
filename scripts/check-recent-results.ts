
import { prisma } from '../lib/prisma';

async function main() {
    const launchWindow = new Date();
    launchWindow.setHours(launchWindow.getHours() - 4); // Check last 4 hours

    // On utilise le bon modèle : TrendProduct
    const items = await prisma.trendProduct.findMany({
        where: {
            createdAt: { gte: launchWindow }
        },
        select: {
            id: true,
            sourceBrand: true,
            name: true,
            createdAt: true
        }
    });

    console.log(`\n🔍 Résultat du scraping récent (depuis 4h) :`);
    console.log(`Total nouveaux items : ${items.length}`);

    const bySource = items.reduce((acc, item) => {
        const src = item.sourceBrand || 'Inconnu';
        acc[src] = (acc[src] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.table(bySource);
}

main().catch(console.error);
