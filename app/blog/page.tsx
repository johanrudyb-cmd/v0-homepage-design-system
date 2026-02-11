import Link from 'next/link';
import { ArrowLeft, FileText, TrendingUp, Sparkles, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Blog Stratégies | OUTFITY',
  description: 'Actualités, tendances et stratégies des marques qui réussissent. Notre IA adapte votre positionnement en temps réel grâce à notre veille sectorielle.',
};

export default async function BlogPage() {
  // Récupérer les articles de blog depuis la base de données
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="bg-white border-b border-[#F2F2F2] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#6e6e73] hover:text-[#007AFF] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
            <Link
              href="/auth/signin"
              className="px-4 py-2 rounded-lg bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#007AFF]/90 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 pb-20">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center">
              <FileText className="w-7 h-7 text-[#007AFF]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#1D1D1F]">Blog Stratégies</h1>
              <p className="text-[#6e6e73] text-sm mt-1">
                Actualités, tendances et stratégies des marques qui réussissent
              </p>
            </div>
          </div>
        </div>

        {/* AI Strategy Update Banner */}
        <Card className="mb-10 border-2 border-[#007AFF]/20 bg-gradient-to-r from-[#007AFF]/5 to-[#007AFF]/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#007AFF]/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-[#007AFF]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-[#1D1D1F] mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#007AFF]" />
                  Vos stratégies évoluent automatiquement avec le marché
                </h3>
                <p className="text-sm text-[#6e6e73] leading-relaxed">
                  Les articles de ce blog alimentent notre <strong>IA qui met à jour automatiquement</strong> les stratégies de nos utilisateurs premium.
                  Chaque nouvelle tendance, chaque actualité pertinente concernant votre marque de référence est intégrée à votre positionnement pour garder votre stratégie toujours à jour.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-white/50 border border-[#007AFF]/10">
                  <p className="text-xs text-[#6e6e73]">
                    <strong className="text-[#1D1D1F]">💡 Stratégie vivante :</strong> Contrairement aux consultants traditionnels qui vous livrent un document figé,
                    OUTFITY adapte votre stratégie en continu selon l'évolution de votre secteur et de votre marque de référence.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles Grid */}
        {posts.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-[#1D1D1F] mb-2">Articles à venir</h3>
              <p className="text-[#6e6e73] max-w-md mx-auto">
                Nos premiers articles sur les stratégies des marques de référence (Nike, Patagonia, Supreme, etc.) arrivent bientôt !
              </p>
              <p className="text-sm text-[#6e6e73] mt-4">
                En attendant, découvrez nos{' '}
                <Link href="/#features" className="text-[#007AFF] hover:underline font-medium">
                  fonctionnalités
                </Link>
                {' '}ou{' '}
                <Link href="/auth/signin" className="text-[#007AFF] hover:underline font-medium">
                  créez votre compte
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg hover:border-[#007AFF]/30 transition-all cursor-pointer">
                  {post.coverImage && (
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-xs text-[#6e6e73] mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.publishedAt).toLocaleDateString('fr-FR')}</span>
                      <span>•</span>
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>
                    <CardTitle className="text-base line-clamp-2 text-[#1D1D1F]">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#6e6e73] line-clamp-3">{post.excerpt}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
