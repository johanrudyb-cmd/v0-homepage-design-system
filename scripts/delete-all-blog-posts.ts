
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️ Suppression de tous les articles de blog...');

    const deleted = await prisma.blogPost.deleteMany({});

    console.log(`✅ ${deleted.count} articles ont été supprimés avec succès.`);
}

main()
    .catch((e) => {
        console.error('💥 Erreur lors de la suppression :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
