import { PrismaClient } from '@prisma/client';
import { getProductBrand, cleanProductName } from './lib/brand-utils';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing fused brand+model names in DB...\n');

    // Chercher les productBrand qui semblent avoir un nom de modèle collé
    // Pattern: une marque connue suivie de lettres majuscules sans espace
    const items = await prisma.trendProduct.findMany({
        select: { id: true, name: true, productBrand: true, sourceBrand: true },
    });

    let fixed = 0;

    for (const item of items) {
        const brand = item.productBrand ?? '';
        // Détecter si la marque contient des majuscules collées après un mot connu
        // ex: "Claudie PierlotTEE", "Vivienne WestwoodPERU", "MM6 Maison MargielaT"
        // Pattern: se termine par des lettres majuscules/chiffres après un mot normal
        const fusedPattern = /^(.+?)([A-Z][A-Z0-9\s]{1,20})$/.exec(brand);
        if (!fusedPattern) continue;

        // Recalculer la vraie marque depuis le nom original
        const rawName = `${item.productBrand} - ${item.name}`;
        const correctBrand = getProductBrand(rawName, item.sourceBrand);

        if (correctBrand && correctBrand !== brand) {
            await prisma.trendProduct.update({
                where: { id: item.id },
                data: { productBrand: correctBrand },
            });
            console.log(`  ✅ "${brand}" → "${correctBrand}" | article: "${item.name.slice(0, 50)}"`);
            fixed++;
        }
    }

    console.log(`\n✅ Fixed ${fixed} brand names.`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
