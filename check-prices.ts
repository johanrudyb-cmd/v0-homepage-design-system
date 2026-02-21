import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
    const items = await p.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        select: { name: true, averagePrice: true, productBrand: true },
        take: 15,
        orderBy: { trendScore: 'desc' }
    });
    items.forEach(i => console.log(`${i.averagePrice}€ | ${i.productBrand} | ${i.name.slice(0, 40)}`));
    await p.$disconnect();
}
main();
