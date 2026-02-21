import { prisma } from './lib/prisma';

async function main() {
    console.log('Cleaning up masks/masques from DB...');
    const result = await prisma.trendProduct.deleteMany({
        where: {
            OR: [
                { name: { contains: 'masque', mode: 'insensitive' } },
                { name: { contains: 'mask', mode: 'insensitive' } }
            ]
        }
    });
    console.log(`Deleted ${result.count} mask-related products.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
