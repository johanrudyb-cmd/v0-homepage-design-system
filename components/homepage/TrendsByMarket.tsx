'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { proxyImageUrl } from '@/lib/image-proxy';
import { Flame, Lock } from 'lucide-react';
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
  const [selectedAge, setSelectedAge] = useState<string>('18-24 ans');
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [analysesCount, setAnalysesCount] = useState<number | null>(null);
  const [homepageIds, setHomepageIds] = useState<Set<string>>(new Set(initialTrends?.map(t => t.id).filter(Boolean) as string[] || []));
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Détecter la taille de l'écran (Mobile vs Desktop)
  useEffect(() => {
    const checkScreen = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

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

  // Filtrer les tendances selon les sélections
  const ageRange = selectedAge === '18-24 ans' ? '18-24' : '25-34';

  const displayedTrends = (() => {
    // 1. Filtrer par âge
    let ageMatch = trends.filter(t => t.ageRange === ageRange);

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

    // 2. Calculer les limites (Mobile vs Desktop)
    const limitPerSegment = isSmallScreen ? 2 : 4;

    if (selectedGender === 'Homme') {
      return diversifyByBrand(ageMatch.filter(t => t.segment === 'homme'), limitPerSegment * 2);
    }
    if (selectedGender === 'Femme') {
      return diversifyByBrand(ageMatch.filter(t => t.segment === 'femme'), limitPerSegment * 2);
    }

    // Par défaut : Mix Homme / Femme
    const men = diversifyByBrand(ageMatch.filter(t => t.segment === 'homme'), limitPerSegment);
    const women = diversifyByBrand(ageMatch.filter(t => t.segment === 'femme'), limitPerSegment);

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

        {/* Filtres modernisés */}
        <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-2 bg-[#F5F5F7] rounded-[32px] sm:rounded-full">
          <div className="flex items-center gap-2 p-1 w-full sm:w-auto">
            {['18-24 ans', '25-34 ans'].map((age) => (
              <button
                key={age}
                onClick={() => setSelectedAge(age)}
                className={cn(
                  'flex-1 sm:flex-none h-12 px-8 rounded-full text-sm font-bold transition-all duration-300',
                  selectedAge === age
                    ? 'bg-[#007AFF] text-white shadow-apple-lg scale-105'
                    : 'text-[#6e6e73] hover:text-[#007AFF]'
                )}
              >
                {age}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-1 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-black/5 sm:pl-4">
            {['Homme', 'Femme'].map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(selectedGender === gender ? null : gender)}
                className={cn(
                  'flex-1 sm:flex-none h-12 px-8 rounded-full text-sm font-bold transition-all duration-300',
                  selectedGender === gender
                    ? 'bg-[#007AFF] text-white shadow-apple-lg'
                    : 'text-[#6e6e73] hover:text-[#007AFF]'
                )}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Grille de produits animée */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-black/5 border-t-black rounded-full animate-spin" />
            <p className="text-sm font-bold text-[#6e6e73] uppercase tracking-widest">Initialisation du Radar...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
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

                      <div className={cn("flex flex-col h-full", isFree && !isPubliclyVisible ? 'opacity-10 grayscale' : '')}>
                        <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F7]">
                          <img
                            src={product.imageUrl || ''}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-apple group-hover:scale-110"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const proxied = proxyImageUrl(product.imageUrl || '');
                              if (proxied && target.src !== proxied) target.src = proxied;
                            }}
                          />

                          {/* Flammes viralité */}
                          {product.trendScore && (
                            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20">
                              <div className="px-2 py-1.5 rounded-[14px] bg-black/85 backdrop-blur-xl text-white border border-white/10 shadow-apple-lg flex items-center gap-0.5">
                                {[...Array(
                                  product.trendScore >= 90 ? 3 :
                                    product.trendScore >= 80 ? 2 : 1
                                )].map((_, i) => (
                                  <Flame key={i} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-[#FF3B30] text-[#FF3B30]" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-4 sm:p-6 flex flex-col flex-grow">
                          {/* Marque · Badge viralité */}
                          {(() => {
                            const score = product.trendScore || 0;
                            const badge = getViralityBadge(score);
                            const brand = safeDisplayBrand(product.brand) || product.brand || '';
                            return (
                              <div className="mb-3">
                                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                                  {brand && (
                                    <span className="text-[11px] sm:text-[14px] font-black text-black tracking-tight">
                                      {brand}
                                    </span>
                                  )}
                                  {brand && <span className="text-black/20 text-[11px]">·</span>}
                                  <span
                                    className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest"
                                    style={{ color: badge.color }}
                                  >
                                    {badge.emoji} {badge.label}
                                  </span>
                                </div>
                                {/* Catégorie */}
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] sm:text-[10px] font-black text-[#007AFF] bg-[#007AFF]/10 px-1.5 py-0.5 rounded-md uppercase tracking-widest border border-[#007AFF]/10">
                                    {product.category}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          <button
                            onClick={(e) => handleAnalyzeClick(e, product.id)}
                            className="mt-auto w-full h-12 rounded-full text-xs font-black uppercase tracking-widest bg-black text-white shadow-apple hover:bg-[#1D1D1F] active:scale-95 transition-all duration-300"
                          >
                            Analyse complète
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
