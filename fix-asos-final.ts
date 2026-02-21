/**
 * fix-asos-final.ts
 * Nettoyage final des articles ASOS (Global Partner) :
 * 1. Supprime les articles de foot mal segmentés en "femme" (Real Madrid, Arsenal, etc.)
 * 2. Nettoie les noms encore génériques (T-shirt à 3 bandes → garde si marque connue)
 * 3. Supprime les prix résiduels dans les noms
 * 4. Affiche un audit complet avant/après
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mots-clés de clubs de foot → pas des vêtements mode
const FOOTBALL_KEYWORDS = [
    'Real Madrid', 'Arsenal', 'Liverpool', 'Bayern Munich', 'Manchester United',
    'Manchester City', 'Chelsea', 'Juventus', 'Barcelona', 'PSG', 'Paris Saint-Germain',
    'Inter Milan', 'AC Milan', 'Borussia', 'Ajax', 'Porto', 'Benfica',
    'Atlético', 'Atletico', 'Tottenham', 'Leicester', 'West Ham', 'Everton',
    'Newcastle', 'Aston Villa', 'Leeds', 'Rangers', 'Celtic',
];

// Noms génériques sans valeur mode (sans marque distinctive)
const PURE_GENERIC = [
    'T-shirt à 3 bandes', 'T-shirt', 'Débardeur côtelé', 'Débardeur',
    'Short', 'Legging', 'Brassière', 'Crop top',
];

function hasFootballKeyword(name: string): boolean {
    return FOOTBALL_KEYWORDS.some(kw => name.toLowerCase().includes(kw.toLowerCase()));
}

function cleanPrice(name: string): string {
    // Supprimer les prix résiduels (ex: "49,99 €", "100,00€")
    return name.replace(/\s*\d{1,4}[,.]\d{2}\s*[€$£]?\s*$/, '').trim();
}

async function main() {
    console.log('🔧 Nettoyage final ASOS...\n');

    const all = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Global Partner' },
        select: { id: true, name: true, productBrand: true, segment: true },
    });

    console.log(`📦 Total ASOS: ${all.length} (femme: ${all.filter(p => p.segment === 'femme').length}, homme: ${all.filter(p => p.segment === 'homme').length})`);

    let deleted = 0;
    let fixed = 0;

    for (const p of all) {
        const name = (p.name || '').trim();
        const brand = (p.productBrand || '').trim();

        // 1. Supprimer les articles de foot segmentés en femme (pas pertinents pour mode femme)
        if (p.segment === 'femme' && hasFootballKeyword(name)) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            deleted++;
            console.log(`🗑️  [femme foot] "${name}"`);
            continue;
        }

        // 2. Supprimer les noms purement génériques sans marque distinctive
        const isGeneric = PURE_GENERIC.some(g => name.toLowerCase() === g.toLowerCase());
        if (isGeneric) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            deleted++;
            console.log(`🗑️  [générique] "${name}" by "${brand}"`);
            continue;
        }

        // 3. Nettoyer les prix résiduels dans les noms
        const cleanedName = cleanPrice(name);
        if (cleanedName !== name && cleanedName.length > 3) {
            await prisma.trendProduct.update({
                where: { id: p.id },
                data: { name: cleanedName },
            });
            fixed++;
            console.log(`✅ Prix supprimé: "${name}" → "${cleanedName}"`);
        }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`  🗑️  Supprimés: ${deleted}`);
    console.log(`  ✅ Noms nettoyés: ${fixed}`);

    const remaining = await prisma.trendProduct.findMany({
        where: { sourceBrand: 'Global Partner' },
        select: { name: true, productBrand: true, segment: true },
    });
    const femme = remaining.filter(p => p.segment === 'femme');
    const homme = remaining.filter(p => p.segment === 'homme');
    console.log(`\n📦 Restants: ${remaining.length} (femme: ${femme.length}, homme: ${homme.length})`);
    console.log('\n🔍 Articles femme restants:');
    femme.forEach(p => console.log(`  "${p.productBrand}" → "${p.name}"`));

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
