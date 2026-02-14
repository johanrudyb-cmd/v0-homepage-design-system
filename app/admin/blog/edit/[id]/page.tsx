import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BlogPostForm } from '@/components/blog/BlogPostForm';

interface EditBlogPostPageProps {
    params: Promise<{
        id: string;
    }>;
}

export const metadata = {
    title: 'Modifier l\'article | Admin Blog',
};

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
        where: { id },
    });

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] p-6 pb-20">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[#1D1D1F] mb-8">Modifier l'article</h1>
                <BlogPostForm initialData={post} />
            </div>
        </div>
    );
}
