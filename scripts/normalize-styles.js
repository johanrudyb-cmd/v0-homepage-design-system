
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log('🧹 NORMALISATION DES DOSSIERS (TYPE + MATIÈRE)...');
    try {
        const products = await prisma.trendProduct.findMany({
            where: { lastScan: "Vision Analysis" }
        });

        console.log(`📦 Traitement de ${products.length} produits analysés par Vision...`);

        for (const product of products) {
            const tags = product.visualTags;
            if (!tags) continue;

            const type = tags.type || 'Article';
            const material = tags.material || '';
            const styleAttribute = tags.style || '';

            // On privilégie la matière comme demandé, sinon le style/coupe
            let attribute = material ? `en ${material}` : styleAttribute;

            // Si l'attribut est déjà contenu dans le type (ex: "Bomber" et "Veste Bomber"), on évite la répétition
            let finalName = `${type} ${attribute}`.trim();

            // Nettoyage final (pas de couleurs, pas de blabla)
            finalName = finalName.replace(/bleu|noir|blanc|rouge|vert|jaune|rose|gris/gi, '').trim();
            finalName = finalName.replace(/\s+/g, ' ');

            await prisma.trendProduct.update({
                where: { id: product.id },
                data: {
                    style: finalName
                }
            });
            console.log(`✅ ${product.name} -> ${finalName}`);
        }
        console.log('✨ Systèmes de dossiers harmonisé.');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
