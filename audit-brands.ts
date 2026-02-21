import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Top marques pour 18-24
    console.log('=== MARQUES 18-24 (trendLabel=ASOS-18-24) ===');
    const brands1824 = await prisma.trendProduct.groupBy({
        by: ['productBrand'],
        where: { trendLabel: 'ASOS-18-24' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
    });
    brands1824.forEach(b => console.log(`  ${b.productBrand ?? '(null)'}: ${b._count.id}`));

    // Top marques pour 25-34
    console.log('\n=== MARQUES 25-34 (hors ASOS-18-24) ===');
    const brands2534 = await prisma.trendProduct.groupBy({
        by: ['productBrand'],
        where: { NOT: { trendLabel: 'ASOS-18-24' } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
    });
    brands2534.forEach(b => console.log(`  ${b.productBrand ?? '(null)'}: ${b._count.id}`));

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
