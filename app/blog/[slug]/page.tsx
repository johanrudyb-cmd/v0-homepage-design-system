import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import Markdown from 'react-markdown';

export const revalidate = 3600; // Revalidate every hour

interface BlogPostPageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: BlogPostPageProps) {
    const post = await prisma.blogPost.findUnique({
        where: { slug: params.slug },
    });

    if (!post) {
        return {
            title: 'Article non trouvé | OUTFITY',
        };
    }

    return {
        title: `${post.title} | Blog OUTFITY`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.coverImage ? [post.coverImage] : [],
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const post = await prisma.blogPost.findUnique({
        where: { slug: params.slug },
    });

    // En prod, on ne montre que les articles publiés. En dev, on peut voir les brouillons si on connait le slug (discutable, mais pratique)
    // Ici j'ajoute une sécu simple
    const isProd = process.env.NODE_ENV === 'production';
    if (!post || (isProd && !post.published)) {
        notFound();
    }

    // Articles suggérés (les 3 plus récents sauf celui-ci)
    const suggestedPosts = await prisma.blogPost.findMany({
        where: {
            published: true,
            id: { not: post.id },
        },
        orderBy: { publishedAt: 'desc' },
        take: 3,
    });

    return (
        <div className="min-h-screen bg-[#F5F5F7]">
            <header className="bg-white border-b border-[#F2F2F2] sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-sm text-[#6e6e73] hover:text-[#007AFF] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour au blog
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10 pb-20">
                <article>
                    {post.coverImage && (
                        <div className="rounded-2xl overflow-hidden mb-8 shadow-lg aspect-[21/9]">
                            <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="mb-8">
                        <div className="flex items-center gap-4 text-sm text-[#6e6e73] mb-4">
                            <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-[#E5E5E5]">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-[#E5E5E5]">
                                <User className="w-3.5 h-3.5" />
                                {post.author}
                            </span>
                            <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-[#E5E5E5]">
                                <Clock className="w-3.5 h-3.5" />
                                {Math.max(1, Math.ceil(post.content.length / 1000))} min de lecture
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] leading-tight mb-6">
                            {post.title}
                        </h1>

                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-sm font-medium"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="prose prose-lg prose-slate max-w-none bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-[#F2F2F2]">
                        <Markdown>{post.content}</Markdown>
                    </div>
                </article>

                {suggestedPosts.length > 0 && (
                    <div className="mt-20 border-t border-[#E5E5E5] pt-12">
                        <h2 className="text-2xl font-bold text-[#1D1D1F] mb-8">Continuer la lecture</h2>
                        <div className="grid gap-6 md:grid-cols-3">
                            {suggestedPosts.map((suggested) => (
                                <Link key={suggested.id} href={`/blog/${suggested.slug}`}>
                                    <Card className="h-full hover:shadow-lg hover:border-[#007AFF]/30 transition-all cursor-pointer group">
                                        {suggested.coverImage && (
                                            <div className="aspect-video bg-muted relative overflow-hidden rounded-t-xl">
                                                <img
                                                    src={suggested.coverImage}
                                                    alt={suggested.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}
                                        <CardContent className="p-5">
                                            <div className="text-xs text-[#6e6e73] mb-2">
                                                {new Date(suggested.publishedAt).toLocaleDateString('fr-FR')}
                                            </div>
                                            <h3 className="font-bold text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors line-clamp-2 mb-2">
                                                {suggested.title}
                                            </h3>
                                            <div className="flex items-center text-[#007AFF] text-sm font-medium mt-auto">
                                                Lire l'article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
