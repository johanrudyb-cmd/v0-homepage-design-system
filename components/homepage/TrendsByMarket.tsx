'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { proxyImageUrl } from '@/lib/image-proxy';
import { Flame, ChevronDown, Lock } from 'lucide-react';
import { BrandLogo } from '@/components/brands/BrandLogo';
import { getBrandLogoUrl, getBrandKey } from '@/lib/curated-brands';
import { REFERENCE_BRAND_WEBSITES } from '@/lib/constants/audience-reference-brands';

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

export function TrendsByMarket() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as any;
  const [isVisible, setIsVisible] = useState(false);
  const [trends, setTrends] = useState<TrendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAge, setSelectedAge] = useState<string>('18-24 ans');
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedZone] = useState('Zone EU');
  const [sortBy] = useState('Meilleures tendances (score)');
  const [analysesCount, setAnalysesCount] = useState<number | null>(null);
  const [homepageIds, setHomepageIds] = useState<Set<string>>(new Set());

  // Charger les tendances et les infos utilisateur
  useEffect(() => {
    const loadTrends = async () => {
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

        // Récupérer le nombre d'analyses ce mois pour les utilisateurs gratuits
        if (user?.plan === 'free') {
          const analysesRes = await fetch('/api/trends/analyses-count');
          if (analysesRes.ok) {
            const analysesData = await analysesRes.json();
            setAnalysesCount(analysesData.count || 0);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des tendances:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrends();
  }, [user?.plan]);

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
      const seenBrands = new Set<string>();
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
        // Sécurité pour l'index suite à un splice
        if (brandIdx >= brandNames.length) brandIdx = 0;

        const currentBrand = brandNames[brandIdx];
        const bucket = buckets[currentBrand];

        if (bucket && bucket.length > 0) {
          const product = bucket.shift();
          if (product) result.push(product);
        }

        // Si le seau est vide, on retire la marque des options
        if (!bucket || bucket.length === 0) {
          brandNames.splice(brandIdx, 1);
          // On ne change pas l'index car l'élément suivant a pris sa place
        } else {
          // Sinon on passe à la marque suivante (Rotation)
          brandIdx = (brandIdx + 1) % brandNames.length;
        }
      }
      return result;
    };

    // 2. Calculer les limites (Mobile vs Desktop)
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 640;
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

    // Vérifier si l'utilisateur est connecté
    if (!user) {
      router.push('/auth/signin?redirect=/trends/' + trendId);
      return;
    }

    // Vérifier la limite pour les utilisateurs gratuits
    if (user.plan === 'free' && analysesCount !== null && analysesCount >= 3) {
      router.push('/auth/choose-plan');
      return;
    }

    // Rediriger vers la page d'analyse
    router.push(`/trends/${trendId}`);
  };

  return (
    <section id="trends-by-market" className="py-12 sm:py-16 lg:py-20 bg-white border-t border-[#F2F2F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête avec titre et indicateur */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#000000] mb-3 sm:mb-4">
            Tendances de la semaine
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#6e6e73]">
            <Flame className="w-4 h-4 text-[#FF3B30] shrink-0 fill-[#FF3B30]" />
            <span className="font-bold">Radar Elite : Le Top 60 des tendances hebdomadaires validées sur TikTok et Instagram.</span>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-8 sm:mb-12 flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Groupe Âge */}
          <div className="flex flex-wrap gap-2">
            {['18-24 ans', '25-34 ans'].map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => setSelectedAge(age)}
                className={cn(
                  'min-h-[44px] px-6 py-2.5 rounded-full text-sm font-bold transition-all touch-manipulation',
                  selectedAge === age
                    ? 'bg-[#000000] text-white shadow-lg scale-105'
                    : 'bg-[#F5F5F7] text-[#6e6e73] hover:bg-[#E5E5E7] active:bg-[#E0E0E0]'
                )}
              >
                {age}
              </button>
            ))}
          </div>

          {/* Groupe Genre */}
          <div className="flex flex-wrap gap-2 border-l border-[#F2F2F2] pl-4 sm:pl-6">
            {['Homme', 'Femme'].map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => setSelectedGender(selectedGender === gender ? null : gender)}
                className={cn(
                  'min-h-[44px] px-6 py-2.5 rounded-full text-sm font-bold transition-all touch-manipulation',
                  selectedGender === gender
                    ? 'bg-[#000000] text-white shadow-lg'
                    : 'bg-[#F5F5F7] text-[#6e6e73] hover:bg-[#E5E5E7] active:bg-[#E0E0E0]'
                )}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Grille de produits */}
        {loading ? (
          <div className="text-center py-12 text-[#6e6e73]">
            Chargement des tendances...
          </div>
        ) : displayedTrends.length === 0 ? (
          <div className="text-center py-12 text-[#6e6e73]">
            Aucune tendance disponible
          </div>
        ) : (
          <div
            className={cn(
              'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6',
              'transition-all duration-1000',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
          >
            {displayedTrends.map((product) => {
              const segmentLabel = product.segment === 'homme' ? 'Homme' : product.segment === 'femme' ? 'Femme' : product.segment;
              const isFree = user?.plan === 'free';
              const isPubliclyVisible = !isFree || homepageIds.has(product.id);
              const canAnalyze = !isFree || (analysesCount !== null && analysesCount < 3);

              return (
                <div key={product.id} className="group relative">
                  <div className={`bg-white rounded-2xl sm:rounded-[32px] border border-[#F2F2F2] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-apple relative`}>
                    {isFree && !isPubliclyVisible && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-2xl sm:rounded-[32px] p-4 text-center">
                        <Lock className="w-8 h-8 text-white mb-4 animate-pulse" />
                        <Link
                          href="/auth/choose-plan"
                          className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-100 shadow-xl transition-all active:scale-95"
                        >
                          Débloquer avec le plan Créateur
                        </Link>
                      </div>
                    )}
                    <div className={isFree && !isPubliclyVisible ? 'opacity-0' : ''}>
                      {/* Image du produit */}
                      <div className="relative aspect-[4/5] sm:aspect-square min-h-[250px] sm:min-h-0 bg-[#F5F5F7] overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={proxyImageUrl(product.imageUrl) || product.imageUrl}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#6e6e73]">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}

                        {/* Badge segment/zone */}
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
                          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#000000] text-white text-[10px] sm:text-xs font-semibold">
                            {segmentLabel} {product.zone}
                          </span>
                        </div>
                      </div>

                      {/* Informations du produit */}
                      <div className="p-3 sm:p-6 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <BrandLogo
                            logoUrl={getBrandLogoUrl(product.brand, getRefWebsite(product.brand))}
                            brandName={product.brand}
                            className="w-8 h-8"
                          />
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-lg font-semibold text-[#000000] mb-0.5 sm:mb-1 line-clamp-1 leading-tight">
                              {product.name}
                            </h3>
                            <p className="text-[10px] sm:text-sm text-[#6e6e73] truncate">{product.category}</p>
                            <p className="text-[10px] sm:text-sm text-[#6e6e73] font-medium truncate">{product.brand}</p>
                          </div>
                        </div>

                        {/* Bouton Analyser la tendance */}
                        <button
                          onClick={(e) => handleAnalyzeClick(e, product.id)}
                          className={cn(
                            'w-full px-3 py-2 sm:px-4 sm:py-3 rounded-full text-[10px] sm:text-sm font-semibold transition-all duration-200 group-hover:scale-[1.02] bg-[#000000] text-white hover:bg-[#1D1D1F]'
                          )}
                        >
                          Analyser la tendance
                        </button>
                        {user?.plan === 'free' && analysesCount !== null && (
                          <p className="text-xs text-center text-[#6e6e73]">
                            {analysesCount}/3 analyses ce mois
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lien vers toutes les tendances */}
        <div className="mt-8 sm:mt-12 text-center">
          <Link
            href="/trends"
            className="inline-flex items-center gap-2 min-h-[44px] items-center justify-center text-[#007AFF] hover:underline group text-base sm:text-lg font-medium touch-manipulation"
          >
            Voir toutes les tendances
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
