const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.trendProduct.count();
        console.log(`Nombre total de produits Trend: ${count}`);

        if (count > 0) {
            // Check filters
            const men1824 = await prisma.trendProduct.count({
                where: {
                    segment: 'homme',
                    // sourceBrand: { in: ['Global Partner', 'Zara'] }  // Commenté pour voir large
                }
            });
            console.log(`Produits Homme (tout âge): ${men1824}`);

            const withUrl = await prisma.trendProduct.count({
                where: { sourceUrl: { not: null } }
            });
            console.log(`Produits avec URL (requis): ${withUrl}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
