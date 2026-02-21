/**
 * Deep Cleanup Script:
 * 1. Removes products with "MIX MATCH", "MIX & MATCH" in name
 * 2. Removes products whose name is just a color (comprehensive list)
 * 3. Removes products with extremely generic names ("Veste", "Sweat", "Jean") if NO brand is detected
 * 4. Re-assigns brands for ASOS products by checking the title again with the updated POPULAR_BRANDS list
 */
import { prisma } from './lib/prisma';
import { getProductBrand, cleanProductName } from './lib/brand-utils';

const COLOR_RE = /^(noir|blanc|bleu|rouge|vert|gris|beige|rose|marron|orange|violet|jaune|crème|creme|camel|taupe|écru|ecru|kaki|indigo|navy|tan|cream|olive|burgundy|teal|coral|lavender|mustard|black|white|blue|red|green|grey|gray|pink|brown|khaki|multicolore|multicolor|stone|sand|natural|naturel|anthracite|charcoal|cobalt|neon|pastel|nude|ivoire|ivory|gold|silver|doré|argenté|bordeaux|terracotta|rouille|rust|moutarde|lilas|lavande|menthe|mint|saumon|salmon|pêche|peach|turquoise|cyan|magenta|fuchsia|prune|plum|aubergine|chocolat|caramel|cognac|tabac|army|militaire|forêt|forest|sauge|sage|eucalyptus|pistache|citron|lemon|lime|corail|abricot|apricot|framboise|cerise|fraise|myrtille|mauve|parme|ardoise|slate|acier|steel|platine|champagne|léopard|leopard|zèbre|zebra|camouflage|camo|dégradé|ombre|washed|délavé|vintage|stonewash)(\s*\/\s*[a-zA-ZÀ-ÿ]+)*$/i;

const GENERIC_FASHION_RE = /^(jean|jeans|t-shirt|tshirt|pull|sweat|hoodie|robe|veste|blouson|pantalon|cargo|short|chemise|jupe|polo|gilet|cardigan|blazer|doudoune|basique|accessoire|chaussettes|sac|chaussures|trench|manteau|pullover|shirt|sweatshirt|top|débardeur|debardeur|pant|denim|jogging|leggings|bra|boxer|pyjama|maillot|bikini|bermuda|cabas|ceinture|chapeau|bonnet|ensemble|body|lot|pack)$/i;

async function main() {
    console.log('🚀 Démarrage du Grand Nettoyage des segments...');

    const products = await prisma.trendProduct.findMany();

    let deletedMixed = 0;
    let deletedColor = 0;
    let deletedGenericNoBrand = 0;
    let updatedBrand = 0;
    let deletedAsosPrivate = 0;

    for (const p of products) {
        const name = (p.name || '').trim();
        const nameLower = name.toLowerCase();

        // 1. MIX MATCH
        if (nameLower.includes('mix match') || nameLower.includes('mix & match')) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            deletedMixed++;
            continue;
        }

        // 2. Couleur comme titre
        if (COLOR_RE.test(name)) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            deletedColor++;
            continue;
        }

        // 3. Identification de la marque (Re-scan avec la nouvelle liste)
        const detectedBrand = getProductBrand(name, p.sourceBrand);
        const isAsosPrivate = !detectedBrand ||
            ['asos', 'global partner', 'collusion', 'reclaimed vintage', 'topman', 'topshop'].some(b => detectedBrand.toLowerCase().includes(b));

        // 4. Supprimer si c'est du ASOS pur (demandé par l'user)
        if (isAsosPrivate && p.sourceBrand === 'Global Partner') {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            deletedAsosPrivate++;
            continue;
        }

        // 5. Générique sans marque
        if (!detectedBrand && GENERIC_FASHION_RE.test(name)) {
            await prisma.trendProduct.delete({ where: { id: p.id } });
            deletedGenericNoBrand++;
            continue;
        }

        // 6. Mise à jour du nom et de la marque si besoin
        if (detectedBrand && detectedBrand !== p.productBrand) {
            const cleanName = cleanProductName(name, detectedBrand);
            await prisma.trendProduct.update({
                where: { id: p.id },
                data: {
                    productBrand: detectedBrand,
                    name: cleanName
                }
            });
            updatedBrand++;
        }
    }

    console.log(`\n✅ Nettoyage terminé :`);
    console.log(`- ${deletedMixed} MIX MATCH supprimés`);
    console.log(`- ${deletedColor} titres-couleurs supprimés`);
    console.log(`- ${deletedAsosPrivate} articles ASOS private label supprimés`);
    console.log(`- ${deletedGenericNoBrand} génériques sans marque supprimés`);
    console.log(`- ${updatedBrand} marques corrigées/identifiées`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
