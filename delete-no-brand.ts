/**
 * Nettoyage radical : Supprime tous les produits sans marque externe identifiée.
 * On ne veut que du Nike, Adidas, etc. Pas de "Elite" ou de marque ASOS.
 */
import { prisma } from './lib/prisma';

async function main() {
    console.log('🧹 Nettoyage radical des articles sans marque externe...');

    // 1. Supprimer tous les articles dont la marque est "Elite"
    const deleteElite = await prisma.trendProduct.deleteMany({
        where: {
            productBrand: 'Elite'
        }
    });
    console.log(`  🗑️  ${deleteElite.count} articles "Elite" supprimés.`);

    // 2. Supprimer les articles ASOS dont la marque n'a pas été identifiée
    // (souvent productBrand est null ou égal au nom du produit)
    const products = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'ASOS' },
        select: { id: true, name: true, productBrand: true }
    });

    let deletedAsos = 0;
    for (const p of products) {
        // Si la marque est vide, ou si c'est "ASOS", ou si la marque = le nom
        if (!p.productBrand || p.productBrand.toLowerCase().includes('asos') || p.productBrand === p.name) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            deletedAsos++;
        }
    }
    console.log(`  🗑️  ${deletedAsos} articles ASOS re-brandés ou sans marque supprimés.`);

    console.log('\n✅ Base de données propre.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
