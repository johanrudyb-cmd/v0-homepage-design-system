
import { prisma } from '../lib/prisma';

async function main() {
    const items = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'ASOS' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
            name: true,
            sourceBrand: true,
            businessAnalysis: true,
            estimatedCogsPercent: true,
            createdAt: true
        }
    });

    console.log(`\n🔍 Vérification des 5 derniers produits ASOS :`);
    items.forEach(item => {
        console.log(`- ${item.name} (${item.createdAt.toISOString()})`);
        console.log(`  Enrichi : ${item.businessAnalysis ? 'OUI ✅' : 'NON ❌'}`);
        console.log(`  Marge (COGS) : ${item.estimatedCogsPercent}%`);
    });
}

main().catch(console.error);
