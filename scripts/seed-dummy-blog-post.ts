
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding dummy blog post...');

    const existing = await prisma.blogPost.findUnique({
        where: { slug: 'exemple-strategie-nike' },
    });

    if (existing) {
        console.log('Dummy post already exists.');
        return;
    }

    await prisma.blogPost.create({
        data: {
            title: 'Comment Nike domine le marché avec sa stratégie Direct-to-Consumer',
            slug: 'exemple-strategie-nike',
            excerpt: 'Analyse détaillée de la transition de Nike vers le D2C et comment vous pouvez appliquer ces leçons à votre propre marque de mode.',
            content: `
# La stratégie D2C de Nike décryptée

Nike a radicalement transformé son modèle économique ces dernières années en privilégiant la vente directe (Direct-to-Consumer).

## Pourquoi ce changement ?

1. **Contrôle de la marque** : En vendant en direct, Nike contrôle l'expérience client de A à Z.
2. **Données clients** : La data récoltée permet une personnalisation poussée et une meilleure prévision des tendances.
3. **Marge supérieure** : Supprimer les intermédiaires augmente mécaniquement la rentabilité.

## Comment l'appliquer à votre marque ?

Même à petite échelle, vous pouvez :
- Privilégier votre boutique Shopify plutôt que les marketplaces au début.
- Construire une liste email propriétaire dès le jour 1.
- Créer du contenu exclusif pour vos clients directs.
      `,
            coverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop',
            published: true,
            publishedAt: new Date(),
            author: 'OUTFITY Strategy Team',
            tags: ['Strategy', 'DTC', 'Nike'],
            relatedBrands: ['nike'],
        },
    });

    console.log('Dummy blog post created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
