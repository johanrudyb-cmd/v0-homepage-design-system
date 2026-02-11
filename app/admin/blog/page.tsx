import Link from 'next/link';
import { ArrowLeft, Plus, FileText, CheckCircle2, Clock, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    published: boolean;
    createdAt: Date;
    relatedBrands: string[];
}

export const metadata = {
    title: 'Admin Blog | OUTFITY',
};

export default async function AdminBlogPage() {
    const user = await getCurrentUser();
    // Protection basique : seul l'email admin peut accéder (à adapter selon votre logique admin)
    const isAdmin = user?.email === 'johanrudyb@gmail.com' || user?.email?.endsWith('@biangory.com');

    if (!isAdmin) {
        redirect('/dashboard');
    }

    const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    return (
        <div className="min-h-screen bg-[#F5F5F7]">
            <header className="bg-white border-b border-[#F2F2F2] sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-sm text-[#6e6e73] hover:text-[#007AFF] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour au Dashboard
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/blog" target="_blank">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Globe className="w-4 h-4" />
                                    Voir le blog public
                                </Button>
                            </Link>
                            <Link href="/admin/blog/new">
                                <Button size="sm" className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Nouvel article
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10 pb-20">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-[#1D1D1F] mb-2">Gestion du Blog</h1>
                    <p className="text-[#6e6e73]">Créez et gérez vos articles pour le SEO et les mises à jour IA.</p>
                </div>

                <div className="grid gap-6">
                    {posts.length === 0 ? (
                        <Card className="border-dashed border-2">
                            <CardContent className="py-20 text-center">
                                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-semibold text-[#1D1D1F]">Aucun article pour le moment</h3>
                                <p className="text-[#6e6e73] mb-6">Commencez par créer votre premier article pour booster votre SEO.</p>
                                <Link href="/admin/blog/new">
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        Créer mon premier article
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        posts.map((post: BlogPost) => (
                            <Card key={post.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                {post.published ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Publié
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                                                        <Clock className="w-3 h-3" />
                                                        Brouillon
                                                    </span>
                                                )}
                                                <span className="text-xs text-[#6e6e73]">
                                                    {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-bold text-[#1D1D1F] truncate mb-1">{post.title}</h2>
                                            <p className="text-sm text-[#6e6e73] line-clamp-1">{post.excerpt}</p>

                                            {post.relatedBrands && post.relatedBrands.length > 0 && (
                                                <div className="flex items-center gap-2 mt-3">
                                                    <span className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider">Mises à jour IA :</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {post.relatedBrands.map((brand: string) => (
                                                            <span key={brand} className="px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-[10px] font-bold uppercase">
                                                                {brand}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link href={`/admin/blog/edit/${post.id}`}>
                                                <Button variant="outline" size="sm">Modifier</Button>
                                            </Link>
                                            <Link href={`/blog/${post.slug}`} target="_blank">
                                                <Button variant="ghost" size="sm">
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Info Box */}
                <Card className="mt-12 bg-[#007AFF]/5 border-[#007AFF]/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#007AFF]" />
                            Comment fonctionnent les mises à jour IA ?
                        </CardTitle>
                        <CardDescription>
                            Le système de mise à jour automatique des stratégies se base sur le champ <strong>"Marques liées"</strong> (relatedBrands).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-[#1D1D1F]/70 space-y-2">
                        <p>1. Lorsque vous publiez un article, indiquez les marques de référence concernées (ex: <code>nike</code>, <code>patagonia</code>).</p>
                        <p>2. Chaque nuit, notre IA scanne les articles publiés dans les 7 derniers jours.</p>
                        <p>3. Pour chaque article, elle identifie les utilisateurs dont la stratégie est calquée sur ces marques.</p>
                        <p>4. Elle génère une mise à jour subtile de leur positionnement et les notifie sur leur dashboard.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
