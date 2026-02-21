const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.blogPost.count();
        console.log(`Nombre d'articles de blog : ${count}`);

        if (count > 0) {
            const posts = await prisma.blogPost.findMany({ take: 1 });
            console.log('Premier article :', posts[0].title);
        }
    } catch (e) {
        console.error('Erreur :', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
