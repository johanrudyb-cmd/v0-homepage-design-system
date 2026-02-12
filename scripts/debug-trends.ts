import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const total = await prisma.trendProduct.count();
    const featured = await prisma.trendProduct.count({ where: { isGlobalTrendAlert: true } });

    console.log(`Total TrendProducts: ${total}`);
    console.log(`Featured (GlobalTrendAlert): ${featured}`);

    const latest = await prisma.trendProduct.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { name: true, sourceBrand: true, productBrand: true, isGlobalTrendAlert: true }
    });

    console.log('\nLatest 5 products:');
    console.table(latest);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
