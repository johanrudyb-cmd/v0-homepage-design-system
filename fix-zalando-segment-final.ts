import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing Zalando segment by URL city/gender pattern...\n');

    const allZalando = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        select: { id: true, name: true, segment: true, sourceUrl: true },
    });

    let toFemme = 0;
    let toHomme = 0;
    let ok = 0;

    for (const item of allZalando) {
        const url = item.sourceUrl ?? '';
        // Pattern: /trending-items/CITY/GENDER/
        const match = url.match(/trending-items\/[^/]+\/(women|men)\//i);
        if (!match) { ok++; continue; }

        const urlGender = match[1].toLowerCase(); // 'women' ou 'men'
        const correctSegment = urlGender === 'women' ? 'femme' : 'homme';

        if (item.segment !== correctSegment) {
            await prisma.trendProduct.update({
                where: { id: item.id },
                data: { segment: correctSegment },
            });
            const arrow = correctSegment === 'femme' ? '♀️ ' : '♂️ ';
            console.log(`  ${arrow} [${item.segment}→${correctSegment}] "${item.name.slice(0, 60)}"`);
            if (correctSegment === 'femme') toFemme++;
            else toHomme++;
        } else {
            ok++;
        }
    }

    console.log(`\n✅ Fixed: ${toFemme} → femme, ${toHomme} → homme. Already correct: ${ok}`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
