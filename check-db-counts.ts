
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Vérification DB ---');
    const total = await prisma.trendProduct.count();
    console.log(`Total Produits: ${total}`);

    const parSegment = await prisma.trendProduct.groupBy({
        by: ['segment'],
        _count: true
    });
    console.log('Par Segment:', parSegment);

    const recents = await prisma.trendProduct.count({
        where: {
            updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Dernières 24h
        }
    });
    console.log(`Produits mis à jour dernière 24h: ${recents}`);

    const exemples = await prisma.trendProduct.findMany({
        take: 3,
        orderBy: { updatedAt: 'desc' },
        select: { name: true, segment: true, updatedAt: true, averagePrice: true }
    });
    console.log('Derniers produits:', exemples);
}

main().finally(() => prisma.$disconnect());
