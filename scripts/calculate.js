
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log('🔍 IA NICHE-HUNTER : DÉTECTION DES MICRO-TENDANCES...');
    try {
        const products = await prisma.trendProduct.findMany();
        console.log(`📦 Analyse de ${products.length} articles pour extraire des niches...`);

        for (const product of products) {
            const name = (product.name || "").toLowerCase();
            let category = 'AUTRE';

            // --- 1. DÉTECTION DES ATTRIBUTS DE NICHE ---

            // MATIERES
            let material = '';
            if (name.includes('cuir') || name.includes('leather')) material = 'Cuir';
            else if (name.includes('lin') || name.includes('linen')) material = 'Lin';
            else if (name.includes('denim') || name.includes('jean')) material = 'Denim';
            else if (name.includes('nylon') || name.includes('technique')) material = 'Nylon';
            else if (name.includes('maille') || name.includes('tricot')) material = 'Maille';
            else if (name.includes('velours')) material = 'Velours';
            else if (name.includes('satin')) material = 'Satin';

            // COUPES
            let cut = '';
            if (name.includes('oversize')) cut = 'Oversize';
            else if (name.includes('boxy')) cut = 'Boxy';
            else if (name.includes('cropped') || name.includes('crop')) cut = 'Crop';
            else if (name.includes('baggy')) cut = 'Baggy';
            else if (name.includes('relaxed')) cut = 'Relaxed';

            // TYPES SPECIFIQUES
            let type = '';
            if (name.includes('bomber')) type = 'Bomber';
            else if (name.includes('perfecto')) type = 'Perfecto';
            else if (name.includes('varsity')) type = 'Varsity Jacket';
            else if (name.includes('cargo')) type = 'Cargo';
            else if (name.includes('maillot') || name.includes('jersey')) type = 'Maillot';
            else if (name.includes('polo')) type = 'Polo';
            else if (name.includes('débardeur') || name.includes('tank')) type = 'Débardeur';
            else if (name.includes('chemise')) type = 'Chemise';
            else if (name.includes('hoodie')) type = 'Hoodie';
            else if (name.includes('veste') || name.includes('jacket')) type = 'Veste';
            else if (name.includes('t-shirt') || name.includes('tee')) type = 'T-shirt';
            else if (name.includes('pantalon')) type = 'Pantalon';

            // DETAILS DE STYLE (La Niche)
            let detail = '';
            if (name.includes('graphique') || name.includes('imprimé')) detail = 'Graphique';
            else if (name.includes('vintage') || name.includes('retro')) detail = 'Vintage';
            else if (name.includes('patchwork')) detail = 'Patchwork';
            else if (name.includes('brodé') || name.includes('embroidery')) detail = 'Brodé';
            else if (name.includes('délavé') || name.includes('acid wash')) detail = 'Délavé';
            else if (name.includes('racing') || name.includes('moto')) detail = 'Racing';

            // --- 2. CONSTRUCTION DE LA NICHE (Ex: "Veste Bomber en Cuir Vintage") ---
            // On assemble les morceaux pour créer un nom de dossier unique et rentable
            let nicheLabel = [type, cut, (material ? 'en ' + material : ''), detail].filter(Boolean).join(' ');

            // --- 3. CATEGORISATION TECHNIQUE (Pour les onglets) ---
            if (type === 'T-shirt' || type === 'Débardeur' || type === 'Polo' || type === 'Chemise') category = 'TSHIRT';
            else if (type === 'Veste' || type === 'Bomber' || type === 'Perfecto' || type === 'Varsity Jacket') category = 'JACKEX';
            else if (type === 'Pantalon' || type === 'Cargo') category = 'PANT';
            else if (name.includes('jean')) category = 'JEAN';
            else if (type === 'Hoodie' || name.includes('sweat')) category = 'SWEAT';
            else if (type === 'Maillot') category = 'JERSEY';

            // Fallback si rien n'est trouvé
            if (!nicheLabel) nicheLabel = name.split(' ').slice(0, 3).join(' ');

            await prisma.trendProduct.update({
                where: { id: product.id },
                data: {
                    category: category,
                    style: nicheLabel,
                    updatedAt: new Date()
                }
            });
        }
        console.log('✨ NICHES IDENTIFIÉES : Les dossiers sont désormais ultra-segmentés.');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
