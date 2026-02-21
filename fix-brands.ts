/**
 * Script de réparation des marques et noms produits.
 * 
 * Le problème : le champ `productBrand` contient des valeurs comme :
 *   "DieselBLEESS" → marque = "Diesel", le reste = nom de collection (à ignorer)
 *   "AllSaintsRYDER JACKET" → marque = "AllSaints"
 *   "TerranovaVeste d'hiver" → marque = "Terranova", nom = "Veste d'hiver"
 *   "Trench" → pas une marque, c'est le nom du produit
 *   "WeekdaySweat à capuche" → marque = "Weekday", nom = "Sweat à capuche"
 * 
 * Stratégie :
 * 1. Chercher si le productBrand commence par une marque connue → extraire la marque propre
 * 2. Si le productBrand est un terme générique (vêtement) → null
 * 3. Nettoyer le nom produit en retirant la marque si elle y est collée
 */

import { prisma } from './lib/prisma';

// Marques connues triées par longueur décroissante pour éviter les faux positifs
const KNOWN_BRANDS = [
    'Alexander McQueen', 'Alpha Industries', 'Bottega Veneta', 'Calvin Klein', 'Canada Goose',
    'Dolce & Gabbana', 'Massimo Dutti', 'New Balance', 'Ralph Lauren', 'Saint Laurent',
    'Stone Island', 'The North Face', 'Tommy Hilfiger', 'Under Armour', 'Zadig & Voltaire',
    'Acne Studios', 'Axel Arigato', 'Birkenstock', 'CP Company', 'Fred Perry', 'Heron Preston',
    'Isabel Marant', 'North Face', 'Palm Angels', 'Pull & Bear', 'Stradivarius', 'Ted Baker',
    'Timberland', 'Adidas', 'AllSaints', 'All Saints', 'Arcteryx', 'Asics', 'Autry', 'Ba&sh',
    'Balenciaga', 'Barbour', 'Bershka', 'Champion', 'Columbia', 'Converse', 'Diesel', 'Ellesse',
    'Ferragamo', 'Givenchy', 'Gant', 'Gucci', 'Hackett', 'Hugo Boss', 'Jacquemus', 'Jordan',
    'Kappa', 'Kenzo', 'Lacoste', "Levi's", 'Levis', 'Loewe', 'Maje', 'Mango', 'Miu Miu',
    'Miumiu', 'Moncler', 'Moschino', 'Napapijri', 'Nike', 'Off-White', 'Patagonia', 'Paul Smith',
    'Prada', 'Puma', 'Reebok', 'Reiss', 'Rick Owens', 'Sandro', 'Schott', 'Supreme', 'Stüssy',
    'The Kooples', 'Uniqlo', 'Valentino', 'Vans', 'Versace', 'Veja', 'Celine', 'Dior', 'Fendi',
    'Fila', 'Gap', 'Iro', 'A.P.C.', 'Ami', 'Sacai', 'Kapital', 'Corteiz', 'Crtz', 'Hellstar',
    'Sp5der', 'Denim Tears', 'Weekday', 'Terranova', 'Pinko', 'Marella', 'Mother', 'Les Deux',
    'Han Kjøbenhavn', 'Elisabetta Franchi', 'MM6 Maison Margiela', 'Maison Margiela', 'Umbro',
    'FAVELA', 'aim\'n', 'aim\'n®', '032c', 'Carhartt', 'Dickies', 'Guess', 'Dr. Martens',
    'Superdry', 'Burberry', 'Armani', 'Y3', 'Claudie Pierlot', 'Sézane', 'Sezane', 'Rouje',
    'Musier', 'Sessun', 'Des Petits Hauts', 'Vanessa Bruno', 'Gerard Darel', 'Gérard Darel',
    'Comptoir des Cotonniers', 'Petit Bateau', 'Jacadi', 'Soeur',
].sort((a, b) => b.length - a.length);

// Termes génériques qui ne sont PAS des marques
const GENERIC_TERMS = [
    'trench', 'manteau', 'pullover', 'shirt', 'sweatshirt', 'cardigan', 'blazer', 'costume',
    'top', 'débardeur', 'debardeur', 'pant', 'denim', 'jogging', 'leggings', 'bra', 'boxer',
    'pyjama', 'maillot', 'bikini', 'bermuda', 'cabas', 'ceinture', 'chapeau', 'bonnet',
    'jean', 'jeans', 't-shirt', 'tshirt', 'pull', 'sweat', 'hoodie', 'robe', 'veste', 'blouson',
    'pantalon', 'cargo', 'short', 'chemise', 'jupe', 'polo', 'legging', 'gilet', 'ensemble',
    'body', 'pack', 'lot', 'doudoune', 'basique', 'accessoire', 'foulard', 'manches', 'longues',
    'haut', 'bas', 'minijupe', 'minirobe', 'survêtement', 'survetement', 'survêt',
    'null',
    // Couleurs (souvent utilisées comme titre sur ASOS)
    'kaki', 'indigo', 'noir', 'blanc', 'bleu', 'rouge', 'vert', 'gris', 'beige', 'rose',
    'marron', 'orange', 'violet', 'jaune', 'crème', 'creme', 'camel', 'taupe', 'écru', 'ecru',
    'black', 'white', 'blue', 'red', 'green', 'grey', 'gray', 'pink', 'brown', 'khaki',
    'navy', 'tan', 'cream', 'olive', 'burgundy', 'teal', 'coral', 'lavender', 'mustard',
];

function extractBrandFromRaw(raw: string): string | null {
    if (!raw || raw.trim() === '' || raw === 'null') return null;
    const r = raw.trim();
    const rLower = r.toLowerCase();

    // Si c'est un terme générique → pas une marque
    if (GENERIC_TERMS.some(t => rLower === t || rLower.startsWith(t + ' ') || rLower.startsWith(t + 'à'))) {
        return null;
    }

    // Chercher si ça commence par une marque connue
    for (const brand of KNOWN_BRANDS) {
        if (rLower.startsWith(brand.toLowerCase())) {
            return brand; // Retourner la marque propre (casse correcte)
        }
    }

    // Si ça ne correspond à rien de connu, c'est peut-être une marque inconnue
    // On la garde seulement si elle ressemble à un nom propre (pas trop long, pas de termes génériques)
    if (r.length <= 40 && !GENERIC_TERMS.some(t => rLower.includes(t))) {
        return r;
    }

    return null;
}

function cleanNameFromBrand(name: string, brand: string | null): string {
    if (!name) return name;
    if (!brand) return name;

    const n = name.trim();
    const b = brand.trim();
    const escaped = b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Retirer la marque au début avec ou sans séparateur
    const re = new RegExp(`^\\s*${escaped}\\s*[-–|:]?\\s*`, 'i');
    const cleaned = n.replace(re, '').trim();

    return cleaned || n;
}

async function main() {
    console.log('🔧 Réparation des marques et noms produits...');

    const products = await prisma.trendProduct.findMany({
        select: { id: true, name: true, productBrand: true, sourceBrand: true }
    });

    console.log(`📦 ${products.length} produits à analyser...`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const p of products) {
        const rawBrand = p.productBrand || '';
        const rawName = p.name || '';

        // 1. Extraire la vraie marque depuis productBrand (qui contient souvent "MarqueNomCollection")
        let cleanBrand = extractBrandFromRaw(rawBrand);

        // 2. Si pas de marque dans productBrand, essayer de l'extraire depuis le nom
        if (!cleanBrand && rawName) {
            for (const brand of KNOWN_BRANDS) {
                if (rawName.toLowerCase().startsWith(brand.toLowerCase())) {
                    cleanBrand = brand;
                    break;
                }
            }
        }

        // 3. Nettoyer le nom produit : retirer la marque si elle est collée au début
        let cleanName = rawName;
        if (cleanBrand) {
            cleanName = cleanNameFromBrand(rawName, cleanBrand);
        }

        // Si rien n'a changé, on skip
        const brandChanged = cleanBrand !== (rawBrand || null);
        const nameChanged = cleanName !== rawName && cleanName.length >= 3;

        if (!brandChanged && !nameChanged) {
            skippedCount++;
            continue;
        }

        const updates: any = {};
        if (brandChanged) updates.productBrand = cleanBrand;
        if (nameChanged) updates.name = cleanName;

        if (Object.keys(updates).length > 0) {
            await prisma.trendProduct.update({ where: { id: p.id }, data: updates });
            updatedCount++;
            console.log(`  ✅ brand: "${rawBrand}" → "${cleanBrand}" | name: "${rawName}" → "${cleanName}"`);
        } else {
            skippedCount++;
        }
    }

    console.log(`\n✅ Terminé : ${updatedCount} produits mis à jour, ${skippedCount} inchangés.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
