'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { proxyImageUrl } from '@/lib/image-proxy';
import { Flame, Lock, Music, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { BrandLogo } from '@/components/brands/BrandLogo';
import { getBrandLogoUrl, getBrandKey } from '@/lib/curated-brands';
import { REFERENCE_BRAND_WEBSITES } from '@/lib/constants/audience-reference-brands';
import { motion, AnimatePresence } from 'framer-motion';
import { UsageBadge } from '@/components/trends/UsageBadge';
import { safeDisplayBrand } from '@/lib/constants/retailer-exclusion';

/** Badge de viralité selon le trendScore */
function getViralityBadge(score: number): { emoji: string; label: string; color: string } {
  if (score >= 90) return { emoji: '🔥', label: 'Viral TikTok', color: '#FF3B30' };
  if (score >= 80) return { emoji: '📈', label: 'Tendance Instagram', color: '#007AFF' };
  if (score >= 70) return { emoji: '⚡', label: 'En montée', color: '#FF9500' };
  return { emoji: '🌱', label: 'Émergent', color: '#34C759' };
}

const getRefWebsite = (brandName: string) => {
  const k = getBrandKey(brandName || '');
  return Object.entries(REFERENCE_BRAND_WEBSITES).find(([name]) => getBrandKey(name) === k)?.[1];
};

interface TrendProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  style: string;
  imageUrl: string | null;
  segment: string;
  ageRange?: string; // '18-24' ou '25-34'
  zone: string;
  trendScore?: number;
  trendGrowthPercent?: number;
}

export function TrendsByMarket({ initialTrends }: { initialTrends?: TrendProduct[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as any;
  const [isVisible, setIsVisible] = useState(false);
  const [trends, setTrends] = useState<TrendProduct[]>(initialTrends || []);
  const [loading, setLoading] = useState(!initialTrends);
  const [analysesCount, setAnalysesCount] = useState<number | null>(null);
  const [homepageIds, setHomepageIds] = useState<Set<string>>(new Set(initialTrends?.map(t => t.id).filter(Boolean) as string[] || []));

  // Charger les tendances et les infos utilisateur
  useEffect(() => {
    const loadTrends = async () => {
      // Si on a déjà des tendances (via SSR), on ne recharge pas sauf si c'est vide
      if (trends.length === 0) {
        setLoading(true);
        try {
          const trendsRes = await fetch('/api/trends/homepage-featured');

          if (trendsRes.ok) {
            const trendsData = await trendsRes.json();
            const trendsList = trendsData.trends || [];
            setTrends(trendsList);
            const ids = trendsList.map((t: TrendProduct) => t.id).filter(Boolean);
            setHomepageIds(new Set(ids));
          }
        } catch (error) {
          console.error('Erreur lors du chargement des tendances:', error);
        } finally {
          setLoading(false);
        }
      }

      // Toujours vérifier le quota d'analyses si plan free
      if (user?.plan === 'free') {
        try {
          const analysesRes = await fetch('/api/trends/analyses-count');
          if (analysesRes.ok) {
            const analysesData = await analysesRes.json();
            setAnalysesCount(analysesData.count || 0);
          }
        } catch (e) {
          console.error('Erreur quota analyses:', e);
        }
      }
    };

    loadTrends();
  }, [user?.plan, initialTrends]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('trends-by-market');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const displayedTrends = (() => {
    // Fonction pour diversifier les marques (Round Robin simplifié)
    const diversifyByBrand = (list: TrendProduct[], limit: number) => {
      const result: TrendProduct[] = [];
      const buckets: Record<string, TrendProduct[]> = {};

      // Grouper par marque
      list.forEach(item => {
        const b = item.brand.toLowerCase();
        if (!buckets[b]) buckets[b] = [];
        buckets[b].push(item);
      });

      // Piocher une marque à la fois
      let brandNames = Object.keys(buckets);
      let brandIdx = 0;
      while (result.length < limit && brandNames.length > 0) {
        if (brandIdx >= brandNames.length) brandIdx = 0;

        const currentBrand = brandNames[brandIdx];
        const bucket = buckets[currentBrand];

        if (bucket && bucket.length > 0) {
          const product = bucket.shift();
          if (product) result.push(product);
        }

        if (!bucket || bucket.length === 0) {
          brandNames.splice(brandIdx, 1);
        } else {
          brandIdx = (brandIdx + 1) % brandNames.length;
        }
      }
      return result;
    };

    // Par défaut : Mix 2 Hommes / 2 Femmes (format fixe pour TikTok style)
    const men = diversifyByBrand(trends.filter(t => t.segment === 'homme'), 2);
    const women = diversifyByBrand(trends.filter(t => t.segment === 'femme'), 2);

    return [...men, ...women];
  })();

  const handleAnalyzeClick = (e: React.MouseEvent, trendId: string) => {
    e.preventDefault();

    if (!user) {
      router.push('/auth/signin?redirect=/trends/' + trendId);
      return;
    }

    if (user.plan === 'free' && analysesCount !== null && analysesCount >= 3) {
      router.push('/auth/choose-plan');
      return;
    }

    router.push(`/trends/${trendId}`);
  };

  return (
    <section id="trends-by-market" className="py-12 sm:py-24 lg:py-32 bg-white border-t border-black/[0.03]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* En-tête avec titre et indicateur */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 lg:mb-20">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-black leading-[0.9] max-w-2xl">
              Tendances sur TikTok
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
              <span className="text-[12px] font-bold uppercase tracking-widest text-[#007AFF]">
                Détection & Analyse des produits viraux en temps réel
              </span>
            </div>
          </div>

          {/* Credit System Display */}
          <UsageBadge count={analysesCount} plan={user?.plan || 'free'} />
        </div>

        {/* Grille de produits animée */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-black/5 border-t-black rounded-full animate-spin" />
            <p className="text-sm font-bold text-[#6e6e73] uppercase tracking-widest">Initialisation du Radar...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {displayedTrends.map((product, index) => {
                const segmentLabel = product.segment === 'homme' ? 'Homme' : 'Femme';
                const isFree = user?.plan === 'free';
                const isPubliclyVisible = !isFree || homepageIds.has(product.id);

                return (
                  <motion.div
                    layout
                    key={`${product.id}-${index}`}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05,
                      ease: [0.23, 1, 0.32, 1]
                    }}
                    className="group relative"
                  >
                    <div className="bg-white rounded-[32px] overflow-hidden transition-all duration-500 shadow-apple border border-black/[0.03] flex flex-col h-full hover:shadow-apple-lg hover:-translate-y-2">
                      {isFree && !isPubliclyVisible && (
                        <div className="absolute inset-0 z-40 bg-white/40 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mb-6 shadow-apple">
                            <Lock className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="text-lg font-black text-black mb-4 tracking-tight">Rapport Privé</h4>
                          <Link
                            href="/auth/signup"
                            className="w-full py-3 bg-black text-white rounded-full text-xs font-bold hover:bg-black/90 transition-all active:scale-95 shadow-xl"
                          >
                            Accès Gratuit
                          </Link>
                        </div>
                      )}

                      <div className={cn("relative flex flex-col h-full bg-white", isFree && !isPubliclyVisible ? 'opacity-10 grayscale' : '')}>
                        <div className="relative aspect-[9/16] overflow-hidden bg-black group-hover:rounded-b-none transition-all">
                          <img
                            src={product.imageUrl || ''}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const proxied = proxyImageUrl(product.imageUrl || '');
                              if (proxied && target.src !== proxied) target.src = proxied;
                            }}
                          />

                          {/* Gradient en bas pour lire le texte proprement */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />

                          {/* Interface "TikTok" - Actions à droite */}
                          <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4">
                            <div className="flex flex-col items-center gap-1 group/btn cursor-pointer">
                              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-transform group-hover/btn:scale-110 border border-white/5">
                                <Heart className="w-5 h-5 text-white fill-white" />
                              </div>
                              <span className="text-white text-[10px] font-bold drop-shadow-md">
                                {Math.floor((product.trendScore || 0) * 12.5)}K
                              </span>
                            </div>

                            <div className="flex flex-col items-center gap-1 group/btn cursor-pointer">
                              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-transform group-hover/btn:scale-110 border border-white/5">
                                <MessageCircle className="w-5 h-5 text-white fill-white" />
                              </div>
                              <span className="text-white text-[10px] font-bold drop-shadow-md">
                                {Math.floor((product.trendScore || 0) * 2.1)}
                              </span>
                            </div>

                            <div className="flex flex-col items-center gap-1 group/btn cursor-pointer">
                              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-transform group-hover/btn:scale-110 border border-white/5">
                                <Bookmark className="w-5 h-5 text-white fill-white" />
                              </div>
                              <span className="text-white text-[10px] font-bold drop-shadow-md">
                                {Math.floor((product.trendScore || 0) * 4.3)}
                              </span>
                            </div>

                            <div className="flex flex-col items-center gap-1 group/btn cursor-pointer">
                              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-transform group-hover/btn:scale-110 border border-white/5">
                                <Share2 className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-white text-[10px] font-bold drop-shadow-md">Partager</span>
                            </div>
                          </div>

                          {/* Disque Musique - TikTok style */}
                          <div className="absolute right-3 bottom-6 z-20">
                            <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center border-4 border-[#2c2c2c] animate-[spin_4s_linear_infinite]">
                              <Music className="w-4 h-4 text-white" />
                            </div>
                          </div>

                          {/* Infos Produit en bas à gauche */}
                          <div className="absolute left-4 bottom-6 right-16 z-20">
                            {(() => {
                              const score = product.trendScore || 0;
                              const badge = getViralityBadge(score);
                              const brand = safeDisplayBrand(product.brand) || product.brand || 'Marque Inconnue';

                              return (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#007AFF] to-purple-500 p-[2px] shadow-lg">
                                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                        <img
                                          src={getBrandLogoUrl(brand) || proxyImageUrl(product.imageUrl || '') || ''}
                                          alt={brand}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + brand + '&background=random&color=fff';
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <span className="text-[13px] font-bold text-white drop-shadow-md flex items-center gap-1">
                                      @{brand.replace(/\s+/g, '').toLowerCase()}_style
                                      <div className="w-3.5 h-3.5 bg-[#20D5EC] rounded-full flex items-center justify-center">
                                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    </span>
                                  </div>

                                  <div className="text-[12px] text-white/95 font-medium leading-snug line-clamp-2 drop-shadow-md pr-2">
                                    Grosse pépite que je viens de trouver ! 🤯 {product.category.toLowerCase()} incroyable 🔥
                                    <span className="font-bold text-white ml-1 hover:underline cursor-pointer opacity-80">
                                      #OutfityTrends #{brand.replace(/\s+/g, '').toLowerCase()}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap pt-1">
                                    <span
                                      className="px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md border border-white/10 shadow-lg"
                                      style={{ color: badge.color }}
                                    >
                                      {badge.emoji} {badge.label}
                                    </span>
                                    {score >= 80 && (
                                      <span className="px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest text-[#007AFF] bg-[#007AFF]/20 backdrop-blur-md border border-[#007AFF]/20 flex items-center gap-1 shadow-lg">
                                        <Flame className="w-3 h-3" /> VIRAL TIKTOK
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Bouton d'Analyse */}
                        <div className="p-3 bg-white z-30 transition-all">
                          <button
                            onClick={(e) => handleAnalyzeClick(e, product.id)}
                            className="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-widest bg-[#EFEFF0] text-black border border-black/5 shadow-sm hover:bg-[#007AFF] hover:text-white hover:border-[#007AFF] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-[#007AFF] group-hover:text-white"
                          >
                            <span>Analyser la Tendance</span>
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-3 h-3 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-16 lg:mt-24 text-center">
          <Link
            href="/trends"
            className="inline-flex items-center gap-4 bg-[#007AFF] px-10 py-5 rounded-full text-white font-black uppercase tracking-widest text-sm shadow-apple hover:shadow-apple-lg hover:-translate-y-1 transition-all group shadow-lg shadow-[#007AFF]/20"
          >
            Analyser le Radar Complet
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </Link>
        </div>
      </div>
    </section>
  );
}
