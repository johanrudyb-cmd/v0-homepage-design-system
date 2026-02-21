import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mots-clés clairement féminins dans un nom de produit
const FEMME_SIGNALS = [
    'jupe', 'robe', 'bralette', 'soutien-gorge', 'bustier', 'bikini',
    'culotte', 'shorty', 'minijupe', 'maternité', 'grossesse',
    'crop top', 'blouse', 'tunique', 'legging femme', 'collant',
    'body femme', 'nuisette', 'combinaison femme',
];

async function main() {
    // Récupérer les 50 premiers articles homme 25-34 (ce que l'API retourne)
    const hommeItems = await prisma.trendProduct.findMany({
        where: {
            segment: 'homme',
            NOT: { trendLabel: 'ASOS-18-24' },
        },
        orderBy: { trendScore: 'desc' },
        take: 50,
        select: { id: true, name: true, productBrand: true, sourceUrl: true, trendScore: true },
    });

    console.log(`=== TOP 50 HOMME 25-34 ===`);
    console.log(`Total: ${hommeItems.length}\n`);

    const suspicious: typeof hommeItems = [];

    for (const item of hommeItems) {
        const nameLower = item.name.toLowerCase();
        const isSuspect = FEMME_SIGNALS.some(kw => nameLower.includes(kw));
        if (isSuspect) {
            suspicious.push(item);
            console.log(`⚠️  SUSPECT: "${item.name}" | URL: ${item.sourceUrl?.slice(0, 80)}`);
        }
    }

    console.log(`\n${suspicious.length} articles suspects sur 50.`);

    // Aussi vérifier les sourceUrl des articles homme
    console.log('\n=== SOURCES DES ARTICLES HOMME 25-34 ===');
    const urlPatterns: Record<string, number> = {};
    for (const item of hommeItems) {
        const url = item.sourceUrl ?? 'null';
        const key = url.includes('/femme/') ? 'URL contient /femme/' :
            url.includes('/homme/') ? 'URL contient /homme/' :
                url.includes('gender=WOMEN') ? 'gender=WOMEN' :
                    url.includes('gender=MEN') ? 'gender=MEN' :
                        url.includes('zalando') ? 'zalando (autre)' :
                            url.includes('asos') ? 'asos (autre)' : 'autre';
        urlPatterns[key] = (urlPatterns[key] ?? 0) + 1;
    }
    Object.entries(urlPatterns).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
