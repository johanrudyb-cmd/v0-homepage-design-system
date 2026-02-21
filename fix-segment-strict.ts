import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mots-clés STRICTEMENT féminins (jamais portés par un homme)
const STRICT_FEMME = [
    'minijupe', 'jupe', 'robe ', 'robe\b', 'bralette', 'soutien-gorge',
    'bustier', 'bikini', 'culotte femme', 'shorty femme',
    'maternité', 'grossesse',
];

// Mots-clés STRICTEMENT masculins (jamais portés par une femme)
const STRICT_HOMME = [
    'boxer homme', 'slip homme', 'costume homme', 'cravate homme',
];

async function main() {
    console.log('🔧 Reverting over-aggressive segment fixes...');

    // Remettre en "femme" les articles qui ont été mal déplacés vers "homme"
    // Critère: segment=homme mais sourceBrand scrape depuis source femme
    // On va simplement remettre les articles Zalando/ASOS qui ont segment=homme
    // mais dont le nom contient des mots strictement féminins

    const hommeItems = await prisma.trendProduct.findMany({
        where: { segment: 'homme' },
        select: { id: true, name: true },
    });

    let fixedToFemme = 0;
    for (const item of hommeItems) {
        const nameLower = item.name.toLowerCase();
        const isClearlyFemme = STRICT_FEMME.some(kw => nameLower.includes(kw.replace(/\\b/g, '')));
        if (isClearlyFemme) {
            await prisma.trendProduct.update({
                where: { id: item.id },
                data: { segment: 'femme' },
            });
            console.log(`  ♀️  Reverted to femme: "${item.name}"`);
            fixedToFemme++;
        }
    }

    // Remettre en "homme" les articles qui ont été mal déplacés vers "femme"
    const femmeItems = await prisma.trendProduct.findMany({
        where: { segment: 'femme' },
        select: { id: true, name: true },
    });

    let fixedToHomme = 0;
    for (const item of femmeItems) {
        const nameLower = item.name.toLowerCase();
        const isClearlyHomme = STRICT_HOMME.some(kw => nameLower.includes(kw));
        if (isClearlyHomme) {
            await prisma.trendProduct.update({
                where: { id: item.id },
                data: { segment: 'homme' },
            });
            console.log(`  ♂️  Reverted to homme: "${item.name}"`);
            fixedToHomme++;
        }
    }

    console.log(`\n✅ Reverted: ${fixedToFemme} back to femme, ${fixedToHomme} back to homme.`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
