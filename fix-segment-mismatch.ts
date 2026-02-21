import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mots-clés qui indiquent clairement un article FEMME
const FEMME_KEYWORDS = [
    'femme', 'woman', 'women', 'fille', 'girl', 'robe', 'jupe', 'legging',
    'bralette', 'soutien-gorge', 'bustier', 'crop top', 'blouse', 'tunique',
    'maternité', 'grossesse', 'bikini', 'maillot de bain femme',
    'culotte', 'shorty', 'taille haute', 'floral', 'fleuri',
];

// Mots-clés qui indiquent clairement un article HOMME
const HOMME_KEYWORDS = [
    'homme', 'man', 'men', 'garçon', 'boy', 'cargo', 'boxer', 'slip homme',
    'costume homme', 'cravate', 'chemise homme',
];

async function main() {
    console.log('🔍 Auditing segment mismatches...');

    // Chercher des articles "homme" avec des mots-clés femme dans le nom
    const hommeItems = await prisma.trendProduct.findMany({
        where: { segment: 'homme' },
        select: { id: true, name: true, segment: true, productBrand: true },
    });

    const femmeItems = await prisma.trendProduct.findMany({
        where: { segment: 'femme' },
        select: { id: true, name: true, segment: true, productBrand: true },
    });

    let fixedToFemme = 0;
    let fixedToHomme = 0;

    // Corriger les articles "homme" qui semblent être pour femme
    for (const item of hommeItems) {
        const nameLower = item.name.toLowerCase();
        const isFemme = FEMME_KEYWORDS.some(kw => nameLower.includes(kw));
        if (isFemme) {
            await prisma.trendProduct.update({
                where: { id: item.id },
                data: { segment: 'femme' },
            });
            console.log(`  ♀️  [homme→femme] "${item.name}"`);
            fixedToFemme++;
        }
    }

    // Corriger les articles "femme" qui semblent être pour homme
    for (const item of femmeItems) {
        const nameLower = item.name.toLowerCase();
        const isHomme = HOMME_KEYWORDS.some(kw => nameLower.includes(kw));
        if (isHomme) {
            await prisma.trendProduct.update({
                where: { id: item.id },
                data: { segment: 'homme' },
            });
            console.log(`  ♂️  [femme→homme] "${item.name}"`);
            fixedToHomme++;
        }
    }

    console.log(`\n✅ Fixed: ${fixedToFemme} moved to femme, ${fixedToHomme} moved to homme.`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
