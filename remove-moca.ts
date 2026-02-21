
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Recherche de "Moca" et variantes...');

    // Recherche large pour trouver le coupable
    const products = await prisma.trendProduct.findMany({
        where: {
            OR: [
                { name: { contains: 'Moca', mode: 'insensitive' } },
                { name: { contains: 'ins', mode: 'insensitive' } } // Trop large mais filtrons après
            ]
        },
        select: { id: true, name: true, category: true, productBrand: true }
    });

    // Filtrer manuellement pour trouver "Moca ins" ou proches
    const targets = products.filter(p =>
        p.name.toLowerCase().includes('moca ins') ||
        p.name.toLowerCase().includes('mocassin') ||
        (p.name.toLowerCase().includes('daim') && p.name.toLowerCase().includes('portugal')) // Le daim est souvent pour les chaussures
    );

    console.log(`Trouvé ${targets.length} produits suspects :`);
    targets.forEach(p => console.log(`- [${p.id}] ${p.name} (${p.category}) - ${p.productBrand}`));

    if (targets.length > 0) {
        const ids = targets.map(p => p.id);
        const deleted = await prisma.trendProduct.deleteMany({
            where: { id: { in: ids } }
        });
        console.log(`🗑️ Supprimé ${deleted.count} produits.`);
    }

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
