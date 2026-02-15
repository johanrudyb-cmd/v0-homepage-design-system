import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60; // Set max duration for Vercel/Serverless to 60s
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    console.log('[N8N_WEBHOOK] Received request...');

    try {
        // 1. Validation du secret n8n
        const authHeader = req.headers.get('x-n8n-secret');
        const secret = process.env.N8N_WEBHOOK_SECRET;

        // Log pour debug (attention à ne pas logger le secret en entier en prod si possible)
        console.log('[N8N_WEBHOOK] Auth Check:', authHeader ? 'Present' : 'Missing');

        if (!secret || authHeader !== secret) {
            console.error('[N8N_WEBHOOK] Authorization Failed');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parsing du body
        let body;
        try {
            body = await req.json();
            console.log('[N8N_WEBHOOK] Body Parsed successfully, Slug:', body.slug);
        } catch (e) {
            console.error('[N8N_WEBHOOK] Error parsing JSON body:', e);
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const {
            title,
            slug,
            excerpt,
            content,
            coverImage,
            published = true,
            tags = [],
            author = 'OUTFITY Intelligence',
            relatedBrands = [],
            sourceUrl
        } = body;

        // 3. Validation des champs requis
        if (!title || !slug || !content) {
            console.error('[N8N_WEBHOOK] Missing fields. Title:', !!title, 'Slug:', !!slug, 'Content:', !!content);
            return NextResponse.json({ error: 'Missing required fields: title, slug, or content' }, { status: 400 });
        }

        // 4. Opération Base de Données (Upsert)
        console.log('[N8N_WEBHOOK] Starting Database Upsert for slug:', slug);

        try {
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
                    sourceUrl
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
                    sourceUrl
                },
            });

            console.log(`[N8N_WEBHOOK] Success! Post ID: ${post.id}`);

            return NextResponse.json({
                success: true,
                postId: post.id,
                slug: post.slug,
                url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`
            }, { status: 200 });

        } catch (dbError) {
            console.error('[N8N_WEBHOOK] Database Error during Upsert:', dbError);
            // Retourner une erreur 500 propre
            return NextResponse.json({ error: 'Database error during save', details: String(dbError) }, { status: 500 });
        }

    } catch (error) {
        console.error('[N8N_WEBHOOK_CRITICAL_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
