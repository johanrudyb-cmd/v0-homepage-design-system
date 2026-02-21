import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Produits beauté/cosmétiques à exclure
const BEAUTY_KEYWORDS = [
    'exfoliant', 'exfoliante', 'crème', 'creme', 'sérum', 'serum',
    'teinte', 'blush', 'joue', 'lèvre', 'levre', 'rouge à lèvres',
    'fond de teint', 'mascara', 'eyeliner', 'eye-liner', 'fard',
    'correcteur', 'contour', 'highlighter', 'bronzer', 'autobronzant',
    'démaquillant', 'demaquillant', 'nettoyant visage', 'lotion',
    'hydratant', 'moisturizer', 'baume lèvres', 'gloss', 'lip',
    'parfum', 'eau de toilette', 'déodorant', 'deodorant',
    'shampooing', 'shampoing', 'après-shampoing', 'conditioner',
    'masque cheveux', 'masque visage', 'gommage', 'peeling',
    'vernis', 'nail', 'ongles', 'manucure',
    'skincare', 'skin care', 'soin visage', 'soin peau',
    'huile corps', 'huile visage', 'beurre corps',
];

async function main() {
    console.log('🔍 Finding beauty/cosmetic products to remove...');

    const allItems = await prisma.trendProduct.findMany({
        select: { id: true, name: true, category: true },
    });

    const toDelete: string[] = [];

    for (const item of allItems) {
        const nameLower = item.name.toLowerCase();
        const catLower = (item.category ?? '').toLowerCase();
        const isBeauty = BEAUTY_KEYWORDS.some(kw =>
            nameLower.includes(kw) || catLower.includes(kw)
        );
        if (isBeauty) {
            toDelete.push(item.id);
            console.log(`  🗑️  "${item.name}"`);
        }
    }

    if (toDelete.length === 0) {
        console.log('No beauty products found.');
        await prisma.$disconnect();
        return;
    }

    console.log(`\nDeleting ${toDelete.length} beauty/cosmetic products...`);
    const deleted = await prisma.trendProduct.deleteMany({
        where: { id: { in: toDelete } },
    });
    console.log(`✅ Deleted ${deleted.count} products.`);

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
