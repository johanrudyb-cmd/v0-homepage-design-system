import { prisma } from './lib/prisma';
async function main() {
    const p = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'ASOS' },
        select: { name: true, productBrand: true },
        take: 25
    });
    p.forEach(x => console.log('name:', JSON.stringify(x.name), '| brand:', JSON.stringify(x.productBrand)));
}
main().finally(() => prisma.$disconnect());
