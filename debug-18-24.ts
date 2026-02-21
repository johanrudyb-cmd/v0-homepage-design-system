import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Total items par segment
    const hommeTotal = await prisma.trendProduct.count({ where: { segment: 'homme', sourceBrand: 'Global Partner' } });
    const femmeTotal = await prisma.trendProduct.count({ where: { segment: 'femme', sourceBrand: 'Global Partner' } });

    // Items avec URL preview (= 18-24)
    const hommePreview = await prisma.trendProduct.count({ where: { segment: 'homme', sourceBrand: 'Global Partner', sourceUrl: { contains: 'preview' } } });
    const femmePreview = await prisma.trendProduct.count({ where: { segment: 'femme', sourceBrand: 'Global Partner', sourceUrl: { contains: 'preview' } } });

    // Items SANS preview (= 25-34 / standard)
    const hommeStd = await prisma.trendProduct.count({ where: { segment: 'homme', sourceBrand: 'Global Partner', NOT: { sourceUrl: { contains: 'preview' } } } });
    const femmeStd = await prisma.trendProduct.count({ where: { segment: 'femme', sourceBrand: 'Global Partner', NOT: { sourceUrl: { contains: 'preview' } } } });

    console.log('=== AUDIT GLOBAL PARTNER ===');
    console.log(`Homme total: ${hommeTotal} (preview: ${hommePreview}, standard: ${hommeStd})`);
    console.log(`Femme total: ${femmeTotal} (preview: ${femmePreview}, standard: ${femmeStd})`);

    // Quelques exemples d'items récents
    const recent = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Global Partner' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { name: true, segment: true, sourceUrl: true, createdAt: true }
    });
    console.log('\n=== 5 DERNIERS ITEMS ===');
    recent.forEach(i => console.log(`[${i.segment}] ${i.name} | ${i.sourceUrl?.slice(0, 60)} | ${i.createdAt}`));

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
