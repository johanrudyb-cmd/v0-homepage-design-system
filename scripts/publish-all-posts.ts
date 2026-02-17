
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Passage de tous les articles en mode PUBLIÉ...');

    const result = await prisma.blogPost.updateMany({
        where: { published: false },
        data: {
            published: true,
            publishedAt: new Date() // Met à jour la date de publication à maintenant
        }
    });

    console.log(`✅ ${result.count} articles ont été publiés avec succès !`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
