import { prisma } from './lib/prisma';

async function main() {
    const stats = await prisma.trendProduct.groupBy({
        by: ['sourceBrand', 'segment'],
        _count: { _all: true }
    });
    console.log('Database Stats:', JSON.stringify(stats, null, 2));

    // Check if there are any products with segment null or mixed up
    const nullSegment = await prisma.trendProduct.count({
        where: { segment: null }
    });
    console.log('Products with segment null:', nullSegment);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
