'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Flame, ChevronDown } from 'lucide-react';

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
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
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
  const displayedTrends = trends.filter((trend) => {
    // Filtre par âge
    if (selectedAge) {
      const ageRange = selectedAge === '18-24 ans' ? '18-24' : '25-34';
      if (trend.ageRange !== ageRange) {
        return false;
      }
    }

    // Filtre par genre
    if (selectedGender) {
      const genderLower = selectedGender.toLowerCase();
      const segmentLower = trend.segment?.toLowerCase() || '';
      if (genderLower === 'homme' && segmentLower !== 'homme') {
        return false;
      }
      if (genderLower === 'femme' && segmentLower !== 'femme') {
        return false;
      }
    }

    return true;
  });

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
            Tendances par marché
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#6e6e73]">
            <Flame className="w-4 h-4 text-[#007AFF] shrink-0" />
            <span>Indicateur tendance basé sur plus de 15 000 références.</span>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-8 sm:mb-12 flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Filtres d'âge */}
          <div className="flex gap-2">
            {['18-24 ans', '25-34 ans'].map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => setSelectedAge(selectedAge === age ? null : age)}
                className={cn(
                  'min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium transition-all touch-manipulation',
                  selectedAge === age
                    ? 'bg-[#000000] text-white'
                    : 'bg-[#F5F5F7] text-[#6e6e73] hover:bg-[#E5E5E7] active:bg-[#E0E0E0]'
                )}
              >
                {age}
              </button>
            ))}
          </div>

          {/* Filtres de genre */}
          <div className="flex gap-2">
            {['Homme', 'Femme'].map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => setSelectedGender(selectedGender === gender ? null : gender)}
                className={cn(
                  'min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium transition-all touch-manipulation',
                  selectedGender === gender
                    ? 'bg-[#000000] text-white'
                    : 'bg-[#F5F5F7] text-[#6e6e73] hover:bg-[#E5E5E7] active:bg-[#E0E0E0]'
                )}
              >
                {gender}
              </button>
            ))}
          </div>

          {/* Zone */}
          <button
            type="button"
            className="min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium bg-[#F5F5F7] text-[#6e6e73] hover:bg-[#E5E5E7] transition-all touch-manipulation"
          >
            {selectedZone}
          </button>

          {/* Tri */}
          <div className="relative ml-auto">
            <button type="button" className="min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium bg-[#F5F5F7] text-[#6e6e73] hover:bg-[#E5E5E7] transition-all flex items-center gap-2 touch-manipulation">
              {sortBy}
              <ChevronDown className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Filtres avancés */}
          <button type="button" className="min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium bg-[#F5F5F7] text-[#6e6e73] hover:bg-[#E5E5E7] transition-all touch-manipulation">
            Filtres avancés
          </button>
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
              'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6',
              'transition-all duration-1000',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
          >
            {displayedTrends.slice(0, 4).map((product) => {
              const segmentLabel = product.segment === 'homme' ? 'Homme' : product.segment === 'femme' ? 'Femme' : product.segment;
              const isFree = user?.plan === 'free';
              const isPubliclyVisible = !isFree || homepageIds.has(product.id);
              const canAnalyze = !isFree || (analysesCount !== null && analysesCount < 3);

              return (
                <div key={product.id} className="group relative">
                  <div className={`bg-white rounded-2xl sm:rounded-[32px] border border-[#F2F2F2] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-apple ${isFree && !isPubliclyVisible ? 'blur-sm' : ''}`}>
                    {isFree && !isPubliclyVisible && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 rounded-2xl sm:rounded-[32px]">
                        <Link
                          href="/auth/choose-plan"
                          className="px-4 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-100"
                        >
                          Passer au plan Créateur pour voir
                        </Link>
                      </div>
                    )}
                    {/* Image du produit */}
                    <div className="relative aspect-[4/5] sm:aspect-square min-h-[250px] sm:min-h-0 bg-[#F5F5F7] overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 25vw"
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
                      <div>
                        <h3 className="text-sm sm:text-lg font-semibold text-[#000000] mb-0.5 sm:mb-1 line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-[10px] sm:text-sm text-[#6e6e73] truncate">{product.category}</p>
                        <p className="text-[10px] sm:text-sm text-[#6e6e73] font-medium truncate">{product.brand}</p>
                      </div>

                      {/* Bouton Analyser la tendance */}
                      <button
                        onClick={(e) => {
                          if (isFree && !isPubliclyVisible) {
                            e.preventDefault();
                            router.push('/auth/choose-plan');
                            return;
                          }
                          handleAnalyzeClick(e, product.id);
                        }}
                        disabled={!canAnalyze}
                        className={cn(
                          'w-full px-3 py-2 sm:px-4 sm:py-3 rounded-full text-[10px] sm:text-sm font-semibold transition-all duration-200 group-hover:scale-[1.02]',
                          canAnalyze && (!isFree || isPubliclyVisible)
                            ? 'bg-[#000000] text-white hover:bg-[#1D1D1F]'
                            : 'bg-[#E5E5E7] text-[#6e6e73] cursor-not-allowed'
                        )}
                      >
                        {!user
                          ? 'Se connecter pour analyser'
                          : isFree && !isPubliclyVisible
                            ? 'Passer au plan Créateur'
                            : isFree && analysesCount !== null && analysesCount >= 3
                              ? 'Limite atteinte (3/mois)'
                              : 'Analyser la tendance'}
                      </button>
                      {user?.plan === 'free' && analysesCount !== null && (
                        <p className="text-xs text-center text-[#6e6e73]">
                          {analysesCount}/3 analyses ce mois
                        </p>
                      )}
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
