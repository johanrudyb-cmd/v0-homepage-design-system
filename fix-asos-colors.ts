/**
 * Nettoie les produits ASOS en base :
 * - Retire les couleurs stockées comme noms ("Noir", "Kaki", "Gris")
 * - Retire les couleurs en suffixe des noms ("T-shirt classique - Noir" → "T-shirt classique")
 * - Supprime les produits dont le nom est juste une couleur (irrécupérables)
 */
import { prisma } from './lib/prisma';

const COLOR_RE = /^(noir|blanc|bleu|rouge|vert|gris|beige|rose|marron|orange|violet|jaune|crème|creme|camel|taupe|écru|ecru|kaki|indigo|navy|tan|cream|olive|burgundy|teal|coral|lavender|mustard|black|white|blue|red|green|grey|gray|pink|brown|khaki|multicolore|multicolor|stone|sand|natural|naturel|anthracite|charcoal|cobalt|neon|pastel|nude|ivoire|ivory|gold|silver|doré|argenté|bordeaux|terracotta|rouille|rust|moutarde|lilas|lavande|menthe|mint|saumon|salmon|pêche|peach|turquoise|cyan|magenta|fuchsia|prune|plum|aubergine|chocolat|caramel|cognac|tabac|army|militaire|forêt|forest|sauge|sage|eucalyptus|pistache|citron|lemon|lime|corail|abricot|apricot|framboise|cerise|fraise|myrtille|mauve|parme|ardoise|slate|acier|steel|platine|champagne|léopard|leopard|zèbre|zebra|camouflage|camo|dégradé|ombre|washed|délavé|vintage|stonewash)$/i;

// Regex pour retirer la couleur en suffixe : "T-shirt - Noir" → "T-shirt"
const COLOR_SUFFIX_RE = /\s*[-–]\s*(noir|blanc|bleu|rouge|vert|gris|beige|rose|marron|orange|violet|jaune|crème|creme|camel|taupe|écru|ecru|kaki|indigo|navy|tan|cream|olive|burgundy|teal|coral|lavender|mustard|black|white|blue|red|green|grey|gray|pink|brown|khaki|multicolore|multicolor|stone|sand|natural|naturel|anthracite|charcoal|cobalt|neon|pastel|nude|ivoire|ivory|gold|silver|doré|argenté|bordeaux|terracotta|rouille|rust|moutarde|lilas|lavande|menthe|mint|saumon|salmon|pêche|peach|turquoise|cyan|magenta|fuchsia|prune|plum|aubergine|chocolat|caramel|cognac|tabac|army|militaire|forêt|forest|sauge|sage|eucalyptus|pistache|citron|lemon|lime|corail|abricot|apricot|framboise|cerise|fraise|myrtille|mauve|parme|ardoise|slate|acier|steel|platine|champagne|léopard|leopard|zèbre|zebra|camouflage|camo|dégradé|ombre|washed|délavé|vintage|stonewash)(\s*\/\s*(noir|blanc|bleu|rouge|vert|gris|beige|rose|marron|orange|violet|jaune|kaki|indigo|navy|black|white|blue|red|green|grey|gray|pink|brown|khaki|multicolore|stone|sand|cream|olive|burgundy|teal|coral|lavender|mustard|gold|silver|bordeaux|terracotta|rouille|rust|moutarde|lilas|lavande|menthe|mint|saumon|salmon|pêche|peach|turquoise|cyan|magenta|fuchsia|prune|plum|aubergine|chocolat|caramel|cognac|tabac|army|militaire|forêt|forest|sauge|sage|eucalyptus|pistache|citron|lemon|lime|corail|abricot|apricot|framboise|cerise|fraise|myrtille|mauve|parme|ardoise|slate|acier|steel|platine|champagne|léopard|leopard|zèbre|zebra|camouflage|camo))*$/gi;

async function main() {
    console.log('🎨 Nettoyage des couleurs dans les noms ASOS...');

    const products = await prisma.trendProduct.findMany({
        select: { id: true, name: true, productBrand: true, sourceBrand: true }
    });

    let deleted = 0;
    let updated = 0;
    let skipped = 0;

    for (const p of products) {
        const rawName = (p.name || '').trim();
        if (!rawName) { skipped++; continue; }

        // Cas 1 : Le nom EST une couleur (ex: "Noir/rouge", "Gris", "Kaki") → supprimer
        const isJustColor = COLOR_RE.test(rawName) || /^[a-zA-ZÀ-ÿ]+\/[a-zA-ZÀ-ÿ]+$/.test(rawName) && COLOR_RE.test(rawName.split('/')[0]);
        if (isJustColor) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            console.log(`  🗑️  Supprimé (couleur comme nom): "${rawName}"`);
            deleted++;
            continue;
        }

        // Cas 2 : Le nom a une couleur en suffixe → la retirer
        const cleanName = rawName.replace(COLOR_SUFFIX_RE, '').trim();
        if (cleanName !== rawName && cleanName.length >= 3) {
            await prisma.trendProduct.update({ where: { id: p.id }, data: { name: cleanName } });
            console.log(`  ✅ "${rawName}" → "${cleanName}"`);
            updated++;
            continue;
        }

        skipped++;
    }

    console.log(`\n✅ Terminé : ${deleted} supprimés, ${updated} noms nettoyés, ${skipped} inchangés.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
