import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing segments based on sourceUrl...');

    // Corriger via sourceUrl ASOS qui contient /femme/ ou /homme/
    const allItems = await prisma.trendProduct.findMany({
        select: { id: true, name: true, segment: true, sourceUrl: true, sourceBrand: true },
    });

    let fixedToFemme = 0;
    let fixedToHomme = 0;
    let skipped = 0;

    for (const item of allItems) {
        const url = (item.sourceUrl ?? '').toLowerCase();

        // Détecter le segment depuis l'URL
        const urlSaysFemme = url.includes('/femme/') || url.includes('gender=women') || url.includes('gender=female');
        const urlSaysHomme = url.includes('/homme/') || url.includes('/men/') || url.includes('gender=men') || url.includes('gender=male');

        if (urlSaysFemme && item.segment !== 'femme') {
            await prisma.trendProduct.update({ where: { id: item.id }, data: { segment: 'femme' } });
            console.log(`  ♀️  [${item.segment}→femme] "${item.name.slice(0, 60)}"`);
            fixedToFemme++;
        } else if (urlSaysHomme && item.segment !== 'homme') {
            await prisma.trendProduct.update({ where: { id: item.id }, data: { segment: 'homme' } });
            console.log(`  ♂️  [${item.segment}→homme] "${item.name.slice(0, 60)}"`);
            fixedToHomme++;
        } else {
            skipped++;
        }
    }

    console.log(`\n✅ Fixed: ${fixedToFemme} → femme, ${fixedToHomme} → homme. Skipped: ${skipped}`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
