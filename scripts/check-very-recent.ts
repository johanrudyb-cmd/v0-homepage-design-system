
import { prisma } from '../lib/prisma';

async function main() {
    const launchWindow = new Date();
    launchWindow.setMinutes(launchWindow.getMinutes() - 30); // Last 30 mins

    const items = await prisma.trendProduct.findMany({
        where: {
            createdAt: { gte: launchWindow }
        },
        select: {
            id: true,
            sourceBrand: true,
            name: true,
            createdAt: true,
            businessAnalysis: true
        }
    });

    console.log(`\n🔍 Produits ajoutés dans les 30 dernières minutes :`);
    console.log(`Total : ${items.length}`);
    items.forEach(it => {
        console.log(`- [${it.sourceBrand}] ${it.name} (Enrichi: ${it.businessAnalysis ? 'OUI' : 'NON'})`);
    });
}

main().catch(console.error);
