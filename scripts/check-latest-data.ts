
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- LATEST TREND PRODUCTS ---');
    const products = await (prisma.trendProduct as any).findMany({
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
            name: true,
            sourceBrand: true,
            trendScore: true,
            updatedAt: true,
            category: true
        }
    });

    products.forEach((p: any) => {
        console.log(`[${p.updatedAt.toISOString()}] ${p.sourceBrand} - ${p.name} (Score: ${p.trendScore}, Cat: ${p.category})`);
    });

    const counts = await (prisma.trendProduct as any).count();
    console.log(`\nTotal products in DB: ${counts}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
