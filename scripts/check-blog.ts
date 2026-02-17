
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DIAGNOSTIC BLOG POSTS ---');

    const count = await prisma.blogPost.count();
    console.log(`Total Posts in DB: ${count}`);

    const posts = await prisma.blogPost.findMany({
        select: {
            id: true,
            title: true,
            published: true,
            publishedAt: true,
            author: {
                select: { email: true }
            }
        }
    });

    if (posts.length === 0) {
        console.log('❌ AUCUN article trouvé.');
    } else {
        posts.forEach(post => {
            console.log(`[${post.published ? '✅ PUBLIÉ' : '🛑 BROUILLON'}] ${post.title} (ID: ${post.id})`);
            console.log(`   Author: ${post.author?.email} | Date: ${post.publishedAt}`);
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
