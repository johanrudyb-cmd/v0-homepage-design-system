import { PrismaClient } from '@prisma/client';
import { getProductBrand, cleanProductName } from './lib/brand-utils';

const p = new PrismaClient();

async function main() {
    console.log('🔧 Fixing remaining fused brand names...\n');

    // Chercher les productBrand qui ont encore du texte collé (majuscules après la marque)
    const items = await p.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        select: { id: true, name: true, productBrand: true, sourceBrand: true },
    });

    let fixed = 0;

    for (const item of items) {
        const brand = item.productBrand ?? '';
        const name = item.name ?? '';

        // Recalculer depuis le nom brut reconstitué
        const rawName = `${brand} - ${name}`;
        const newBrand = getProductBrand(rawName, item.sourceBrand);
        const newName = newBrand ? cleanProductName(rawName, newBrand) : name;

        const brandChanged = newBrand && newBrand !== brand;
        const nameChanged = newName && newName !== name && newName.length > 2;

        if (brandChanged || nameChanged) {
            await p.trendProduct.update({
                where: { id: item.id },
                data: {
                    ...(brandChanged ? { productBrand: newBrand } : {}),
                    ...(nameChanged ? { name: newName } : {}),
                },
            });
            console.log(`  ✅ "${brand}" | "${name.slice(0, 40)}"`);
            console.log(`     → "${newBrand}" | "${newName?.slice(0, 40)}"`);
            fixed++;
        }
    }

    console.log(`\n✅ Fixed ${fixed} items.`);
    await p.$disconnect();
}

main().catch(e => { console.error(e); p.$disconnect(); });
