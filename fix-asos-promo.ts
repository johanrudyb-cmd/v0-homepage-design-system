/**
 * Nettoie les noms de produits corrompus par les textes promotionnels ASOS
 * Ex: "Noir délavéPLUS DE COULEURSÇa part vite" → supprimé (irrécupérable)
 * Ex: "T-shirt classique - Noir" → "T-shirt classique"
 * Ex: "Débardeur de sportÇa part vite" → "Débardeur de sport"
 */
import { prisma } from './lib/prisma';

// Textes promotionnels à supprimer
const PROMO_RE = /plus de couleurs|ça part vite|ca part vite|nouveauté|exclusivité|exclusivite|asos design|asos edition|asos luxe|asos 4505|asos curve|asos white|\basos\b|\bzalando\b|\bzara\b/gi;

// Couleurs en suffixe à supprimer
const COLOR_SUFFIX_RE = /\s*[-–]\s*(noir|blanc|bleu|rouge|vert|gris|beige|rose|marron|orange|violet|jaune|kaki|indigo|navy|cream|olive|black|white|blue|red|green|grey|gray|pink|brown|khaki|stone|sand|natural|naturel|anthracite|charcoal|nude|ivoire|ivory|gold|silver|bordeaux|terracotta|rouille|rust|moutarde|lilas|lavande|menthe|mint|saumon|salmon|turquoise|cyan|magenta|fuchsia|prune|plum|aubergine|chocolat|caramel|cognac|tabac|army|militaire|sauge|sage|eucalyptus|citron|lemon|lime|corail|abricot|apricot|framboise|cerise|fraise|myrtille|mauve|parme|ardoise|slate|acier|steel|platine|champagne|camouflage|camo|washed|délavé|vintage|stonewash)(\s*\/\s*[a-zA-ZÀ-ÿ]+)*$/gi;

// Noms qui sont juste une couleur (à supprimer)
const JUST_COLOR_RE = /^(noir|blanc|bleu|rouge|vert|gris|beige|rose|marron|orange|violet|jaune|kaki|indigo|navy|cream|olive|black|white|blue|red|green|grey|gray|pink|brown|khaki|stone|sand|naturel|anthracite|charcoal|nude|ivoire|ivory|gold|silver|bordeaux|terracotta|rouille|rust|moutarde|lilas|lavande|menthe|mint|saumon|salmon|turquoise|cyan|magenta|fuchsia|prune|plum|aubergine|chocolat|caramel|cognac|tabac|army|militaire|sauge|sage|eucalyptus|citron|lemon|lime|corail|abricot|apricot|framboise|cerise|fraise|myrtille|mauve|parme|ardoise|slate|acier|steel|platine|champagne|camouflage|camo)([\/\s][a-zA-ZÀ-ÿ]*)?$/i;

async function main() {
    console.log('🧹 Nettoyage des noms corrompus (textes promo ASOS)...');

    const products = await prisma.trendProduct.findMany({
        select: { id: true, name: true }
    });

    let deleted = 0;
    let updated = 0;
    let skipped = 0;

    for (const p of products) {
        const raw = (p.name || '').trim();
        if (!raw) { skipped++; continue; }

        // Étape 1 : retirer les textes promo
        let clean = raw.replace(PROMO_RE, '').replace(/\s{2,}/g, ' ').trim();

        // Étape 2 : retirer les couleurs en suffixe
        clean = clean.replace(COLOR_SUFFIX_RE, '').trim();

        // Étape 3 : si le résultat est juste une couleur ou vide → supprimer
        if (!clean || clean.length < 3 || JUST_COLOR_RE.test(clean)) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            console.log(`  🗑️  Supprimé: "${raw}"`);
            deleted++;
            continue;
        }

        // Si le nom a changé → mettre à jour
        if (clean !== raw) {
            await prisma.trendProduct.update({ where: { id: p.id }, data: { name: clean } });
            console.log(`  ✅ "${raw.slice(0, 60)}" → "${clean.slice(0, 60)}"`);
            updated++;
            continue;
        }

        skipped++;
    }

    console.log(`\n✅ Terminé : ${deleted} supprimés, ${updated} nettoyés, ${skipped} inchangés.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
