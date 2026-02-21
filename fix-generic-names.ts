/**
 * fix-generic-names.ts
 * Corrige les noms génériques dans la DB Zalando :
 * 1. "T" → restaure le nom complet depuis l'URL ou supprime
 * 2. Noms qui sont juste un type de vêtement (Pullover, Veste en cuir...) sans marque → supprime
 * 3. Noms tronqués où le type a été gardé au lieu du vrai nom → restaure si possible
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Types génériques qui ne sont PAS des noms de produits
const PURE_GENERIC_NAMES = new Set([
    'T', 'T-', // Tronqués
    'Veste en cuir', 'Veste mi-saison', "Veste d'hiver", 'Veste en jean', 'Veste',
    'Pullover', 'Pull', 'Sweat', 'Sweat à capuche', 'Sweatshirt', 'Hoodie',
    'Jean boyfriend', 'Jean slim', 'Jean large', 'Jean droit', 'Jean',
    'Pantalon de survêtement', 'Pantalon cargo', 'Pantalon classique', 'Pantalon',
    'T-shirt imprimé', 'T-shirt à manches longues', 'T-shirt basique', 'T-shirt',
    'Manteau classique', 'Manteau', 'Doudoune', 'Parka', 'Blouson',
    'Robe', 'Minijupe', 'Jupe', 'Combinaison', 'Combishort',
    'Chemise', 'Polo', 'Top', 'Body', 'Débardeur',
    'Short', 'Bermuda', 'Legging', 'Jogging', 'Survêtement',
    'Veste en cuir synthétique', 'Veste en similicuir',
]);

async function main() {
    console.log('🔍 Analyse des noms génériques dans la DB Zalando...\n');

    const all = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        select: { id: true, name: true, productBrand: true, category: true, segment: true, sourceUrl: true },
    });

    console.log(`📦 Total articles Zalando: ${all.length}`);

    let deleted = 0;
    let kept = 0;

    for (const product of all) {
        const name = (product.name || '').trim();
        const brand = (product.productBrand || '').trim();

        // Cas 1 : Nom tronqué "T" ou très court sans sens
        const isTruncated = name.length <= 2 || name === 'T-';

        // Cas 2 : Nom purement générique (type de vêtement sans nom propre)
        const isGeneric = PURE_GENERIC_NAMES.has(name);

        // Cas 3 : Nom générique même avec une majuscule différente
        const isGenericCI = Array.from(PURE_GENERIC_NAMES).some(g =>
            g.toLowerCase() === name.toLowerCase()
        );

        if (isTruncated || isGeneric || isGenericCI) {
            // Si on a une marque connue, on peut garder avec un nom minimal
            // Sinon on supprime car l'article n'a aucune valeur informative
            if (!brand || brand.toLowerCase() === 'zalando') {
                await prisma.trendProduct.delete({ where: { id: product.id } });
                deleted++;
                console.log(`🗑️  Supprimé (générique sans marque): "${name}" [${product.segment}]`);
            } else {
                // On a une marque mais le nom est générique → garder mais logger
                console.log(`⚠️  Générique avec marque (gardé): "${name}" by "${brand}" [${product.segment}]`);
                kept++;
            }
        }
    }

    console.log('\n📊 Résumé :');
    console.log(`  🗑️  Supprimés : ${deleted}`);
    console.log(`  ⚠️  Génériques avec marque (gardés) : ${kept}`);
    console.log(`  ✅ Articles propres : ${all.length - deleted - kept}`);

    // Stats finales
    const remaining = await prisma.trendProduct.count({ where: { sourceBrand: 'Zalando' } });
    console.log(`\n📦 Articles Zalando restants : ${remaining}`);

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
