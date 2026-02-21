
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- RECENTLY ADDED TREND PRODUCTS (LAST HOUR) ---');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const products = await (prisma.trendProduct as any).findMany({
        where: {
            createdAt: {
                gte: oneHourAgo
            }
        },
        orderBy: { createdAt: 'desc' },
        select: {
            name: true,
            sourceBrand: true,
            trendScore: true,
            createdAt: true,
            category: true
        }
    });

    if (products.length === 0) {
        console.log('No products added in the last hour.');

        // Let's check the last 24h just in case
        console.log('\n--- LAST 24H SUMMARY ---');
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const count = await (prisma.trendProduct as any).count({
            where: { createdAt: { gte: twentyFourHoursAgo } }
        });
        console.log(`Products added in last 24h: ${count}`);
    } else {
        products.forEach((p: any) => {
            console.log(`[${p.createdAt.toISOString()}] ${p.sourceBrand} - ${p.name} (Score: ${p.trendScore}, Cat: ${p.category})`);
        });
        console.log(`\nTotal products added in last hour: ${products.length}`);
    }

    const total = await (prisma.trendProduct as any).count();
    console.log(`Total products in DB: ${total}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
