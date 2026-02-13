import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        const isAdmin = user?.email === 'johanrudyb@gmail.com' || user?.email?.endsWith('@biangory.com');

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, slug, excerpt, content, coverImage, published, tags, relatedBrands } = body;

        // Check slug uniqueness (if changed)
        const existing = await prisma.blogPost.findUnique({
            where: { slug },
        });

        if (existing && existing.id !== params.id) {
            return NextResponse.json({ message: 'Ce slug est déjà pris par un autre article.' }, { status: 400 });
        }

        const post = await prisma.blogPost.update({
            where: { id: params.id },
            data: {
                title,
                slug,
                excerpt,
                content,
                coverImage,
                published,
                // Update publishedAt only if it was not published before and is now published
                publishedAt: published && !existing?.published ? new Date() : undefined,
                tags: tags || [],
                relatedBrands: relatedBrands || [],
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('[BLOG_PUT]', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        const isAdmin = user?.email === 'johanrudyb@gmail.com' || user?.email?.endsWith('@biangory.com');

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.blogPost.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[BLOG_DELETE]', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
