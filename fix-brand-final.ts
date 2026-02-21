/**
 * fix-brand-final.ts
 * Dernier passage : cas résiduels insensibles à la casse + noms encore collés dans le name
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    "Only", "Vero Moda", "Object", "Selected Femme", "Selected", "Jack & Jones", "Vila",
    "Noisy May", "Y.A.S", "Moss Copenhagen", "Scotch & Soda",
    "Pinko", "Liu Jo", "Patrizia Pepe", "Twinset", "Max Mara", "Marella",
    "Iceberg", "Blauer", "Herno", "Fabienne Chapot", "Volcom", "Burocs",
    "FAVELA", "Adidas", "Munthe", "Adolfo Dominguez",
    "Cinq à Sept", "Nümph", "Ichi", "b.young", "Naf Naf", "IRO",
    "Reiss", "Whistles", "Phase Eight", "Hobbs", "Karen Millen",
].sort((a, b) => b.length - a.length);

// Insensible à la casse
function splitBrandCI(text: string): { brand: string; rest: string } | null {
    const textLower = text.toLowerCase();
    for (const brand of KNOWN_BRANDS) {
        if (textLower.startsWith(brand.toLowerCase())) {
            const rest = text.slice(brand.length).trim();
            if (rest.length > 1) return { brand, rest };
        }
    }
    return null;
}

const GENERIC_NAMES = new Set([
    'T', 'T-', 'Veste en cuir', 'Veste mi-saison', "Veste d'hiver", 'Veste en jean', 'Veste',
    'Pullover', 'Pull', 'Sweat', 'Sweat à capuche', 'Sweatshirt', 'Hoodie',
    'Jean boyfriend', 'Jean slim', 'Jean large', 'Jean droit', 'Jean',
    'Pantalon de survêtement', 'Pantalon cargo', 'Pantalon classique', 'Pantalon',
    'T-shirt imprimé', 'T-shirt à manches longues', 'T-shirt basique', 'T-shirt',
    'Manteau classique', 'Manteau', 'Doudoune', 'Parka', 'Blouson',
    'Robe', 'Minijupe', 'Jupe', 'Chemise', 'Polo', 'Top', 'Body', 'Short',
    'Legging', 'Jogging', 'Survêtement', 'Robe en jersey', 'Blazer',
    'Veste en cuir synthétique', 'Robe courte', 'Robe longue', 'Trench',
    'Jupe trapèze', 'Jupe midi', 'Jupe longue', 'Jupe courte',
    'Pantalon large', 'Pantalon droit', 'Pantalon slim',
    'Combinaison pantalon', 'Combishort', 'Combinaison',
    'Cardigan', 'Gilet', 'Veste de costume', 'Costume',
    'Bermuda', 'Cycliste', 'Brassière', 'Crop top',
    'PANTS', 'Polo',
]);

async function main() {
    console.log('🔧 Dernier passage de nettoyage...\n');

    const all = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        select: { id: true, name: true, productBrand: true, segment: true },
    });

    let fixed = 0;
    let deleted = 0;

    for (const product of all) {
        let name = (product.name || '').trim();
        let brand = (product.productBrand || '').trim();
        let changed = false;

        // 1. Corriger le brand encore collé (insensible à la casse)
        const brandSplit = splitBrandCI(brand);
        if (brandSplit) {
            const nameIsGeneric = GENERIC_NAMES.has(name) || name.length <= 3;
            if (nameIsGeneric) {
                name = brandSplit.rest;
            }
            brand = brandSplit.brand;
            changed = true;
        }

        // 2. Corriger le name encore collé (ex: "adidas OriginalsPolo")
        const nameSplit = splitBrandCI(name);
        if (nameSplit) {
            if (!brand || brand.toLowerCase() === 'zalando') brand = nameSplit.brand;
            name = nameSplit.rest;
            changed = true;
        }

        // 3. Supprimer les noms trop courts/bizarres sans valeur (ex: "OUT - T", "T")
        const isTruncated = name.length <= 3 || /^[A-Z]{1,3}(\s*-\s*[A-Z]{1,3})?$/.test(name);
        if (isTruncated) {
            await prisma.trendProduct.delete({ where: { id: product.id } });
            deleted++;
            console.log(`🗑️  Supprimé (tronqué): brand="${brand}" name="${name}" [${product.segment}]`);
            continue;
        }

        // 4. Supprimer les génériques sans marque
        if (GENERIC_NAMES.has(name) && (!brand || brand.toLowerCase() === 'zalando')) {
            await prisma.trendProduct.delete({ where: { id: product.id } });
            deleted++;
            console.log(`🗑️  Supprimé (générique sans marque): "${name}" [${product.segment}]`);
            continue;
        }

        if (changed) {
            await prisma.trendProduct.update({
                where: { id: product.id },
                data: { name: name.trim(), productBrand: brand.trim() },
            });
            fixed++;
            console.log(`✅ [${product.segment}] brand="${brand}" | name="${name}"`);
        }
    }

    console.log(`\n📊 Résumé final :`);
    console.log(`  ✅ Corrigés : ${fixed}`);
    console.log(`  🗑️  Supprimés : ${deleted}`);

    const remaining = await prisma.trendProduct.count({ where: { sourceBrand: 'Zalando' } });
    console.log(`\n📦 Articles Zalando restants : ${remaining}`);

    // Vérification : afficher les 15 derniers
    const samples = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        take: 15,
        select: { name: true, productBrand: true, segment: true },
        orderBy: { id: 'desc' },
    });
    console.log('\n🔍 Exemples finaux :');
    samples.forEach(s => console.log(`  [${s.segment}] "${s.productBrand}" → "${s.name}"`));

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
