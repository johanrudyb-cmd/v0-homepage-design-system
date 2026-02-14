import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const counts = await prisma.trendProduct.groupBy({
        by: ['sourceBrand', 'segment'],
        _count: {
            _all: true,
        },
    });
    console.log(JSON.stringify(counts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
