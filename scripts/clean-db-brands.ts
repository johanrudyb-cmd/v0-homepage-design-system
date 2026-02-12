
import { prisma } from '../lib/prisma';
import { getProductBrand } from '../lib/brand-utils';

async function main() {
    console.log('🧹 Nettoyage des marques dans la base de données...');

    const products = await prisma.trendProduct.findMany({
        select: { id: true, name: true, sourceBrand: true, productBrand: true }
    });

    let updatedCount = 0;

    for (const p of products) {
        const cleanBrand = getProductBrand(p.name, p.sourceBrand);

        // Si le brand en DB est différent du brand "propre" calculé maintenant
        if (cleanBrand !== p.productBrand) {
            await prisma.trendProduct.update({
                where: { id: p.id },
                data: { productBrand: cleanBrand }
            });
            updatedCount++;
        }
    }

    console.log(`✅ Nettoyage terminé. ${updatedCount} produits mis à jour.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
