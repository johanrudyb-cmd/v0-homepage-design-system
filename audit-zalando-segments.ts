import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Voir les URLs exactes des articles homme 25-34 Zalando
    const items = await prisma.trendProduct.findMany({
        where: {
            segment: 'homme',
            NOT: { trendLabel: 'ASOS-18-24' },
            sourceBrand: 'Zalando',
        },
        orderBy: { trendScore: 'desc' },
        take: 20,
        select: { id: true, name: true, sourceUrl: true },
    });

    console.log('=== ZALANDO HOMME 25-34 - URLs ===');
    items.forEach(i => {
        const url = i.sourceUrl ?? 'null';
        const flag = url.includes('WOMEN') || url.includes('/femme/') ? '⚠️ FEMME URL' : '✅ OK';
        console.log(`${flag} | "${i.name.slice(0, 50)}" | ${url.slice(0, 100)}`);
    });

    // Compter combien d'articles Zalando homme ont une URL avec WOMEN
    const wrongCount = await prisma.trendProduct.count({
        where: {
            segment: 'homme',
            NOT: { trendLabel: 'ASOS-18-24' },
            sourceBrand: 'Zalando',
            sourceUrl: { contains: 'WOMEN' },
        },
    });
    console.log(`\n⚠️  Articles Zalando avec segment=homme mais URL WOMEN: ${wrongCount}`);

    // Et inversement
    const wrongCount2 = await prisma.trendProduct.count({
        where: {
            segment: 'femme',
            sourceBrand: 'Zalando',
            sourceUrl: { contains: 'MEN' },
            AND: [
                { NOT: { trendLabel: 'ASOS-18-24' } },
                { NOT: { sourceUrl: { contains: 'WOMEN' } } },
            ],
        },
    });
    console.log(`⚠️  Articles Zalando avec segment=femme mais URL MEN: ${wrongCount2}`);

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
