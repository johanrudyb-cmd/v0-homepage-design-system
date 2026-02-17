
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPosts() {
    console.log('--- VÉRIFICATION DES ARTICLES ---');
    console.log('DATABASE_URL utilisée :', process.env.DATABASE_URL);

    try {
        const count = await prisma.blogPost.count();
        console.log(`Nombre total d'articles trouvés : ${count}`);

        const posts = await prisma.blogPost.findMany({
            take: 5,
            select: { id: true, title: true, published: true }
        });

        console.log('Aperçu des 5 derniers articles :', posts);

    } catch (error) {
        console.error('❌ ERREUR PRISMA :', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPosts();
