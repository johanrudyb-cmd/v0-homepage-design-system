import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        // Validation du secret n8n
        const authHeader = req.headers.get('x-n8n-secret');
        const secret = process.env.N8N_WEBHOOK_SECRET;

        if (!secret || authHeader !== secret) {
            return NextResponse.json({ error: 'Unauthorized : Invalid secret' }, { status: 401 });
        }

        const body = await req.json();
        const {
            title,
            slug,
            excerpt,
            content,
            coverImage,
            published = true,
            tags = [],
            author = 'OUTFITY Intelligence',
            relatedBrands = []
        } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Missing required fields: title, slug, or content' }, { status: 400 });
        }

        // Upsert : crée si n'existe pas, met à jour si existe déjà (basé sur le slug)
        const post = await prisma.blogPost.upsert({
            where: { slug },
            update: {
                title,
                excerpt,
                content,
                coverImage,
                published,
                publishedAt: published ? new Date() : undefined,
                tags,
                author,
                relatedBrands,
            },
            create: {
                title,
                slug,
                excerpt,
                content,
                coverImage,
                author,
                published,
                publishedAt: published ? new Date() : undefined,
                tags,
                relatedBrands,
            },
        });

        console.log(`[N8N_BLOG_WEBHOOK] Blog post ${post.id} processed successfully (slug: ${slug})`);

        return NextResponse.json({
            success: true,
            postId: post.id,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${slug}`
        });

    } catch (error) {
        console.error('[N8N_BLOG_WEBHOOK_ERROR]', error);
        return NextResponse.json({ error: 'Internal Error during webhook processing' }, { status: 500 });
    }
}
