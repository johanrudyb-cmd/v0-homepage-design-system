import { PrismaClient } from '@prisma/client';
import { getProductBrand, cleanProductName } from './lib/brand-utils';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Re-cleaning Zalando product names with new logic...\n');

    // Les articles Zalando ont souvent un nom brut stocké dans description
    // On va tester sur un échantillon d'abord
    const items = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        select: { id: true, name: true, productBrand: true, description: true },
        take: 20,
    });

    console.log('=== TEST AVANT/APRÈS ===');
    for (const item of items) {
        // Simuler le nom brut original (marque + nom actuel)
        const rawName = item.productBrand ? `${item.productBrand}${item.name}` : item.name;
        const brand = item.productBrand ?? '';
        const newName = cleanProductName(rawName, brand);
        if (newName !== item.name) {
            console.log(`  AVANT: "${item.name}"`);
            console.log(`  APRÈS: "${newName}"`);
            console.log(`  Marque: "${brand}"`);
            console.log();
        }
    }

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
