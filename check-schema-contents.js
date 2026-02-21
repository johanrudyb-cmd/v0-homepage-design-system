const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const total = await prisma.trendProduct.count();
        const analyzed = await prisma.trendProduct.count({
            where: {
                OR: [
                    { trendGrowthPercent: { not: null } },
                    { trendLabel: { not: null, not: '' } }
                ]
            }
        });
        console.log(`Total Produits: ${total}`);
        console.log(`Produits Analysés (requis pour affichage Femme): ${analyzed}`);

        if (analyzed === 0) {
            console.warn('⚠️ AUCUN produit analysé ! Le filtre Front-end masque tout.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
