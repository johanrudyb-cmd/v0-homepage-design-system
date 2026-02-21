import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Corrections d'encodage "ss" manquant (même bug que chau ure / moca in)
const ENCODING_FIXES: Array<{ broken: RegExp; fixed: string }> = [
    { broken: /\bt-hirt/gi, fixed: 't-shirt' },
    { broken: /\bT-hirt/g, fixed: 'T-shirt' },
    { broken: /\bT-Hirt/g, fixed: 'T-Shirt' },
    { broken: /\bhirt\b/gi, fixed: 'shirt' },   // "hirt" seul = "shirt"
];

async function main() {
    console.log('🔧 Fixing encoding bugs in product names...');

    // Récupérer tous les produits avec "hirt" dans le nom
    const broken = await prisma.trendProduct.findMany({
        where: { name: { contains: 'hirt' } },
        select: { id: true, name: true },
    });

    console.log(`Found ${broken.length} items with encoding issue.`);

    let fixed = 0;
    for (const item of broken) {
        let newName = item.name;
        for (const fix of ENCODING_FIXES) {
            newName = newName.replace(fix.broken, fix.fixed);
        }
        if (newName !== item.name) {
            await prisma.trendProduct.update({
                where: { id: item.id },
                data: { name: newName },
            });
            console.log(`  ✅ "${item.name}" → "${newName}"`);
            fixed++;
        }
    }

    console.log(`\n✅ Fixed ${fixed} items.`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
