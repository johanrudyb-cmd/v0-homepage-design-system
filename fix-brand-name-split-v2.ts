/**
 * fix-brand-name-split-v2.ts
 * Second passage plus agressif pour les marques encore collées
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
    "FAVELA", "Adidas", "Munthe", "MUNTHE", "Adolfo Dominguez", "ADOLFO DOMINGUEZ",
    "Cinq à Sept", "Nümph", "Ichi", "b.young", "Naf Naf", "Maje", "IRO",
    "Zadig & Voltaire", "Claudie Pierlot", "Sandro", "The Kooples",
    "Reiss", "Ted Baker", "AllSaints", "Whistles", "Phase Eight",
    "Hobbs", "LK Bennett", "Karen Millen", "Coast", "Monsoon",
    "Warehouse", "Oasis", "Miss Selfridge", "Dorothy Perkins",
    "River Island", "Topshop", "Topman", "ASOS", "Zara",
].sort((a, b) => b.length - a.length);

function splitBrandAndName(combined: string): { brand: string; realName: string } | null {
    const combinedLower = combined.toLowerCase();
    for (const brand of KNOWN_BRANDS) {
        const brandLower = brand.toLowerCase();
        if (combinedLower.startsWith(brandLower)) {
            const rest = combined.slice(brand.length).trim();
            if (rest.length > 1 && !/^\d+$/.test(rest)) {
                return { brand, realName: rest };
            }
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
    'Veste en cuir synthétique', 'Robe courte', 'Robe longue',
]);

async function main() {
    console.log('🔧 Second passage de correction...\n');

    const all = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        select: { id: true, name: true, productBrand: true, segment: true },
    });

    let fixed = 0;
    let deleted = 0;

    for (const product of all) {
        const currentName = (product.name || '').trim();
        const currentBrand = (product.productBrand || '').trim();
        let newName = currentName;
        let newBrand = currentBrand;
        let changed = false;

        // Vérifier si le productBrand est encore collé
        const brandSplit = splitBrandAndName(currentBrand);
        if (brandSplit) {
            newBrand = brandSplit.brand;
            const nameIsGeneric = GENERIC_NAMES.has(currentName) || currentName.length <= 2;
            if (nameIsGeneric) {
                newName = brandSplit.realName;
            }
            changed = true;
        }

        // Vérifier si le nom lui-même contient encore la marque collée
        if (!changed || GENERIC_NAMES.has(newName) || newName.length <= 2) {
            const nameSplit = splitBrandAndName(newName);
            if (nameSplit) {
                if (!newBrand || newBrand === currentBrand) newBrand = nameSplit.brand;
                newName = nameSplit.realName;
                changed = true;
            }
        }

        // Cas "OUT - T" : nom bizarre tronqué → supprimer si sans marque valide
        if (newName.length <= 5 && /^[A-Z\s-]+$/.test(newName) && newName.split(' ').length <= 2) {
            if (!newBrand || newBrand.toLowerCase() === 'zalando') {
                await prisma.trendProduct.delete({ where: { id: product.id } });
                deleted++;
                console.log(`🗑️  Supprimé (nom tronqué bizarre): "${currentName}" [${product.segment}]`);
                continue;
            }
        }

        if (changed) {
            await prisma.trendProduct.update({
                where: { id: product.id },
                data: { name: newName.trim(), productBrand: newBrand.trim() },
            });
            fixed++;
            if (fixed <= 20) {
                console.log(`✅ [${product.segment}] "${currentBrand}" / "${currentName}" → brand="${newBrand}" / name="${newName}"`);
            }
        }
    }

    console.log(`\n📊 Résumé :`);
    console.log(`  ✅ Corrigés : ${fixed}`);
    console.log(`  🗑️  Supprimés : ${deleted}`);

    const samples = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        take: 10,
        select: { name: true, productBrand: true, segment: true },
        orderBy: { id: 'desc' },
    });
    console.log('\n🔍 Exemples après second passage :');
    samples.forEach(s => console.log(`  [${s.segment}] brand="${s.productBrand}" | name="${s.name}"`));

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
