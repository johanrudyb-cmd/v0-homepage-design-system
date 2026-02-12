
import { prisma } from '../lib/prisma';

async function main() {
    const items = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'ASOS' },
        orderBy: { name: 'asc' },
        select: {
            name: true,
            businessAnalysis: true,
            estimatedCogsPercent: true,
            dominantAttribute: true
        }
    });

    const enriched = items.filter(it => it.businessAnalysis || it.estimatedCogsPercent).length;

    console.log(`\n📊 Statut Global ASOS en DB :`);
    console.log(`Total items ASOS : ${items.length}`);
    console.log(`Items avec données IA : ${enriched}`);

    if (items.length > 0) {
        console.log(`\nExemple (1er item) :`);
        console.log(items[0]);
    }
}

main().catch(console.error);
