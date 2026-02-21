/**
 * fix-asos-and-zalando.ts
 * 1. Nettoie les articles ASOS (Global Partner) : extrait marque + nom propre depuis le titre complet
 * 2. Corrige les noms Zalando encore cassés (tronqués, marques inconnues collées)
 * 3. Supprime les doublons Zalando homme/femme identiques
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KNOWN_BRANDS = [
    "adidas Originals", "Polo Ralph Lauren", "Tommy Hilfiger", "Tommy Jeans",
    "Karl Lagerfeld", "Emporio Armani", "Weekend Max Mara", "The Ragged Priest",
    "Alexander McQueen", "Alpha Industries", "Bottega Veneta", "Calvin Klein",
    "Canada Goose", "Dolce & Gabbana", "Massimo Dutti", "New Balance",
    "Ralph Lauren", "Saint Laurent", "Stone Island", "The North Face",
    "Under Armour", "Zadig & Voltaire", "Acne Studios", "Axel Arigato",
    "CP Company", "Fred Perry", "Heron Preston", "Isabel Marant",
    "Palm Angels", "Pull & Bear", "Pull&Bear", "Stradivarius", "Ted Baker",
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
    "FAVELA", "Adidas", "Munthe", "Adolfo Dominguez", "Cinq à Sept",
    "Nümph", "Ichi", "b.young", "Naf Naf", "MISBHV", "Paco Rabanne",
    "Filippa K", "Tiger of Sweden", "Nudie Jeans", "Arket", "COS", "Monki",
    "Real Madrid", "PSG", "Paris Saint-Germain", "Manchester United",
    "Jordan", "Champion", "Fila", "Kappa", "Umbro", "Ellesse",
].sort((a, b) => b.length - a.length);

function extractBrandFromTitle(title: string): { brand: string; cleanName: string } | null {
    // Pattern ASOS: "Marque - Nom du produit - Couleur Prix €"
    // On split sur " - " et on prend le premier segment comme marque
    const parts = title.split(' - ').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
        const potentialBrand = parts[0];
        // Vérifier si c'est une marque connue (insensible à la casse)
        const matchedBrand = KNOWN_BRANDS.find(b =>
            b.toLowerCase() === potentialBrand.toLowerCase() ||
            potentialBrand.toLowerCase().startsWith(b.toLowerCase())
        );
        if (matchedBrand) {
            // Reconstituer le nom sans la marque et sans le prix/couleur
            const rest = parts.slice(1).join(' - ');
            // Supprimer le prix à la fin (ex: "49,99 €" ou "100,00 €")
            const cleanRest = rest.replace(/\s*\d{1,4}[,.]\d{2}\s*[€$£]?\s*$/, '').trim();
            // Supprimer les couleurs à la fin (dernier segment après " - " si court)
            const restParts = cleanRest.split(' - ');
            const lastPart = restParts[restParts.length - 1];
            const isColorOrSize = lastPart.length < 30 && /^[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâéèêëîïôùûüç]/.test(lastPart) && restParts.length > 1;
            const finalName = isColorOrSize ? restParts.slice(0, -1).join(' - ') : cleanRest;
            return { brand: matchedBrand, cleanName: finalName.trim() };
        }
    }

    // Fallback: chercher la marque au début du titre collé
    const titleLower = title.toLowerCase();
    for (const brand of KNOWN_BRANDS) {
        if (titleLower.startsWith(brand.toLowerCase())) {
            const rest = title.slice(brand.length).replace(/^\s*[-–]\s*/, '').trim();
            const cleanRest = rest.replace(/\s*\d{1,4}[,.]\d{2}\s*[€$£]?\s*$/, '').trim();
            if (cleanRest.length > 2) return { brand, cleanName: cleanRest };
        }
    }
    return null;
}

async function main() {
    console.log('🔧 Nettoyage ASOS + Zalando résiduel...\n');

    // ── 1. ASOS (Global Partner) ──────────────────────────────────────────────
    console.log('📦 Traitement ASOS (Global Partner)...');
    const asosProducts = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Global Partner' },
        select: { id: true, name: true, productBrand: true, segment: true },
    });
    console.log(`  Total: ${asosProducts.length}`);

    let asosFixed = 0, asosDeleted = 0;
    for (const p of asosProducts) {
        const name = (p.name || '').trim();
        const extracted = extractBrandFromTitle(name);
        if (extracted && extracted.cleanName.length > 3) {
            await prisma.trendProduct.update({
                where: { id: p.id },
                data: { productBrand: extracted.brand, name: extracted.cleanName },
            });
            asosFixed++;
            if (asosFixed <= 10) console.log(`  ✅ [${p.segment}] "${extracted.brand}" | "${extracted.cleanName}"`);
        } else {
            // Nom non parseable → supprimer
            await prisma.trendProduct.delete({ where: { id: p.id } });
            asosDeleted++;
        }
    }
    console.log(`  ✅ Corrigés: ${asosFixed}, 🗑️ Supprimés: ${asosDeleted}`);

    // ── 2. Zalando résiduel : marques encore collées ──────────────────────────
    console.log('\n📦 Traitement Zalando résiduel...');
    const zalandoProds = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        select: { id: true, name: true, productBrand: true, segment: true },
    });

    let zFixed = 0, zDeleted = 0;
    for (const p of zalandoProds) {
        const name = (p.name || '').trim();
        const brand = (p.productBrand || '').trim();
        let newName = name;
        let newBrand = brand;
        let changed = false;

        // Corriger les noms tronqués (ex: "Veste mi" → supprimer)
        if (name.length < 5 || /^[A-Z]{1,4}$/.test(name)) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            zDeleted++;
            continue;
        }

        // Corriger les marques encore collées dans le brand (insensible à la casse)
        const brandLower = brand.toLowerCase();
        for (const kb of KNOWN_BRANDS) {
            if (brandLower.startsWith(kb.toLowerCase()) && brand.length > kb.length + 1) {
                const rest = brand.slice(kb.length).trim();
                if (rest.length > 2 && !/^\d+$/.test(rest)) {
                    // Le reste est le vrai nom
                    const GENERIC = ['Pantalon classique', 'Manteau classique', 'Veste en cuir', 'Pullover', 'Sweat à capuche', 'Jean boyfriend', 'T-shirt', 'Robe', 'Jupe', 'Blazer', 'Polo', 'Chemise'];
                    const nameIsGeneric = GENERIC.some(g => name.toLowerCase() === g.toLowerCase()) || name.length < 5;
                    newBrand = kb;
                    if (nameIsGeneric) newName = rest;
                    changed = true;
                    break;
                }
            }
        }

        // Corriger les marques encore collées dans le name
        if (!changed) {
            const nameLower = name.toLowerCase();
            for (const kb of KNOWN_BRANDS) {
                if (nameLower.startsWith(kb.toLowerCase()) && name.length > kb.length + 1) {
                    const rest = name.slice(kb.length).replace(/^\s*[-–]\s*/, '').trim();
                    if (rest.length > 2) {
                        if (!newBrand || newBrand.toLowerCase() === 'zalando') newBrand = kb;
                        newName = rest;
                        changed = true;
                        break;
                    }
                }
            }
        }

        if (changed) {
            await prisma.trendProduct.update({
                where: { id: p.id },
                data: { name: newName.trim(), productBrand: newBrand.trim() },
            });
            zFixed++;
            if (zFixed <= 15) console.log(`  ✅ [${p.segment}] brand="${newBrand}" | name="${newName}"`);
        }
    }
    console.log(`  ✅ Corrigés: ${zFixed}, 🗑️ Supprimés: ${zDeleted}`);

    // ── 3. Supprimer les doublons Zalando homme=femme ─────────────────────────
    console.log('\n📦 Suppression des doublons Zalando homme/femme...');
    const allZalando = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Zalando' },
        select: { id: true, name: true, productBrand: true, segment: true, sourceUrl: true },
        orderBy: { id: 'asc' },
    });

    // Grouper par (name + brand) pour détecter les doublons entre segments
    const seenByNameBrand = new Map<string, { id: string; segment: string }[]>();
    for (const p of allZalando) {
        const key = `${(p.productBrand || '').toLowerCase()}|${(p.name || '').toLowerCase()}`;
        if (!seenByNameBrand.has(key)) seenByNameBrand.set(key, []);
        seenByNameBrand.get(key)!.push({ id: p.id, segment: p.segment || '' });
    }

    let dupDeleted = 0;
    for (const [key, items] of seenByNameBrand) {
        if (items.length <= 1) continue;
        // Garder un de chaque segment, supprimer les vrais doublons (même segment)
        const bySegment = new Map<string, string[]>();
        for (const item of items) {
            if (!bySegment.has(item.segment)) bySegment.set(item.segment, []);
            bySegment.get(item.segment)!.push(item.id);
        }
        // Supprimer les doublons dans le même segment (garder le premier)
        for (const [seg, ids] of bySegment) {
            if (ids.length > 1) {
                const toDelete = ids.slice(1);
                await prisma.trendProduct.deleteMany({ where: { id: { in: toDelete } } });
                dupDeleted += toDelete.length;
            }
        }
    }
    console.log(`  🗑️ Doublons supprimés: ${dupDeleted}`);

    // ── Résumé final ──────────────────────────────────────────────────────────
    const countZ = await prisma.trendProduct.count({ where: { sourceBrand: 'Zalando' } });
    const countA = await prisma.trendProduct.count({ where: { sourceBrand: 'Global Partner' } });
    console.log(`\n📊 Résumé final:`);
    console.log(`  Zalando restants: ${countZ}`);
    console.log(`  ASOS restants: ${countA}`);

    // Vérification ASOS
    const asosSamples = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Global Partner' },
        take: 5,
        select: { name: true, productBrand: true, segment: true },
    });
    console.log('\n🔍 Exemples ASOS après nettoyage:');
    asosSamples.forEach(s => console.log(`  [${s.segment}] "${s.productBrand}" → "${s.name}"`));

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
