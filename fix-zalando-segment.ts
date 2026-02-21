import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mots-clés STRICTEMENT féminins dans un nom de produit (jamais pour homme)
const STRICT_FEMME_IN_NAME = [
    'jupe', 'robe ', ' robe', 'bralette', 'soutien-gorge', 'bustier',
    'bikini', 'culotte', 'shorty', 'minijupe', 'maternité', 'grossesse',
    'crop top', 'blouse', 'tunique', 'legging', 'collant', 'body ',
    'nuisette', 'combinaison', 'chemisier', 'corsage', 'débardeur femme',
    'top femme', 'pull femme', 'manteau femme', 'veste femme',
];

// Mots-clés STRICTEMENT masculins dans un nom de produit (jamais pour femme)
const STRICT_HOMME_IN_NAME = [
    'boxer', 'slip homme', 'costume homme', 'cravate',
    'pantalon homme', 'chemise homme', 'veste homme', 'pull homme',
];

async function main() {
    console.log('🔧 Fixing Zalando segment mismatches by product name...\n');

    // Articles segment=homme avec mots-clés féminins dans le nom
    const hommeItems = await prisma.trendProduct.findMany({
        where: { segment: 'homme', sourceBrand: 'Zalando' },
        select: { id: true, name: true, sourceUrl: true },
    });

    let toFemme = 0;
    for (const item of hommeItems) {
        const n = item.name.toLowerCase();
        if (STRICT_FEMME_IN_NAME.some(kw => n.includes(kw))) {
            await prisma.trendProduct.update({ where: { id: item.id }, data: { segment: 'femme' } });
            console.log(`  ♀️  [homme→femme] "${item.name}"`);
            toFemme++;
        }
    }

    // Articles segment=femme avec mots-clés masculins dans le nom
    const femmeItems = await prisma.trendProduct.findMany({
        where: { segment: 'femme', sourceBrand: 'Zalando' },
        select: { id: true, name: true, sourceUrl: true },
    });

    let toHomme = 0;
    for (const item of femmeItems) {
        const n = item.name.toLowerCase();
        if (STRICT_HOMME_IN_NAME.some(kw => n.includes(kw))) {
            await prisma.trendProduct.update({ where: { id: item.id }, data: { segment: 'homme' } });
            console.log(`  ♂️  [femme→homme] "${item.name}"`);
            toHomme++;
        }
    }

    console.log(`\n✅ Fixed: ${toFemme} → femme, ${toHomme} → homme.`);

    // Maintenant ajouter les mots-clés beauté à COMMON_EXCLUDE pour éviter ça à l'avenir
    console.log('\n📊 Remaining Zalando homme items:', await prisma.trendProduct.count({ where: { segment: 'homme', sourceBrand: 'Zalando' } }));
    console.log('📊 Remaining Zalando femme items:', await prisma.trendProduct.count({ where: { segment: 'femme', sourceBrand: 'Zalando' } }));

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
