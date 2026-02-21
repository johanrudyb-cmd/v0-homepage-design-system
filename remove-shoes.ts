
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mots-clés identifiant des chaussures
const SHOE_KEYWORDS = [
    'chaussure', 'mocassin', 'botte', 'boot', 'basket', 'sneaker', 'sandale',
    'mule', 'talon', 'escarpin', 'claquette', 'tong', 'sabot', 'derbie', 'richelieu',
    'loafer', 'trainer', 'ballerine', 'espadrille', 'slides', 'flip flop',
    'chausson', 'pantoufle'
];

async function main() {
    console.log('👠 Suppression des chaussures de la base de données...');

    // On construit une condition OR avec contains pour chaque mot-clé
    // On filtre sur le NOM ou la CATEGORIE
    const conditions = SHOE_KEYWORDS.map(k => ({
        name: { contains: k, mode: 'insensitive' as const }
    }));

    // On ajoute aussi les catégories si elles existent (inférées)
    const categoryConditions = [
        { category: { equals: 'Chaussures', mode: 'insensitive' as const } },
        { category: { equals: 'Shoes', mode: 'insensitive' as const } }
    ];

    const whereClause = {
        OR: [...conditions, ...categoryConditions]
    };

    // Compter avant suppression
    const count = await prisma.trendProduct.count({ where: whereClause });
    console.log(`Trouvé ${count} produits correspondant à des chaussures.`);

    if (count > 0) {
        const deleted = await prisma.trendProduct.deleteMany({
            where: whereClause
        });
        console.log(`✅ Supprimé ${deleted.count} chaussures.`);
    } else {
        console.log('Aucune chaussure trouvée.');
    }

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
