import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Voir un échantillon de noms en base pour différentes sources
    console.log('=== ÉCHANTILLON NOMS EN BASE ===\n');

    const sources = ['Zalando', 'Global Partner'];

    for (const src of sources) {
        const items = await prisma.trendProduct.findMany({
            where: { sourceBrand: src },
            orderBy: { trendScore: 'desc' },
            take: 8,
            select: { name: true, productBrand: true, sourceUrl: true },
        });
        console.log(`--- ${src} ---`);
        items.forEach(i => console.log(`  nom: "${i.name}" | marque: "${i.productBrand}"`));
        console.log();
    }

    // Vérifier si le schéma a un champ pour le nom original
    const sample = await prisma.trendProduct.findFirst({
        select: {
            id: true,
            name: true,
            description: true,
            articleNumber: true,
            style: true,
        }
    });
    console.log('=== CHAMPS DISPONIBLES SUR UN ARTICLE ===');
    console.log(JSON.stringify(sample, null, 2));

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
