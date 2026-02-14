import Link from 'next/link';
import { ArrowRight, Sparkles, Calendar, User, Clock, Newspaper } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { AnimatedHeader } from '@/components/homepage/AnimatedHeader';
import { Footer } from '@/components/homepage/Footer';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Blog Mode & Stratégie | OUTFITY',
  description: 'Tout l\'actualité du secteur, tendances et stratégies des marques qui réussissent.',
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-white">
      <AnimatedHeader />

      <main>
        {/* Minimal Editorial Hero */}
        <section className="bg-white pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[#F5F5F7] -z-10 translate-y-[-50%] rounded-[100px]" />
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#007AFF] mb-8">Magazine Industriel</span>
              <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight text-black leading-[0.85] mb-12">
                Le radar <br />
                <span className="text-[#6e6e73]/20 italic font-serif">OUTFITY</span>
              </h1>
              <p className="text-xl sm:text-2xl text-[#6e6e73] font-medium leading-relaxed max-w-2xl px-4 italic">
                La confluence de la data, de la mode et de la stratégie.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Story - Magazine Style */}
        {posts.length > 0 && (
          <section className="py-12 px-6 max-w-7xl mx-auto">
            <Link href={`/blog/${posts[0].slug}`} className="group relative block overflow-hidden rounded-[60px] bg-black aspect-[21/10]">
              {posts[0].coverImage && (
                <img
                  src={posts[0].coverImage}
                  alt={posts[0].title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-[2000ms] group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-12 sm:p-24 lg:p-32">
                <div className="max-w-4xl space-y-8">
                  <div className="flex items-center gap-4 text-white/60 text-xs font-black uppercase tracking-widest">
                    <span className="px-3 py-1 rounded bg-[#007AFF] text-white">À LA UNE</span>
                    <span>•</span>
                    <span>{posts[0].author}</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-none tracking-tighter group-hover:text-[#007AFF] transition-colors">
                    {posts[0].title}
                  </h2>
                  <p className="text-white/60 text-xl font-medium line-clamp-2 max-w-2xl">
                    {posts[0].excerpt}
                  </p>
                  <div className="inline-flex items-center gap-4 text-white font-black uppercase tracking-widest text-sm pt-4">
                    Explorer l'analyse <ArrowRight className="w-5 h-5 group-hover:translate-x-4 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Asymmetric Article Grid */}
        <section className="py-24 lg:py-40">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-y-24 gap-x-12">
            {posts.slice(1).map((post, index) => (
              <div key={post.id} className={cn(
                "md:col-span-12 lg:col-span-6 group",
                index % 3 === 0 && "lg:col-span-7",
                index % 3 === 1 && "lg:col-span-5 pt-20",
                index % 3 === 2 && "lg:col-span-12 flex flex-col md:flex-row gap-12 border-y border-black/5 py-32 mt-20"
              )}>
                <Link href={`/blog/${post.slug}`} className={cn(
                  "block space-y-8",
                  index % 3 === 2 && "flex flex-col md:flex-row gap-12 w-full"
                )}>
                  <div className={cn(
                    "relative overflow-hidden rounded-[40px] bg-[#F5F5F7]",
                    index % 3 === 2 ? "md:w-1/2 aspect-[16/10]" : "aspect-[4/3]"
                  )}>
                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute top-8 left-8">
                      <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-[#007AFF]">
                        DÉCRYPTAGE
                      </span>
                    </div>
                  </div>

                  <div className={cn(
                    index % 3 === 2 ? "md:w-1/2 flex flex-col justify-center" : "space-y-6"
                  )}>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#6e6e73]/60">
                      <span>{new Date(post.publishedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-[#007AFF]" />
                      <span>{post.author}</span>
                    </div>
                    <h3 className={cn(
                      "font-black text-black tracking-tight leading-tight group-hover:text-[#007AFF] transition-colors",
                      index % 3 === 2 ? "text-4xl sm:text-6xl" : "text-3xl sm:text-4xl"
                    )}>
                      {post.title}
                    </h3>
                    <p className="text-lg text-[#6e6e73] font-medium leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="pt-4 overflow-hidden">
                      <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black group-hover:gap-4 transition-all">
                        Lire la suite <ArrowRight className="w-5 h-5 text-[#007AFF]" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Industry Newsletter Style CTA */}
        <section className="bg-black py-32 sm:py-48 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#007AFF] blur-[200px] opacity-10" />
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="max-w-3xl mx-auto space-y-12">
              <Sparkles className="w-16 h-16 text-[#007AFF] mx-auto opacity-50" />
              <h2 className="text-4xl sm:text-6xl font-black text-white leading-none tracking-tight">
                REJOIGNEZ <br />
                <span className="text-[#6e6e73]">L'ÉLITE DU SECTEUR</span>
              </h2>
              <p className="text-white/60 text-xl font-medium">
                OUTFITY n'est pas qu'un outil. C'est votre veille stratégique automatisée. Chaque article ici met à jour les algorithmes pour nos membres VIP.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
                <Link href="/auth/signup" className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-full hover:bg-[#007AFF] hover:text-white transition-all transform hover:scale-110">
                  Commencer maintenant
                </Link>
                <Link href="/#pricing-section" className="text-white/40 font-black uppercase tracking-[0.2em] text-xs hover:text-white transition-colors">
                  Voir les plans premium
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
