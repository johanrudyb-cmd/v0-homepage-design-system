import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing broken "shirt" names (missing T-)...\n');

    // Chercher les articles dont le nom commence par "shirt" (T- manquant)
    const broken = await prisma.trendProduct.findMany({
        where: {
            OR: [
                { name: { startsWith: 'shirt ' } },
                { name: { contains: ' shirt à' } },
                { name: { contains: ' shirt oversize' } },
                { name: { contains: ' shirt basique' } },
                { name: { contains: ' shirt col' } },
                { name: { contains: ' shirt imprimé' } },
                { name: { contains: ' shirt uni' } },
                { name: { contains: ' shirt manches' } },
            ]
        },
        select: { id: true, name: true, productBrand: true },
    });

    console.log(`Found ${broken.length} items with broken "shirt" name.`);

    // Aussi chercher les marques avec "T" collé à la fin (ex: "DieselT")
    const brokenBrand = await prisma.trendProduct.findMany({
        where: {
            productBrand: { endsWith: 'T' },
            name: { startsWith: 'shirt' },
        },
        select: { id: true, name: true, productBrand: true },
    });

    console.log(`Found ${brokenBrand.length} items with brand ending in T + name starting with shirt.`);

    let fixed = 0;
    const allBroken = [...broken, ...brokenBrand.filter(b => !broken.find(x => x.id === b.id))];

    for (const item of allBroken) {
        let newName = item.name;
        let newBrand = item.productBrand;

        // Si la marque se termine par "T" et le nom commence par "shirt"
        if (item.productBrand?.endsWith('T') && item.name.startsWith('shirt')) {
            newBrand = item.productBrand.slice(0, -1); // Enlever le T de la marque
            newName = 'T-' + item.name; // Ajouter T- au nom
        } else if (item.name.startsWith('shirt ')) {
            newName = 'T-' + item.name;
        }

        if (newName !== item.name || newBrand !== item.productBrand) {
            await prisma.trendProduct.update({
                where: { id: item.id },
                data: { name: newName, productBrand: newBrand },
            });
            console.log(`  ✅ "${item.name}" [${item.productBrand}] → "${newName}" [${newBrand}]`);
            fixed++;
        }
    }

    console.log(`\n✅ Fixed ${fixed} items.`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
