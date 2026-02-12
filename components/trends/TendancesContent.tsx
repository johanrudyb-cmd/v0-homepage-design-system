'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProductBrand } from '@/lib/brand-utils';
import { proxyImageUrl } from '@/lib/image-proxy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2, Eye, ChevronDown, ChevronUp, Globe, AlertTriangle, Flame, MapPin, CheckCircle, Lock } from 'lucide-react';

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
  /** % croissance (ex. 15 pour "+15%") ou manuel */
  trendGrowthPercent: number | null;
  /** Libellé (ex. "Tendance", "En hausse") */
  trendLabel: string | null;
  /** % tendance calculé en interne quand trendGrowthPercent est null (récurrence, ancienneté, multi-zones) */
  effectiveTrendGrowthPercent?: number;
  /** Libellé affiché quand % interne (ex. "Estimé") */
  effectiveTrendLabel?: string | null;
  imageUrl: string | null;
  sourceBrand: string | null;
  sourceUrl?: string | null;
  material?: string | null;
  description?: string | null;
  isGlobalTrendAlert: boolean;
  businessAnalysis: string | null;
}

export function TendancesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandFromUrl = searchParams.get('brand');
  const [scrapingOnly, setScrapingOnly] = useState(false);
  const [scrapeOnlyResult, setScrapeOnlyResult] = useState<{
    totalItems: number;
    savedToTrends?: number;
    results: Array<{
      sourceId: string;
      brand: string;
      marketZone: string;
      url: string;
      itemCount: number;
      items: Array<{
        name: string;
        price: number;
        imageUrl: string | null;
        sourceUrl: string;
        composition?: string | null;
        careInstructions?: string | null;
        color?: string | null;
        sizes?: string | null;
        countryOfOrigin?: string | null;
        articleNumber?: string | null;
      }>;
    }>;
  } | null>(null);
  const [scrapeOnlyExpanded, setScrapeOnlyExpanded] = useState<string | null>(null);

  const [sourcesList, setSourcesList] = useState<{ id: string; label: string; marketZone: string; segment: string; brand: string }[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [customPreviewUrl, setCustomPreviewUrl] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [defaultTrendPercent, setDefaultTrendPercent] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<{
    sourceId: string;
    brand: string;
    marketZone: string;
    segment: string | null;
    itemCount: number;
    items: Array<{
      name: string;
      price: number;
      imageUrl: string | null;
      sourceUrl: string;
      trendGrowthPercent?: number | null;
      trendLabel?: string | null;
      composition?: string | null;
      careInstructions?: string | null;
      color?: string | null;
      sizes?: string | null;
      countryOfOrigin?: string | null;
      articleNumber?: string | null;
    }>;
  } | null>(null);
  const [savingPreview, setSavingPreview] = useState(false);

  const [trends, setTrends] = useState<HybridTrend[]>([]);
  const [totalTrends, setTotalTrends] = useState<number>(0);
  const [trendsLoading, setTrendsLoading] = useState(true);
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
  const [recoveryTab, setRecoveryTab] = useState<'scrape' | 'preview'>('scrape');
  const [moreCitiesOpen, setMoreCitiesOpen] = useState(false);

  /** Villes principales / autres — dépendent du segment (homme ou femme). */
  const MAIN_CITY_SLUGS = ['paris', 'berlin', 'milan'] as const;
  const OTHER_CITY_SLUGS = ['copenhagen', 'stockholm', 'antwerp', 'zurich', 'london', 'amsterdam', 'warsaw'] as const;
  const MAIN_CITY_IDS = MAIN_CITY_SLUGS.map((c) => `zalando-trend-${segment || 'homme'}-${c}`) as unknown as readonly string[];
  const OTHER_CITY_IDS = OTHER_CITY_SLUGS.map((c) => `zalando-trend-${segment || 'homme'}-${c}`) as unknown as readonly string[];
  const CITY_LABELS: Record<string, string> = {
    paris: 'Paris',
    berlin: 'Berlin',
    milan: 'Milan',
    copenhagen: 'Copenhague',
    stockholm: 'Stockholm',
    antwerp: 'Anvers',
    zurich: 'Zurich',
    london: 'Londres',
    amsterdam: 'Amsterdam',
    warsaw: 'Varsovie',
  };
  const getCityLabel = (sourceId: string) => {
    const cityMatch = sourceId.match(/-(?:homme|femme)-(.+)$/);
    if (cityMatch) return CITY_LABELS[cityMatch[1]] ?? cityMatch[1];
    const ageMatch = sourceId.match(/^[a-z]+-18-24-(homme|femme)$/);
    if (ageMatch) return `18-24 ans (${ageMatch[1] === 'homme' ? 'Homme' : 'Femme'})`;
    return sourceId;
  };

  /** Catégorie cible pour les tendances Zalando (affichée dans l’UI). */
  /** Tranches d'âge : 18-24 = ASOS (une page homme ou femme), 25-34 = Zalando (villes). */
  const AGE_LABELS = { '18-24': '18-24 ans', '25-34': '25-34 ans' } as const;
  const ASOS_18_24_SOURCE_ID = segment === 'femme' ? 'asos-18-24-femme' : 'asos-18-24-homme';

  const loadTrends = useCallback(async () => {
    setTrendsLoading(true);
    try {
      const params = new URLSearchParams();
      if (zone) params.set('marketZone', zone);
      params.set('ageRange', ageRange);
      if (segment) params.set('segment', segment);
      if (sortBy) params.set('sortBy', sortBy);
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
  }, [zone, ageRange, segment, sortBy, globalOnly, brandFromUrl]);

  useEffect(() => {
    loadTrends();
  }, [loadTrends]);

  useEffect(() => {
    // Récupérer les tendances à la une pour la homepage (visibles en gratuit)
    fetch('/api/trends/homepage-featured').then((r) => r.ok ? r.json() : null).then((featuredData) => {
      const ids = (featuredData?.trends ?? []).map((t: { id?: string }) => t.id).filter(Boolean);
      setHomepageIds(new Set(ids));
    }).catch(() => { });

    // Récupérer le nombre d'analyses si l'utilisateur est sur un plan gratuit
    if (user?.plan === 'free') {
      fetch('/api/trends/analyses-count')
        .then((r) => (r.ok ? r.json() : Promise.resolve({ count: 0 })))
        .then((d) => setAnalysesCount(d.count ?? 0))
        .catch(() => { });
    }
  }, [user?.plan]);

  useEffect(() => {
    fetch('/api/trends/hybrid-radar/sources')
      .then((r) => (r.ok ? r.json() : Promise.resolve({ sources: [] })))
      .then((data) => setSourcesList(data.sources || []))
      .catch(() => setSourcesList([]));
  }, []);

  // Au retour depuis la page détail : restaurer segment + ageRange puis scroll avec animation
  const restoreScrollPosition = useCallback((smooth = true) => {
    try {
      const saved = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('trends-list-scroll') : null;
      if (saved === null) return;
      sessionStorage.removeItem('trends-list-scroll');
      const y = parseInt(saved, 10);
      if (Number.isNaN(y) || y < 0) return;
      const scroll = () => {
        window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
      };
      scroll();
      requestAnimationFrame(scroll);
      setTimeout(scroll, 100);
      setTimeout(scroll, 400);
      setTimeout(scroll, 700);
    } catch (_) {
      /**/
    }
  }, []);

  // Nettoyer les clés sessionStorage après restauration (évite de réutiliser au prochain passage)
  useEffect(() => {
    sessionStorage.removeItem('trends-list-segment');
    sessionStorage.removeItem('trends-list-ageRange');
  }, []);

  useEffect(() => {
    restoreScrollPosition(true);
  }, [restoreScrollPosition]);

  // Retour arrière (bfcache ou remount) : pageshow déclenche la restauration
  useEffect(() => {
    const onPageShow = () => {
      restoreScrollPosition(true);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [restoreScrollPosition]);

  /** Références affichées : Paris, Berlin et Milan (API déjà filtrée). */
  const sourcesForZone = sourcesList;

  const handlePreviewByCity = async (overrideSourceId?: string) => {
    const useCustomUrl = customPreviewUrl.trim().length > 0;
    const effectiveSourceId = overrideSourceId ?? selectedSourceId;
    if (!useCustomUrl && !effectiveSourceId) {
      alert('Choisissez une ville / source ou collez l\'URL de la page à récupérer.');
      return;
    }
    if (overrideSourceId) setSelectedSourceId(overrideSourceId);
    setPreviewLoading(true);
    setPreviewResult(null);
    try {
      const body: { sourceId?: string; customUrl?: string; brand: string; saveToTrends: boolean } = {
        brand: 'Zalando',
        saveToTrends: false,
      };
      if (useCustomUrl) body.customUrl = customPreviewUrl.trim();
      else body.sourceId = effectiveSourceId;
      const res = await fetch('/api/trends/hybrid-radar/scrape-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.results?.length > 0) {
        const src = data.results[0];
        setPreviewResult({
          sourceId: src.sourceId,
          brand: src.brand,
          marketZone: src.marketZone,
          segment: src.segment ?? null,
          itemCount: src.itemCount ?? src.items?.length ?? 0,
          items: src.items || [],
        });
      } else if (res.ok && data.results?.length === 0) {
        setPreviewResult(null);
        alert('Aucun produit récupéré pour cette source.');
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleValidatePreview = async () => {
    if (!previewResult) return;
    const items = Array.isArray(previewResult.items) ? previewResult.items : [];
    if (items.length === 0) {
      alert('Aucun produit à enregistrer.');
      return;
    }
    setSavingPreview(true);
    try {
      const defaultPct =
        defaultTrendPercent.trim() === ''
          ? undefined
          : Math.min(100, Math.max(0, parseInt(defaultTrendPercent.trim(), 10)));
      const defaultPctNum = defaultPct !== undefined && !Number.isNaN(defaultPct) ? defaultPct : undefined;
      const payload = {
        sourceId: previewResult.sourceId,
        brand: previewResult.brand,
        marketZone: previewResult.marketZone ?? 'EU',
        segment: previewResult.segment ?? 'homme',
        defaultTrendPercent: defaultPctNum,
        items: items.map((i: { name?: string; price?: number; imageUrl?: string | null; sourceUrl?: string; trendGrowthPercent?: number | null; trendLabel?: string | null; composition?: string | null; careInstructions?: string | null; color?: string | null; sizes?: string | null; countryOfOrigin?: string | null; articleNumber?: string | null; productBrand?: string | null }) => ({
          name: i.name ?? '',
          price: typeof i.price === 'number' ? i.price : 0,
          imageUrl: i.imageUrl ?? null,
          sourceUrl: i.sourceUrl ?? '',
          trendGrowthPercent: i.trendGrowthPercent ?? null,
          trendLabel: i.trendLabel ?? null,
          composition: i.composition ?? null,
          careInstructions: i.careInstructions ?? null,
          color: i.color ?? null,
          sizes: i.sizes ?? null,
          countryOfOrigin: i.countryOfOrigin ?? null,
          articleNumber: i.articleNumber ?? null,
          productBrand: i.productBrand ?? null,
        })),
      };
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      const res = await fetch('/api/trends/hybrid-radar/save-from-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({ error: 'Réponse invalide du serveur' }));
      if (res.ok) {
        const saved = data.savedToTrends ?? 0;
        setPreviewResult(null);
        setSavingPreview(false); // Arrêter le spinner tout de suite : ne pas dépendre du rechargement des tendances
        const savedAgeRange = previewResult.brand === 'ASOS' ? '18-24' : '25-34';
        const savedSegment = previewResult.segment || 'homme';
        setAgeRange(savedAgeRange);
        setSegment(savedSegment);
        setTrendsLoading(true);
        const abortTrends = new AbortController();
        const timeoutTrends = setTimeout(() => abortTrends.abort(), 15000);
        try {
          const params = new URLSearchParams();
          if (zone) params.set('marketZone', zone);
          params.set('ageRange', savedAgeRange);
          params.set('segment', savedSegment);
          params.set('sortBy', sortBy);
          if (globalOnly) params.set('globalOnly', 'true');
          if (brandFromUrl) params.set('brand', brandFromUrl);
          params.set('limit', '50');
          const resTrends = await fetch(`/api/trends/hybrid-radar?${params.toString()}`, { signal: abortTrends.signal });
          clearTimeout(timeoutTrends);
          const dataTrends = await resTrends.json().catch(() => ({}));
          setTrends(Array.isArray(dataTrends.trends) ? dataTrends.trends : []);
        } catch (e) {
          clearTimeout(timeoutTrends);
          console.error(e);
        } finally {
          setTrendsLoading(false);
        }
        const msg = typeof data.message === 'string' ? data.message : null;
        if (msg) {
          alert(msg);
        } else {
          const skipped = data.skipped?.total ?? 0;
          if (skipped > 0) {
            alert(
              `${saved} tendance(s) enregistrée(s). ${skipped} article(s) non enregistré(s) (${data.skipped?.invalidUrl ?? 0} URL invalide, ${data.skipped?.duplicate ?? 0} doublon).`
            );
          } else {
            alert(saved > 0 ? `${saved} tendance(s) enregistrée(s) — affichées dans les tendances ci-dessus.` : 'Aucune tendance enregistrée.');
          }
        }
      } else {
        const errMsg = data.error || (res.status === 401 ? 'Non authentifié. Connectez-vous pour enregistrer.' : 'Erreur');
        alert(`${errMsg}${res.status ? ` (${res.status})` : ''}`);
      }
    } catch (e) {
      const isAbort = e instanceof Error && e.name === 'AbortError';
      const err = isAbort
        ? 'La requête a pris trop de temps (90 s). Réessayez ou prévisualisez moins de produits.'
        : (e instanceof Error ? e.message : String(e));
      alert(isAbort ? err : `Erreur réseau ou serveur : ${err}`);
    } finally {
      setSavingPreview(false);
    }
  };

  const handleScrapeOnly = async (sourceIdOrFull: string | false) => {
    setScrapingOnly(true);
    setScrapeOnlyResult(null);
    try {
      const body =
        sourceIdOrFull === false
          ? { brand: 'Zalando', saveToTrends: true, segment: segment || 'homme' }
          : { brand: 'Zalando', sourceId: sourceIdOrFull, saveToTrends: true };
      const res = await fetch('/api/trends/hybrid-radar/scrape-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({ error: 'Réponse invalide du serveur' }));
      if (res.ok) {
        setScrapeOnlyResult({
          totalItems: data.totalItems ?? 0,
          savedToTrends: data.savedToTrends,
          results: data.results || [],
        });
        const saved = data.savedToTrends ?? 0;
        const isAsos1824 = sourceIdOrFull === 'asos-18-24-homme' || sourceIdOrFull === 'asos-18-24-femme';
        if (isAsos1824 && saved > 0) {
          const asosSegment = sourceIdOrFull === 'asos-18-24-femme' ? 'femme' : 'homme';
          setAgeRange('18-24');
          setSegment(asosSegment);
          setTrendsLoading(true);
          try {
            const params = new URLSearchParams();
            if (zone) params.set('marketZone', zone);
            params.set('ageRange', '18-24');
            params.set('segment', asosSegment);
            params.set('sortBy', sortBy);
            if (globalOnly) params.set('globalOnly', 'true');
            if (brandFromUrl) params.set('brand', brandFromUrl);
            params.set('limit', '50');
            const resTrends = await fetch(`/api/trends/hybrid-radar?${params.toString()}`);
            const dataTrends = await resTrends.json().catch(() => ({}));
            setTrends(Array.isArray(dataTrends.trends) ? dataTrends.trends : []);
          } catch (e) {
            console.error(e);
          } finally {
            setTrendsLoading(false);
          }
        } else {
          await loadTrends();
        }
        if (saved > 0) {
          alert(`${saved} tendance(s) enregistrée(s) — affichées dans les tendances ci-dessus.`);
        }
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setScrapingOnly(false);
    }
  };

  return (
    <div className="space-y-8">
      {brandFromUrl && (
        <div className="mb-4 p-3 rounded-lg border bg-muted/30 flex items-center gap-3">
          <span className="text-sm font-medium">Filtre :</span>
          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold">{brandFromUrl}</span>
          <Link href="/trends" className="text-sm text-muted-foreground hover:text-foreground underline">
            Voir toutes les tendances
          </Link>
        </div>
      )}
      <div className="sticky top-14 sm:top-16 z-30 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-black/5 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-extrabold tracking-tight text-[#1D1D1F] flex items-center gap-2">
            Top 60 : Tendances de la semaine
            {!trendsLoading && totalTrends > 0 && (
              <span className="text-[10px] bg-[#FF3B30] text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                Elite
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-black/5 uppercase tracking-tighter"> Zone EU</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/5 h-8 text-xs font-bold"
              onClick={() => setAdvancedFiltersOpen((v) => !v)}
            >
              {advancedFiltersOpen ? 'Fermer filtres' : 'Filtres avancés'}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* Age selector */}
          <div className="flex rounded-xl border border-black/5 bg-black/[0.03] p-1 shrink-0">
            <button
              type="button"
              onClick={() => setAgeRange('18-24')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${ageRange === '18-24' ? 'bg-white text-primary shadow-apple-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              18-24 ans
            </button>
            <button
              type="button"
              onClick={() => setAgeRange('25-34')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${ageRange === '25-34' ? 'bg-white text-primary shadow-apple-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              25-34 ans
            </button>
          </div>

          {/* Segment selector */}
          <div className="flex rounded-xl border border-black/5 bg-black/[0.03] p-1 shrink-0">
            <button
              type="button"
              onClick={() => setSegment('homme')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${segment === 'homme' ? 'bg-white text-primary shadow-apple-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Homme
            </button>
            <button
              type="button"
              onClick={() => setSegment('femme')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${segment === 'femme' ? 'bg-white text-primary shadow-apple-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Femme
            </button>
          </div>

          {/* Sort selector simplified for mobile */}
          <select
            value={sortBy === 'priceAsc' || sortBy === 'priceDesc' ? 'best' : sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 px-3 rounded-xl border border-black/5 bg-black/[0.03] text-[11px] font-bold text-muted-foreground outline-none focus:ring-1 focus:ring-primary/20"
          >
            <option value="best">Meilleurs scores</option>
            <option value="recent">Plus récents</option>
          </select>
        </div>

        {advancedFiltersOpen && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 rounded-2xl border border-black/5 bg-black/[0.02] flex items-center justify-between">
              <label className="flex items-center gap-3 text-xs font-semibold text-[#1D1D1F]/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={globalOnly}
                  onChange={(e) => setGlobalOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-black/10 text-primary focus:ring-primary"
                />
                Global Trend Alert uniquement
              </label>
              <Link href="/trends" className="text-[10px] font-bold text-primary hover:underline">
                Réinitialiser
              </Link>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#6e6e73]">
        <Flame className="w-4 h-4 text-[#FF3B30] shrink-0 fill-[#FF3B30]" />
        <span className="font-bold">Radar Elite : Le Top 60 des tendances hebdomadaires validées sur TikTok et Instagram.</span>
      </div>
      {limitReached && user?.plan === 'free' && (
        <div className="mb-4 p-4 rounded-lg border-2 border-amber-500/50 bg-amber-50 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-amber-900">
            Vous avez atteint la limite de 3 analyses par mois. Passez au plan Créateur pour analyser plus de tendances.
          </p>
          <Link
            href="/auth/choose-plan"
            className="shrink-0 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700"
          >
            Passer au plan Créateur
          </Link>
        </div>
      )}
      {trendsLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12">
          <Loader2 className="w-5 h-5 animate-spin" />
          Chargement des tendances…
        </div>
      ) : trends.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>
              {brandFromUrl
                ? `Aucune tendance pour la marque « ${brandFromUrl} ».`
                : 'Aucune tendance enregistrée pour le moment.'}
            </p>
            <p className="text-sm mt-1">
              {brandFromUrl ? (
                <Link href="/trends" className="underline hover:text-foreground">
                  Voir toutes les tendances
                </Link>
              ) : (
                'Utilisez la section « Récupérer les tendances » ci-dessous pour alimenter le radar.'
              )}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
            {trends.map((t) => {
              const isFree = user?.plan === 'free';
              const isVisible = !isFree || homepageIds.has(t.id);
              const canAnalyze = !isFree || (analysesCount !== null && analysesCount < 3);
              const handleAnalyzeClick = (e: React.MouseEvent) => {
                try {
                  sessionStorage.setItem('trends-list-scroll', String(window.scrollY ?? document.documentElement.scrollTop ?? 0));
                  sessionStorage.setItem('trends-list-segment', segment || 'homme');
                  sessionStorage.setItem('trends-list-ageRange', ageRange || '25-34');
                } catch (_) { }
              };
              return (
                <Card key={t.id} className="overflow-hidden flex flex-col relative">
                  {isFree && !isVisible && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-lg p-4 text-center">
                      <Lock className="w-8 h-8 text-white mb-4 animate-pulse" />
                      <Link
                        href="/auth/choose-plan"
                        className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-100 shadow-xl transition-all active:scale-95"
                      >
                        Débloquer avec le plan Créateur
                      </Link>
                    </div>
                  )}
                  <div className={`flex flex-col flex-1 ${isFree && !isVisible ? 'opacity-0' : ''}`}>
                    <div className="aspect-[3/4] bg-muted relative shrink-0">
                      {t.imageUrl ? (
                        <img
                          src={proxyImageUrl(t.imageUrl) || t.imageUrl}
                          alt={t.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // En cas d'erreur, afficher l'icône par défaut
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted-foreground"><svg class="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Globe className="w-12 h-12 opacity-40" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {t.segment && (
                          <span className="px-2 py-0.5 rounded-md bg-primary/90 text-primary-foreground text-xs font-medium capitalize">
                            {t.segment}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-background/90 text-xs font-medium">
                          {t.marketZone || '—'}
                        </span>
                        {t.isGlobalTrendAlert && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-xs font-medium">
                            Global Trend Alert
                          </span>
                        )}
                        {((t as any).outfityIVS || t.trendScore) && (
                          <span className="px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold border border-white/20">
                            IVS {(t as any).outfityIVS || t.trendScore}%
                          </span>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-semibold line-clamp-4 leading-snug">{t.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t.category} {t.cut ? `· ${t.cut}` : ''} {(() => {
                          const b = (t as unknown as { productBrand?: string | null }).productBrand ?? getProductBrand(t.name, t.sourceBrand);
                          return b ? `· ${b}` : '';
                        })()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(t.material && t.material.trim() && t.material !== 'Non spécifié') ? t.material : ''}
                      </p>
                      <Link
                        href={`/trends/${t.id}`}
                        className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-semibold transition-all hover:bg-muted hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-3"
                        onClick={handleAnalyzeClick}
                      >
                        Analyser la tendance
                      </Link>
                      {t.businessAnalysis ? (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-3 border-t pt-2">
                          {t.businessAnalysis}
                        </p>
                      ) : null}
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Ces tendances sont mises à jour chaque semaine.
      </p>
    </div>
  );
}
