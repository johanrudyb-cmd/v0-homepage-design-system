/**
 * fix-zalando-names.ts
 * Nettoie les noms des articles Zalando dans la DB :
 * 1. Sépare la marque collée au nom (ex: "WeekdaySweat à capuche" → brand: "Weekday", name: "Sweat à capuche")
 * 2. Sépare le type de vêtement du nom (ex: "LINEAR HERITAGE HALF ZIP - Sweatshirt" → name: "LINEAR HERITAGE HALF ZIP", category: "Sweatshirt")
 * 3. Supprime les articles sans nom réel (juste un type générique sans marque)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Toutes les marques connues, triées par longueur décroissante pour matcher en premier les plus longues
const KNOWN_BRANDS = [
    'Alexander McQueen', 'Alpha Industries', 'Bottega Veneta', 'Calvin Klein', 'Canada Goose',
    'Dolce & Gabbana', 'Massimo Dutti', 'New Balance', 'Ralph Lauren', 'Saint Laurent',
    'Stone Island', 'The North Face', 'Tommy Hilfiger', 'Under Armour', 'Zadig & Voltaire',
    'Acne Studios', 'Axel Arigato', 'Birkenstock', 'CP Company', 'Fred Perry', 'Heron Preston',
    'Isabel Marant', 'North Face', 'Palm Angels', 'Pull & Bear', 'Stradivarius', 'Ted Baker',
    'Timberland', 'adidas Originals', 'Adidas', 'AllSaints', 'Arc\'teryx', 'Asics', 'Autry',
    'Ba&sh', 'Balenciaga', 'Barbour', 'Bershka', 'Champion', 'Columbia', 'Converse', 'Diesel',
    'Ellesse', 'Ferragamo', 'Givenchy', 'Gant', 'Gucci', 'Hackett', 'Hugo Boss', 'Jacquemus',
    'Jordan', 'Kappa', 'Kenzo', 'Lacoste', 'Levi\'s®', 'Levi\'s', 'Levis', 'Loewe', 'Maje',
    'Mango', 'Miu Miu', 'Moncler', 'Moschino', 'Napapijri', 'Nike', 'Off-White', 'Patagonia',
    'Paul Smith', 'Prada', 'Puma', 'Reebok', 'Reiss', 'Rick Owens', 'Sandro', 'Schott',
    'Supreme', 'Stüssy', 'The Kooples', 'Uniqlo', 'Valentino', 'Vans', 'Versace', 'Veja',
    'Celine', 'Dior', 'Fendi', 'Fila', 'Gap', 'Iro', 'A.P.C.', 'Ami', 'Sacai', 'Carhartt',
    'Dickies', 'Guess', 'Dr. Martens', 'Superdry', 'Burberry', 'Armani', 'Claudie Pierlot',
    'Sézane', 'Sezane', 'Rouje', 'Musier', 'Sessun', 'Des Petits Hauts', 'Vanessa Bruno',
    'Gerard Darel', 'Gérard Darel', 'Comptoir des Cotonniers', 'Petit Bateau', 'Soeur',
    'Weekday', 'Les Deux', 'Han Kjøbenhavn', 'Elisabetta Franchi', 'MM6 Maison Margiela',
    'Maison Margiela', 'Umbro', 'Jaded London', 'Vivienne Westwood', 'Marine Serre', 'By Far',
    'Rotate', 'Ganni', 'Stine Goya', 'Remain', 'Samsøe Samsøe', 'Gestuz', 'Baum und Pferdgarten',
    'Envii', 'Pieces', 'Only', 'Vero Moda', 'Object', 'Selected', 'Jack & Jones', 'Vila',
    'Name It', 'Noisy May', 'Y.A.S', 'Moss Copenhagen', 'Nümph', 'Ichi', 'b.young',
    'Scotch & Soda', 'Tommy Jeans', 'Polo Ralph Lauren', 'Emporio Armani', 'EA7',
    'Karl Lagerfeld', 'Pinko', 'Liu Jo', 'Patrizia Pepe', 'Twinset', 'Max Mara',
    'Weekend Max Mara', 'Marella', 'Sportmax', 'Iceberg', 'Blauer', 'Herno',
].sort((a, b) => b.length - a.length);

// Types de vêtements génériques (pour identifier les noms sans marque)
const GENERIC_TYPES = [
    'T-shirt imprimé', 'T-shirt à manches longues', 'T-shirt basique', 'T-shirt',
    'Veste d\'hiver', 'Veste mi-saison', 'Veste en jean', 'Veste', 'Blouson',
    'Jean boyfriend', 'Jean slim', 'Jean large', 'Jean droit', 'Jean',
    'Sweat à capuche', 'Sweatshirt', 'Sweat', 'Pull', 'Pullover',
    'Manteau classique', 'Manteau', 'Doudoune', 'Parka',
    'Pantalon cargo', 'Pantalon classique', 'Pantalon', 'Short',
    'Robe', 'Jupe', 'Minijupe', 'Combinaison', 'Combishort',
    'Chemise', 'Polo', 'Top', 'Body', 'Débardeur',
    'Legging', 'Jogging', 'Survêtement',
];

/**
 * Tente d'extraire la marque d'un nom collé (ex: "WeekdaySweat à capuche")
 * Retourne { brand, cleanName } ou null si pas de marque trouvée
 */
function extractBrandFromConcatenated(name: string): { brand: string; cleanName: string } | null {
    const nameLower = name.toLowerCase();

    for (const brand of KNOWN_BRANDS) {
        const brandLower = brand.toLowerCase();
        if (nameLower.startsWith(brandLower)) {
            const rest = name.slice(brand.length).trim();
            // Vérifier que ce qui reste est un vrai nom (pas vide, pas juste un chiffre)
            if (rest.length > 2 && !/^\d+$/.test(rest)) {
                return { brand, cleanName: rest };
            }
        }
    }
    return null;
}

/**
 * Sépare le nom du type de vêtement (ex: "LINEAR HERITAGE HALF ZIP - Sweatshirt")
 * Retourne { productName, category }
 */
function splitNameAndCategory(name: string): { productName: string; category: string | null } {
    // Pattern: "NOM DU PRODUIT - Type de vêtement"
    const dashMatch = name.match(/^(.+?)\s*[-–]\s*([^-–]+)$/);
    if (dashMatch) {
        const potentialName = dashMatch[1].trim();
        const potentialCategory = dashMatch[2].trim();
        // Le type doit être un mot/expression courte (pas un nom de produit)
        if (potentialCategory.length < 50 && potentialCategory.split(' ').length <= 5) {
            return { productName: potentialName, category: potentialCategory };
        }
    }
    return { productName: name, category: null };
}

/**
 * Vérifie si un nom est juste un type générique sans marque ni nom propre
 */
function isGenericOnly(name: string): boolean {
    const nameTrimmed = name.trim();
    return GENERIC_TYPES.some(t =>
        nameTrimmed.toLowerCase() === t.toLowerCase() ||
        nameTrimmed.toLowerCase() === t.toLowerCase() + 's'
    );
}

async function main() {
    console.log('🔍 Analyse des articles Zalando...\n');

    const all = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        select: { id: true, name: true, productBrand: true, category: true, segment: true },
    });

    console.log(`📦 Total articles Zalando: ${all.length}`);

    let fixedBrand = 0;
    let fixedCategory = 0;
    let deleted = 0;
    let skipped = 0;

    for (const product of all) {
        const originalName = product.name || '';
        let newName = originalName;
        let newBrand = product.productBrand;
        let newCategory = product.category;
        let changed = false;

        // 1. Si pas de marque ou marque = "Zalando", essayer d'extraire depuis le nom collé
        const brandIsEmpty = !newBrand || newBrand.trim() === '' || newBrand.toLowerCase() === 'zalando';

        if (brandIsEmpty) {
            const extracted = extractBrandFromConcatenated(originalName);
            if (extracted) {
                newBrand = extracted.brand;
                newName = extracted.cleanName;
                changed = true;
                fixedBrand++;
                console.log(`✅ Marque extraite: "${originalName}" → brand: "${newBrand}", name: "${newName}"`);
            }
        }

        // 2. Si la marque est déjà connue mais collée au nom (ex: "WeekdaySweat à capuche" avec brand: null)
        if (!changed && brandIsEmpty) {
            // Essayer quand même l'extraction
            const extracted = extractBrandFromConcatenated(newName);
            if (extracted) {
                newBrand = extracted.brand;
                newName = extracted.cleanName;
                changed = true;
                fixedBrand++;
            }
        }

        // 3. Séparer le nom du type de vêtement (ex: "LINEAR HERITAGE HALF ZIP - Sweatshirt")
        const { productName, category } = splitNameAndCategory(newName);
        if (category && category !== newCategory) {
            newName = productName;
            newCategory = category;
            changed = true;
            fixedCategory++;
        }

        // 4. Supprimer si le nom est juste un type générique sans marque
        if (isGenericOnly(newName) && (!newBrand || newBrand.toLowerCase() === 'zalando')) {
            await prisma.trendProduct.delete({ where: { id: product.id } });
            deleted++;
            console.log(`🗑️  Supprimé (générique sans marque): "${originalName}" [${product.segment}]`);
            continue;
        }

        // 5. Appliquer les changements si nécessaire
        if (changed) {
            await prisma.trendProduct.update({
                where: { id: product.id },
                data: {
                    name: newName.trim(),
                    productBrand: newBrand,
                    category: newCategory,
                },
            });
        } else {
            skipped++;
        }
    }

    console.log('\n📊 Résumé du nettoyage :');
    console.log(`  ✅ Marques extraites/corrigées : ${fixedBrand}`);
    console.log(`  📂 Catégories séparées du nom  : ${fixedCategory}`);
    console.log(`  🗑️  Articles supprimés (génériques sans marque) : ${deleted}`);
    console.log(`  ⏭️  Articles inchangés : ${skipped}`);
    console.log('\n✨ Nettoyage terminé !');

    await prisma.$disconnect();
}

main().catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
