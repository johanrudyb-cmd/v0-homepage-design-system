import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const samples = await prisma.trendProduct.findMany({
        where: {
            sourceBrand: { in: ['ASOS', 'Global Partner'] },
            imageUrl: { not: null }
        },
        take: 5
    });
    console.log(JSON.stringify(samples.map(s => ({ brand: s.sourceBrand, segment: s.segment, imageUrl: s.imageUrl })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
