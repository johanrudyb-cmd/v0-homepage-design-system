import Link from 'next/link';
import { ArrowRight, FileText, Badge } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

export async function BlogGrid() {
    const posts = await prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        take: 3,
    });

    if (posts.length === 0) return null;

    return (
        <section className="py-24 bg-[#F5F5F7]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl font-bold tracking-tight text-[#1D1D1F] sm:text-5xl mb-4">
                            Dernières stratégies
                        </h2>
                        <p className="text-lg text-[#6e6e73]">
                            Découvrez les analyses des marques qui cartonnent et comment elles sont intégrées à notre IA.
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className="group flex items-center gap-2 text-[#007AFF] font-semibold hover:text-[#007AFF]/80 transition-colors"
                    >
                        Voir tous les articles
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {posts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                            <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-3xl">
                                {post.coverImage && (
                                    <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <CardContent className="p-8 flex flex-col h-full">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs font-semibold text-[#007AFF] bg-[#007AFF]/10 px-3 py-1 rounded-full uppercase tracking-wide">
                                            Stratégie
                                        </span>
                                        <span className="text-xs text-[#6e6e73]">
                                            {new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-[#1D1D1F] mb-3 line-clamp-2 group-hover:text-[#007AFF] transition-colors">
                                        {post.title}
                                    </h3>

                                    <p className="text-sm text-[#6e6e73] line-clamp-3 mb-6 flex-1 leading-relaxed">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-medium text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors mt-auto">
                                        Lire l'analyse
                                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
