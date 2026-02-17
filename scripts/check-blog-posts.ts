
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking database connection...');
    try {
        const count = await prisma.blogPost.count();
        console.log(`Total posts: ${count}`);

        const publishedCount = await prisma.blogPost.count({
            where: { published: true }
        });
        console.log(`Published posts: ${publishedCount}`);

        if (publishedCount > 0) {
            const posts = await prisma.blogPost.findMany({
                where: { published: true },
                take: 3,
                select: { title: true, slug: true, published: true, publishedAt: true }
            });
            console.log('Sample published posts:', JSON.stringify(posts, null, 2));
        } else {
            console.log('No published posts found.');

            const drafts = await prisma.blogPost.findMany({
                take: 3,
                select: { title: true, published: true }
            });
            console.log('Sample drafts:', JSON.stringify(drafts, null, 2));
        }

    } catch (e) {
        console.error('Database error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
