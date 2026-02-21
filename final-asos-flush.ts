/**
 * FINAL CLEANUP SCRIPT:
 * 1. Removes products with "MIX MATCH", "MIX & MATCH"
 * 2. Removes products with color slashes (e.g. "Bleu/Blanc")
 * 3. Removes products where brand is "DESIGN", "COLLUSION", etc.
 * 4. Ensures brand is correctly detected for remaining products
 */
import { prisma } from './lib/prisma';
import { getProductBrand, cleanProductName } from './lib/brand-utils';

const COLOR_BLOCK = ['noir', 'blanc', 'bleu', 'rouge', 'vert', 'gris', 'beige', 'rose', 'marron', 'orange', 'violet', 'jaune', 'kaki', 'indigo', 'navy', 'black', 'white', 'grey', 'gray'];

async function main() {
    console.log('🧹 Nettoyage Final des Segments...');

    const products = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Global Partner' } // Focus on ASOS
    });

    let deleted = 0;
    let updated = 0;

    for (const p of products) {
        const name = (p.name || '').trim();
        const brand = (p.productBrand || '').trim().toLowerCase();
        const nameLower = name.toLowerCase();

        // 1. MIX MATCH
        if (nameLower.includes('mix match') || nameLower.includes('mix & match')) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            deleted++;
            continue;
        }

        // 2. Couleurs avec slashes
        const isColorOnly = nameLower.split(/[\/\s]+/).every(part => COLOR_BLOCK.includes(part));
        if (isColorOnly && nameLower.length > 0) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            deleted++;
            continue;
        }

        // 3. Marques ASOS
        if (brand.includes('design') || brand.includes('collusion') || brand.includes('4505') || brand.includes('reclaimed')) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            deleted++;
            continue;
        }

        // 4. Brand == Name
        if (brand === nameLower && nameLower.length > 3) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            deleted++;
            continue;
        }

        // 5. Detection Brand
        const detected = getProductBrand(name, p.sourceBrand);
        if (detected && detected !== p.productBrand) {
            await prisma.trendProduct.update({
                where: { id: p.id },
                data: {
                    productBrand: detected,
                    name: cleanProductName(name, detected)
                }
            });
            updated++;
        }
    }

    console.log(`\n✅ Adieu les déchets : ${deleted} supprimés, ${updated} mis à jour.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
