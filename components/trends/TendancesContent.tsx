'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProductBrand } from '@/lib/brand-utils';
import { proxyImageUrl } from '@/lib/image-proxy';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Flame, Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { UsageBadge } from '@/components/trends/UsageBadge';

interface HybridTrend {
  id: string;
  name: string;
  category: string;
  marketZone: string | null;
  segment: string | null;
  cut: string | null;
  trendScoreVisual: number | null;
  trendScore: number;
  averagePrice: number;
  trendGrowthPercent: number | null;
  trendLabel: string | null;
  effectiveTrendGrowthPercent?: number;
  effectiveTrendLabel?: string | null;
  imageUrl: string | null;
  sourceBrand: string | null;
  sourceUrl?: string | null;
  material?: string | null;
  description?: string | null;
  isGlobalTrendAlert: boolean;
  businessAnalysis: string | null;
}

export function TendancesContent({ initialData }: { initialData?: { trends: HybridTrend[]; summary: any } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandFromUrl = searchParams.get('brand');

  const [trends, setTrends] = useState<HybridTrend[]>(initialData?.trends || []);
  const [totalTrends, setTotalTrends] = useState<number>(initialData?.summary?.total || 0);
  const [trendsLoading, setTrendsLoading] = useState(!initialData);
  const { data: session } = useSession();
  const user = session?.user as any;
  const [zone, setZone] = useState<string>('EU');
  const [homepageIds, setHomepageIds] = useState<Set<string>>(new Set());
  const [analysesCount, setAnalysesCount] = useState<number | null>(null);
  const limitReached = searchParams.get('limit') === 'reached';

  const [ageRange, setAgeRange] = useState<'18-24' | '25-34'>(() => {
    if (typeof window === 'undefined') return '18-24';
    const a = sessionStorage.getItem('trends-list-ageRange');
    if (a === '18-24' || a === '25-34') return a;
    return '18-24';
  });
  const [segment, setSegment] = useState<string>(() => {
    if (typeof window === 'undefined') return 'homme';
    const s = sessionStorage.getItem('trends-list-segment');
    if (s === 'femme' || s === 'homme') return s;
    return 'homme';
  });
  const [sortBy, setSortBy] = useState<string>('best');
  const [globalOnly, setGlobalOnly] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  const loadTrends = useCallback(async () => {
    if (initialData && segment === 'homme' && ageRange === '18-24' && sortBy === 'best' && zone === 'EU' && !globalOnly && !brandFromUrl && trends.length > 0) {
      return;
    }

    setTrendsLoading(true);
    try {
      const params = new URLSearchParams();
      if (zone) params.set('marketZone', zone);
      params.set('ageRange', ageRange);
      params.set('segment', segment);
      params.set('sortBy', sortBy);
      if (globalOnly) params.set('globalOnly', 'true');
      if (brandFromUrl) params.set('brand', brandFromUrl);
      params.set('limit', '50');
      const res = await fetch(`/api/trends/hybrid-radar?${params.toString()}`);
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      setTrends(Array.isArray(data.trends) ? data.trends : []);
      setTotalTrends(data.summary?.total || 0);
    } catch (e) {
      console.error(e);
      setTrends([]);
    } finally {
      setTrendsLoading(false);
    }
  }, [zone, ageRange, segment, sortBy, globalOnly, brandFromUrl, initialData]);

  useEffect(() => {
    loadTrends();
  }, [loadTrends]);

  useEffect(() => {
    fetch('/api/trends/homepage-featured').then((r) => r.ok ? r.json() : null).then((featuredData) => {
      const ids = (featuredData?.trends ?? []).map((t: { id?: string }) => t.id).filter(Boolean);
      setHomepageIds(new Set(ids));
    }).catch(() => { });

    if (user?.plan === 'free') {
      fetch('/api/trends/analyses-count')
        .then((r) => (r.ok ? r.json() : Promise.resolve({ count: 0 })))
        .then((d) => setAnalysesCount(d.count ?? 0))
        .catch(() => { });
    }
  }, [user?.plan]);

  const handleAnalyzeClick = () => {
    try {
      sessionStorage.setItem('trends-list-scroll', String(window.scrollY ?? document.documentElement.scrollTop ?? 0));
      sessionStorage.setItem('trends-list-segment', segment || 'homme');
      sessionStorage.setItem('trends-list-ageRange', ageRange || '25-34');
    } catch (_) { }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Brand Filter Active Indicator */}
      {brandFromUrl && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-[#007AFF]/5 border border-[#007AFF]/10 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
            <span className="text-sm font-bold text-black tracking-tight">Filtre actif : {brandFromUrl}</span>
          </div>
          <Link href="/trends" className="text-xs font-black uppercase tracking-widest text-[#007AFF] hover:underline">
            Réinitialiser
          </Link>
        </motion.div>
      )}

      {/* Modern Sticky Navigation & Utility Bar */}
      <div className="sticky top-14 sm:top-16 z-40 -mx-4 px-4 py-4 bg-white/70 backdrop-blur-2xl border-b border-black/[0.03]">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black tracking-tight text-black">
                Radar Elite
                {!trendsLoading && totalTrends > 0 && (
                  <span className="ml-3 text-[10px] bg-[#FF3B30] text-white px-2.5 py-1 rounded-full font-black tracking-widest uppercase">
                    {totalTrends} Produits
                  </span>
                )}
              </h2>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full border border-black/5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6e6e73]">LIVE EU</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UsageBadge count={analysesCount} plan={user?.plan || 'free'} />
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full bg-black/5 hover:bg-black/10 h-10 px-6 text-[11px] font-black uppercase tracking-widest"
                onClick={() => setAdvancedFiltersOpen((v) => !v)}
              >
                {advancedFiltersOpen ? 'Masquer Filtres' : 'Filtres Avancés'}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Age selector */}
            <div className="flex p-1 bg-[#F5F5F7] rounded-full sm:min-w-[200px]">
              {(['18-24', '25-34'] as const).map((age) => (
                <button
                  key={age}
                  onClick={() => setAgeRange(age)}
                  className={cn(
                    "flex-1 h-9 px-4 text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-300",
                    ageRange === age ? "bg-white text-black shadow-apple-sm" : "text-[#6e6e73] hover:text-black"
                  )}
                >
                  {age} ans
                </button>
              ))}
            </div>

            {/* Segment selector */}
            <div className="flex p-1 bg-[#F5F5F7] rounded-full sm:min-w-[180px]">
              {['homme', 'femme'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSegment(s)}
                  className={cn(
                    "flex-1 h-9 px-4 text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-300",
                    segment === s ? "bg-white text-black shadow-apple-sm" : "text-[#6e6e73] hover:text-black"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Sort selector */}
            <div className="relative group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none h-11 pl-6 pr-10 rounded-full bg-[#F5F5F7] border-none text-[11px] font-black uppercase tracking-widest text-[#6e6e73] focus:ring-2 focus:ring-black/5 outline-none cursor-pointer hover:text-black transition-colors"
              >
                <option value="best">Meilleurs Scores IVS</option>
                <option value="recent">Nouveautés Radar</option>
                <option value="priceAsc">Prix : Croissant</option>
                <option value="priceDesc">Prix : Décroissant</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {advancedFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-[32px] bg-[#F5F5F7] border border-black/[0.03] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-widest text-black">Alertes Globales</h4>
                  <p className="text-xs text-[#6e6e73]">Afficher uniquement les produits qui tendent simultanément sur 2+ marchés mondiaux.</p>
                </div>
                <button
                  onClick={() => setGlobalOnly(!globalOnly)}
                  className={cn(
                    "h-12 px-8 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                    globalOnly ? "bg-black text-white shadow-apple" : "bg-white text-black border border-black/5"
                  )}
                >
                  {globalOnly ? 'Filtre Activé' : 'Activer le Filtre'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 text-sm text-[#6e6e73]">
        <Flame className="w-5 h-5 text-[#FF3B30] fill-[#FF3B30]" />
        <span className="font-bold tracking-tight">Le Top 60 des tendances validées par nos algorithmes de viralité sociale.</span>
      </div>

      {trendsLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="w-12 h-12 border-4 border-black/5 border-t-black rounded-full animate-spin" />
          <p className="text-sm font-black uppercase tracking-widest text-[#6e6e73]">Mise à jour du Radar...</p>
        </div>
      ) : trends.length === 0 ? (
        <div className="py-32 text-center rounded-[32px] bg-[#F5F5F7] border border-dashed border-black/10">
          <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-black/20" />
          <h3 className="text-xl font-black text-black mb-2 uppercase tracking-tight">Aucun résultat</h3>
          <p className="text-[#6e6e73] mb-8">Nous n'avons trouvé aucun produit correspondant à vos filtres actuels.</p>
          <Button onClick={() => { setGlobalOnly(false); setSortBy('best'); }} variant="outline" className="rounded-full px-8 font-black uppercase tracking-widest text-xs h-12">
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {trends.map((t, index) => {
              const isFree = user?.plan === 'free';
              const isVisible = !isFree || homepageIds.has(t.id);
              const maxAnalyses = isFree ? 3 : 10;
              const canAnalyze = !isFree || (analysesCount !== null && analysesCount < maxAnalyses);
              return (
                <motion.div
                  layout
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  transition={{
                    duration: 0.6,
                    delay: Math.min(index * 0.05, 0.5),
                    ease: [0.23, 1, 0.32, 1]
                  }}
                  className="group relative"
                >
                  <div className="bg-white rounded-[32px] overflow-hidden transition-all duration-500 shadow-apple border border-black/[0.03] flex flex-col h-full hover:shadow-apple-lg hover:-translate-y-2">
                    {isFree && !isVisible && (
                      <div className="absolute inset-0 z-40 bg-white/40 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mb-6 shadow-apple">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-lg font-black text-black mb-4 tracking-tight">Analyse VIP</h4>
                        <Link
                          href="/auth/signup"
                          className="w-full py-3 bg-black text-white rounded-full text-xs font-bold hover:bg-black/90 transition-all active:scale-95 shadow-xl uppercase tracking-widest"
                        >
                          Accès Gratuit
                        </Link>
                      </div>
                    )}

                    <div className={cn("flex flex-col h-full", isFree && !isVisible ? 'opacity-10 grayscale' : '')}>
                      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F7]">
                        <img
                          src={proxyImageUrl(t.imageUrl) || t.imageUrl || ''}
                          alt={t.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-apple group-hover:scale-110"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const p = proxyImageUrl(t.imageUrl || '');
                            if (p && target.src !== p) target.src = p;
                          }}
                        />

                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                          {t.segment && (
                            <span className="px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md text-black text-[10px] font-black uppercase tracking-widest shadow-apple-sm">
                              {t.segment}
                            </span>
                          )}
                          {t.isGlobalTrendAlert && (
                            <span className="px-3 py-1.5 rounded-2xl bg-[#007AFF] text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                              <Globe className="w-3 h-3" />
                              Global
                            </span>
                          )}
                          {((t as any).outfityIVS || t.trendScore) > 85 && (
                            <span className="px-3 py-1.5 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
                              Elite Trend
                            </span>
                          )}
                        </div>

                        {((t as any).outfityIVS || t.trendScore) && (
                          <div className="absolute bottom-4 right-4 z-20">
                            <div className="px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-xl text-white border border-white/20 shadow-apple-lg text-right">
                              <div className="text-[9px] font-bold uppercase tracking-tight text-white/50 mb-[-2px]">IVS Index</div>
                              <div className="text-lg font-black tracking-tight">{(t as any).outfityIVS || t.trendScore}%</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        <div className="mb-4">
                          <h3 className="text-[17px] font-bold text-black leading-tight line-clamp-2 transition-colors group-hover:text-[#007AFF] mb-2">
                            {t.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-[#6e6e73] bg-black/5 px-2 py-1 rounded-md uppercase tracking-widest">
                              {t.category}
                            </span>
                            <span className="text-[11px] font-bold text-black/20 italic">
                              By {(t as any).productBrand || t.sourceBrand || 'Brand'}
                            </span>
                          </div>
                        </div>

                        {t.businessAnalysis && (
                          <p className="text-[12px] text-[#6e6e73] line-clamp-2 mb-6 italic leading-relaxed font-medium">
                            "{t.businessAnalysis}"
                          </p>
                        )}

                        <div className="mt-auto">
                          <Link
                            href={`/trends/${t.id}`}
                            onClick={handleAnalyzeClick}
                            className="w-full h-12 rounded-full flex items-center justify-center text-xs font-black uppercase tracking-widest bg-black text-white shadow-apple hover:bg-[#1D1D1F] active:scale-95 transition-all duration-300"
                          >
                            Analyse complète
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <div className="py-12 border-t border-black/[0.03] text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6e6e73]">
          Algorithme de détection Outfity v4.2 • Mise à jour hebdomadaire
        </p>
      </div>
    </div>
  );
}
