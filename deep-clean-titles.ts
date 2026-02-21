import { prisma } from './lib/prisma';
import { getProductBrand, cleanProductName } from './lib/brand-utils';

async function main() {
    console.log('Starting deep cleaning of all product titles...');

    const products = await prisma.trendProduct.findMany({
        select: {
            id: true,
            name: true,
            sourceBrand: true,
        }
    });

    console.log(`Analyzing ${products.length} products...`);

    let updatedCount = 0;
    for (const p of products) {
        if (!p.name) continue;

        // 1. Extraire la marque du nom actuel (celui qui est possiblement pollué)
        const extractedBrand = getProductBrand(p.name, p.sourceBrand);

        // 2. Nettoyer le nom en utilisant cette marque
        const displayBrand = extractedBrand || 'Elite';
        const cleanName = cleanProductName(p.name, displayBrand);

        const updates: any = {};
        if (cleanName !== p.name && cleanName.length >= 3) {
            updates.name = cleanName;
        }

        // Si on a trouvé une vraie marque et qu'elle n'est pas encore en base 
        // ou qu'elle était restée sur 'Elite'
        if (extractedBrand && extractedBrand !== 'Elite') {
            updates.productBrand = extractedBrand;
        }

        if (Object.keys(updates).length > 0) {
            await prisma.trendProduct.update({
                where: { id: p.id },
                data: updates
            });
            updatedCount++;
        }
    }

    console.log(`Updated ${updatedCount} products (names and/or brands).`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
