
import { prisma } from '../lib/prisma';

async function main() {
    const items = await prisma.trendProduct.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: {
            name: true,
            productBrand: true,
            sourceBrand: true
        }
    });

    console.log('\n🔍 Aperçu des Marques (50 derniers produits) :');
    console.table(items.map(i => ({
        Nom: i.name.slice(0, 30),
        Marque: i.productBrand || '(null)',
        Source: i.sourceBrand
    })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
