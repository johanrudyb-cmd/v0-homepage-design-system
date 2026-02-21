/**
 * fix-brand-name-split.ts
 * Corrige les articles Zalando où le productBrand contient la marque + le nom collés
 * Ex: productBrand = "AllSaintsNATES LEATHER JACKET", name = "Veste en cuir"
 * → productBrand = "AllSaints", name = "NATES LEATHER JACKET"
 * 
 * Ex: productBrand = "Levi's®ORIGINAL TEE", name = "T"
 * → productBrand = "Levi's®", name = "ORIGINAL TEE"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Marques connues triées par longueur décroissante
const KNOWN_BRANDS = [
    "Atelier de roupa", "Don't Waste Culture", "Baum und Pferdgarten",
    "MM6 Maison Margiela", "Maison Margiela", "Han Kjøbenhavn",
    "adidas Originals", "Polo Ralph Lauren", "Tommy Hilfiger", "Tommy Jeans",
    "Karl Lagerfeld", "Emporio Armani", "Weekend Max Mara",
    "Alexander McQueen", "Alpha Industries", "Bottega Veneta", "Calvin Klein",
    "Canada Goose", "Dolce & Gabbana", "Massimo Dutti", "New Balance",
    "Ralph Lauren", "Saint Laurent", "Stone Island", "The North Face",
    "Under Armour", "Zadig & Voltaire", "Acne Studios", "Axel Arigato",
    "CP Company", "Fred Perry", "Heron Preston", "Isabel Marant",
    "Palm Angels", "Pull & Bear", "Stradivarius", "Ted Baker",
    "Timberland", "AllSaints", "Arc'teryx", "Carhartt WIP", "Carhartt",
    "Ba&sh", "Balenciaga", "Barbour", "Bershka", "Champion", "Columbia",
    "Converse", "Diesel", "Ellesse", "Ferragamo", "Givenchy", "Gant",
    "Gucci", "Hackett", "Hugo Boss", "Jacquemus", "Kappa", "Kenzo",
    "Lacoste", "Levi's®", "Levi's", "Levis", "Loewe", "Maje", "Mango",
    "Miu Miu", "Moncler", "Moschino", "Napapijri", "Nike", "Off-White",
    "Patagonia", "Paul Smith", "Prada", "Puma", "Reebok", "Reiss",
    "Rick Owens", "Sandro", "Schott", "Supreme", "Stüssy", "The Kooples",
    "Uniqlo", "Valentino", "Vans", "Versace", "Veja", "Celine", "Dior",
    "Fendi", "Fila", "Gap", "A.P.C.", "Ami", "Sacai", "Dickies", "Guess",
    "Dr. Martens", "Superdry", "Burberry", "Armani", "Claudie Pierlot",
    "Sézane", "Weekday", "Les Deux", "Elisabetta Franchi", "Umbro",
    "Jaded London", "Vivienne Westwood", "Marine Serre", "Rotate", "Ganni",
    "Stine Goya", "Remain", "Samsøe Samsøe", "Gestuz", "Envii", "Pieces",
    "Only", "Vero Moda", "Object", "Selected", "Jack & Jones", "Vila",
    "Noisy May", "Y.A.S", "Moss Copenhagen", "Scotch & Soda",
    "Pinko", "Liu Jo", "Patrizia Pepe", "Twinset", "Max Mara", "Marella",
    "Iceberg", "Blauer", "Herno", "Fabienne Chapot", "Volcom", "Burocs",
    "FAVELA", "Adidas",
].sort((a, b) => b.length - a.length);

/**
 * Extrait la marque et le vrai nom depuis un productBrand collé
 * Ex: "AllSaintsNATES LEATHER JACKET" → { brand: "AllSaints", realName: "NATES LEATHER JACKET" }
 */
function splitBrandAndName(combined: string): { brand: string; realName: string } | null {
    const combinedLower = combined.toLowerCase();

    for (const brand of KNOWN_BRANDS) {
        const brandLower = brand.toLowerCase();
        if (combinedLower.startsWith(brandLower)) {
            const rest = combined.slice(brand.length).trim();
            // Le reste doit être un vrai nom (pas vide, pas juste un chiffre)
            if (rest.length > 1 && !/^\d+$/.test(rest)) {
                return { brand, realName: rest };
            }
        }
    }
    return null;
}

// Types génériques qui ne sont pas des noms propres
const GENERIC_NAMES = new Set([
    'T', 'T-', 'Veste en cuir', 'Veste mi-saison', "Veste d'hiver", 'Veste en jean', 'Veste',
    'Pullover', 'Pull', 'Sweat', 'Sweat à capuche', 'Sweatshirt', 'Hoodie',
    'Jean boyfriend', 'Jean slim', 'Jean large', 'Jean droit', 'Jean',
    'Pantalon de survêtement', 'Pantalon cargo', 'Pantalon classique', 'Pantalon',
    'T-shirt imprimé', 'T-shirt à manches longues', 'T-shirt basique', 'T-shirt',
    'Manteau classique', 'Manteau', 'Doudoune', 'Parka', 'Blouson',
    'Robe', 'Minijupe', 'Jupe', 'Chemise', 'Polo', 'Top', 'Body', 'Short',
    'Legging', 'Jogging', 'Survêtement', 'Veste en cuir synthétique',
]);

async function main() {
    console.log('🔧 Correction des productBrand collés au nom...\n');

    const all = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        select: { id: true, name: true, productBrand: true, category: true, segment: true },
    });

    console.log(`📦 Total articles Zalando: ${all.length}`);

    let fixed = 0;
    let deleted = 0;
    let unchanged = 0;

    for (const product of all) {
        const currentName = (product.name || '').trim();
        const currentBrand = (product.productBrand || '').trim();

        // Vérifier si le productBrand contient la marque + le nom collés
        const split = splitBrandAndName(currentBrand);

        if (split) {
            const { brand, realName } = split;
            const nameIsGeneric = GENERIC_NAMES.has(currentName) || currentName.length <= 2;

            if (nameIsGeneric) {
                // Le vrai nom est dans le productBrand, le name actuel est générique
                // → Utiliser realName comme nom, brand comme marque
                await prisma.trendProduct.update({
                    where: { id: product.id },
                    data: {
                        name: realName,
                        productBrand: brand,
                    },
                });
                fixed++;
                console.log(`✅ Corrigé: brand="${currentBrand}", name="${currentName}" → brand="${brand}", name="${realName}" [${product.segment}]`);
            } else {
                // Le nom est déjà bon, juste corriger la marque
                await prisma.trendProduct.update({
                    where: { id: product.id },
                    data: { productBrand: brand },
                });
                fixed++;
                console.log(`✅ Marque corrigée: "${currentBrand}" → "${brand}" (name="${currentName}") [${product.segment}]`);
            }
        } else {
            // Pas de marque collée détectée
            // Vérifier quand même si le nom est générique sans marque → supprimer
            const nameIsGeneric = GENERIC_NAMES.has(currentName) || currentName.length <= 2;
            const brandIsEmpty = !currentBrand || currentBrand.toLowerCase() === 'zalando';

            if (nameIsGeneric && brandIsEmpty) {
                await prisma.trendProduct.delete({ where: { id: product.id } });
                deleted++;
                console.log(`🗑️  Supprimé (générique sans marque): "${currentName}" [${product.segment}]`);
            } else {
                unchanged++;
            }
        }
    }

    console.log('\n📊 Résumé final :');
    console.log(`  ✅ Articles corrigés : ${fixed}`);
    console.log(`  🗑️  Articles supprimés : ${deleted}`);
    console.log(`  ⏭️  Articles inchangés : ${unchanged}`);

    const remaining = await prisma.trendProduct.count({ where: { sourceBrand: 'Zalando' } });
    console.log(`\n📦 Articles Zalando restants : ${remaining}`);

    // Vérification finale : afficher quelques exemples propres
    const samples = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        take: 8,
        select: { name: true, productBrand: true, segment: true },
        orderBy: { id: 'desc' },
    });
    console.log('\n🔍 Exemples après correction :');
    samples.forEach(s => console.log(`  [${s.segment}] brand="${s.productBrand}" | name="${s.name}"`));

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
