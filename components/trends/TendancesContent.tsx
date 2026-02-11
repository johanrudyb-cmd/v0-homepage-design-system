'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProductBrand } from '@/lib/brand-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2, Eye, ChevronDown, ChevronUp, Globe, AlertTriangle, Flame, MapPin, CheckCircle } from 'lucide-react';

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
  /** % croissance Zalando (ex. 15 pour "+15%") ou manuel */
  trendGrowthPercent: number | null;
  /** Libellé Zalando (ex. "Tendance", "En hausse") */
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
  const [trendsLoading, setTrendsLoading] = useState(true);
  const { data: session } = useSession();
  const user = session?.user as any;
  const [zone, setZone] = useState<string>('EU');
  const [homepageIds, setHomepageIds] = useState<Set<string>>(new Set());
  const [analysesCount, setAnalysesCount] = useState<number | null>(null);
  const limitReached = searchParams.get('limit') === 'reached';
  const [ageRange, setAgeRange] = useState<'18-24' | '25-34'>(() => {
    if (typeof window === 'undefined') return '25-34';
    const a = sessionStorage.getItem('trends-list-ageRange');
    if (a === '18-24' || a === '25-34') return a;
    return '25-34';
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="w-7 h-7" />
          Tendances de la semaine
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          Les tendances sont mises à jour chaque semaine. Consultez les tendances par marché ci-dessous.
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Filtre par cible : 18-24 ans ou 25-34 ans.
        </p>
      </div>

      {/* Tendances par marché — contenu principal en premier */}
      <div>
        {brandFromUrl && (
          <div className="mb-4 p-3 rounded-lg border bg-muted/30 flex items-center gap-3">
            <span className="text-sm font-medium">Filtre :</span>
            <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold">{brandFromUrl}</span>
            <Link href="/trends" className="text-sm text-muted-foreground hover:text-foreground underline">
              Voir toutes les tendances
            </Link>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{brandFromUrl ? `Tendances ${brandFromUrl}` : 'Tendances par marché'}</h2>
            <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20" title="Cible âge">
              {AGE_LABELS[ageRange]}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex rounded-lg border border-input bg-muted/30 p-0.5" role="group" aria-label="Tranche d'âge">
              <button
                type="button"
                onClick={() => setAgeRange('18-24')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${ageRange === '18-24' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                18-24 ans
              </button>
              <button
                type="button"
                onClick={() => setAgeRange('25-34')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${ageRange === '25-34' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                25-34 ans
              </button>
            </div>
            <div className="flex rounded-lg border border-input bg-muted/30 p-0.5">
              <button
                type="button"
                onClick={() => setSegment('homme')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${segment === 'homme' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Homme
              </button>
              <button
                type="button"
                onClick={() => setSegment('femme')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${segment === 'femme' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Femme
              </button>
            </div>
            <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-md bg-muted/60">Zone EU</span>
            <label className="text-sm font-medium">Tri</label>
            <select
              value={sortBy === 'priceAsc' || sortBy === 'priceDesc' ? 'best' : sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="best">Meilleures tendances (score)</option>
              <option value="recent">Plus récents</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-9 text-sm"
              onClick={() => setAdvancedFiltersOpen((v) => !v)}
            >
              Filtres avancés
            </Button>
          </div>
        </div>
        {advancedFiltersOpen && (
          <div className="mb-4 p-3 rounded-lg border bg-muted/30 flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={globalOnly}
                onChange={(e) => setGlobalOnly(e.target.checked)}
              />
              Global Trend Alert uniquement
            </label>
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>Indicateur tendance basé sur plus de 15 000 références.</span>
        </p>
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
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
              {trends.map((t) => {
                const isFree = user?.plan === 'free';
                const isVisible = !isFree || homepageIds.has(t.id);
                const canAnalyze = !isFree || (analysesCount !== null && analysesCount < 3);
                const handleAnalyzeClick = (e: React.MouseEvent) => {
                  if (isFree && !canAnalyze) {
                    e.preventDefault();
                    router.push('/auth/choose-plan');
                    return;
                  }
                  if (isFree && !isVisible) {
                    e.preventDefault();
                    router.push('/auth/choose-plan');
                    return;
                  }
                  try {
                    sessionStorage.setItem('trends-list-scroll', String(window.scrollY ?? document.documentElement.scrollTop ?? 0));
                    sessionStorage.setItem('trends-list-segment', segment || 'homme');
                    sessionStorage.setItem('trends-list-ageRange', ageRange || '25-34');
                  } catch (_) { }
                };
                return (
                  <Card key={t.id} className={`overflow-hidden flex flex-col relative ${isFree && !isVisible ? 'blur-sm' : ''}`}>
                    {isFree && !isVisible && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 rounded-lg">
                        <Link
                          href="/auth/choose-plan"
                          className="px-4 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-100"
                        >
                          Passer au plan Créateur pour voir
                        </Link>
                      </div>
                    )}
                    <div className="aspect-[3/4] bg-muted relative shrink-0">
                      {t.imageUrl ? (
                        <img
                          src={t.imageUrl}
                          alt={t.name}
                          className="w-full h-full object-cover"
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
                      </div>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-semibold line-clamp-4 leading-snug">{t.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t.category} · {t.cut || '—'} · {(() => { const b = (t as unknown as { productBrand?: string | null }).productBrand ?? getProductBrand(t.name, t.sourceBrand); return b; })()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(t.material && t.material.trim() && t.material !== 'Non spécifié') ? t.material : '—'}
                      </p>
                      <Link
                        href={isFree && (!canAnalyze || !isVisible) ? '/auth/choose-plan' : `/trends/${t.id}`}
                        className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-semibold transition-all hover:bg-muted hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-3"
                        onClick={handleAnalyzeClick}
                      >
                        {isFree && !canAnalyze ? 'Limite atteinte — Passer au plan Créateur' : 'Analyser la tendance'}
                      </Link>
                      {t.businessAnalysis ? (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-3 border-t pt-2">
                          {t.businessAnalysis}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Ces tendances sont mises à jour chaque semaine.
            </p>
          </>
        )}
      </div>

      {/* Carte : Récupérer les tendances (Scrape + Prévisualiser) */}
      <Card className="flex flex-col border-2 border-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">Récupérer les tendances</CardTitle>
                <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20" title="Cible âge">
                  {AGE_LABELS[ageRange]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Récupérer et enregistrer directement, ou prévisualiser avant d&apos;enregistrer.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3 border-b">
            <Button
              variant={recoveryTab === 'scrape' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRecoveryTab('scrape')}
            >
              Récupérer et enregistrer
            </Button>
            <Button
              variant={recoveryTab === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRecoveryTab('preview')}
            >
              Prévisualiser avant d&apos;enregistrer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {recoveryTab === 'scrape' && (
            <>
              {ageRange === '18-24' ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Récupère les tendances 18-24 ans ({segment === 'femme' ? 'femme' : 'homme'}) et enregistre directement dans les tendances ci-dessus (~1 à 2 min).
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => handleScrapeOnly(ASOS_18_24_SOURCE_ID)}
                      disabled={scrapingOnly}
                      variant="default"
                      size="sm"
                      className="gap-2"
                      title={segment === 'femme' ? 'Récupérer les tendances 18-24 ans Femme' : 'Récupérer les tendances 18-24 ans Homme'}
                    >
                      {scrapingOnly ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Récupération en cours…
                        </>
                      ) : (
                        <>
                          <Flame className="w-4 h-4" />
                          Récupérer les tendances 18-24 ans {segment === 'femme' ? 'Femme' : 'Homme'}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setRecoveryTab('preview')}
                    >
                      <Eye className="w-4 h-4" />
                      Ou prévisualiser d&apos;abord
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Choisissez une ville pour récupérer et enregistrer les tendances (~1 min par ville). « Toutes les villes » récupère toutes les tendances (~10 min).
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MAIN_CITY_IDS.map((id: string) => (
                      <Button
                        key={id}
                        type="button"
                        onClick={() => handleScrapeOnly(id)}
                        disabled={scrapingOnly}
                        variant="default"
                        size="sm"
                        className="gap-2"
                        title={`${getCityLabel(id)} ${segment === 'femme' ? 'Femme' : 'Homme'} — ~1 min`}
                      >
                        {scrapingOnly ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Récupération…
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4" />
                            {getCityLabel(id)}
                          </>
                        )}
                      </Button>
                    ))}
                    <Button
                      onClick={() => setMoreCitiesOpen((v) => !v)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${moreCitiesOpen ? 'rotate-180' : ''}`} />
                      + autres villes
                    </Button>
                    {moreCitiesOpen && (
                      <div className="w-full flex flex-wrap gap-2">
                        {OTHER_CITY_IDS.map((id) => (
                          <Button
                            key={id}
                            onClick={() => handleScrapeOnly(id)}
                            disabled={scrapingOnly}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            title={`${getCityLabel(id)} ${segment === 'femme' ? 'Femme' : 'Homme'} — ~1 min`}
                          >
                            <MapPin className="w-4 h-4" />
                            {getCityLabel(id)}
                          </Button>
                        ))}
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={() => handleScrapeOnly(false)}
                      disabled={scrapingOnly}
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      title={`Toutes les villes ${segment === 'femme' ? 'Femme' : 'Homme'} — ~10 min`}
                    >
                      <Globe className="w-4 h-4" />
                      Toutes les villes
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
          {recoveryTab === 'preview' && (
            <>
              {ageRange === '18-24' ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Prévisualisez les tendances 18-24 ans ({segment === 'femme' ? 'femme' : 'homme'}) (ou collez une URL), puis validez pour enregistrer dans les tendances.
                  </p>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">URL de la page (optionnel — prioritaire)</label>
                    <input
                      type="url"
                      value={customPreviewUrl}
                      onChange={(e) => setCustomPreviewUrl(e.target.value)}
                      placeholder="https://…"
                      className="h-9 px-3 rounded-md border border-input bg-background text-sm w-full max-w-xl font-mono text-xs"
                      disabled={previewLoading}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handlePreviewByCity(ASOS_18_24_SOURCE_ID)}
                      disabled={previewLoading}
                      variant="default"
                      size="sm"
                      className="gap-2"
                      title={segment === 'femme' ? 'Prévisualiser les tendances 18-24 ans Femme' : 'Prévisualiser les tendances 18-24 ans Homme'}
                    >
                      {previewLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Prévisualisation…
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Prévisualiser les tendances 18-24 ans {segment === 'femme' ? 'Femme' : 'Homme'}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handlePreviewByCity()}
                      disabled={previewLoading || !customPreviewUrl.trim()}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      title="Prévisualiser l’URL collée"
                    >
                      <Eye className="w-4 h-4" />
                      Prévisualiser l’URL
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Collez l&apos;URL ou choisissez une ville pour voir un aperçu avant d&apos;enregistrer. Puis validez pour enregistrer dans les tendances.
                  </p>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">URL de la page (optionnel — prioritaire)</label>
                    <input
                      type="url"
                      value={customPreviewUrl}
                      onChange={(e) => setCustomPreviewUrl(e.target.value)}
                      placeholder="https://…"
                      className="h-9 px-3 rounded-md border border-input bg-background text-sm w-full max-w-xl font-mono text-xs"
                      disabled={previewLoading}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-sm font-medium">Ou ville</label>
                    <select
                      value={selectedSourceId}
                      onChange={(e) => setSelectedSourceId(e.target.value)}
                      className="h-9 px-3 rounded-md border border-input bg-background text-sm min-w-[180px]"
                      disabled={previewLoading}
                    >
                      <option value="">— Choisir —</option>
                      {sourcesForZone.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label} ({s.marketZone})
                        </option>
                      ))}
                    </select>
                    {MAIN_CITY_IDS.map((id: string) => (
                      <Button
                        key={id}
                        onClick={() => handlePreviewByCity(id)}
                        disabled={previewLoading}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        title={`Prévisualiser ${getCityLabel(id)}`}
                      >
                        <MapPin className="w-4 h-4" />
                        {getCityLabel(id)}
                      </Button>
                    ))}
                    <Button
                      onClick={() => setMoreCitiesOpen((v) => !v)}
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-muted-foreground"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${moreCitiesOpen ? 'rotate-180' : ''}`} />
                      + autres villes
                    </Button>
                    {moreCitiesOpen && (
                      <div className="w-full flex flex-wrap gap-2">
                        {OTHER_CITY_IDS.map((id) => (
                          <Button
                            key={id}
                            onClick={() => handlePreviewByCity(id)}
                            disabled={previewLoading}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            title={`Prévisualiser ${getCityLabel(id)}`}
                          >
                            <MapPin className="w-4 h-4" />
                            {getCityLabel(id)}
                          </Button>
                        ))}
                      </div>
                    )}
                    <Button
                      onClick={() => handlePreviewByCity()}
                      disabled={previewLoading || (!selectedSourceId && !customPreviewUrl.trim())}
                      variant="default"
                      size="sm"
                      className="gap-2"
                    >
                      {previewLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Prévisualisation…
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Prévisualiser
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
              {previewResult && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      {previewResult.sourceId} — {previewResult.itemCount} produit{previewResult.itemCount !== 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="text-xs text-muted-foreground whitespace-nowrap">
                        Pourcentage tendance par défaut (0–100) :
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="ex. 15"
                        value={defaultTrendPercent}
                        onChange={(e) => setDefaultTrendPercent(e.target.value)}
                        className="w-20 h-9 rounded-lg border border-input bg-background px-2 text-sm"
                        title="Appliqué aux articles sans indicateur de croissance"
                      />
                      <Button
                        type="button"
                        onClick={handleValidatePreview}
                        disabled={savingPreview}
                        variant="default"
                        size="sm"
                        className="gap-2"
                      >
                        {savingPreview ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Valider et enregistrer
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {previewResult.items.map((item, idx) => (
                      <div key={idx} className="rounded-lg border overflow-hidden bg-background flex flex-col">
                        <div className="aspect-square bg-muted relative">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Pas d&apos;image</div>
                          )}
                        </div>
                        <div className="p-2 text-xs min-w-0">
                          <p className="text-sm font-medium line-clamp-3 leading-snug">{item.name || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Résultat récupération */}
      {scrapeOnlyResult && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Produits récupérés ({scrapeOnlyResult.totalItems} produits)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Cliquez sur une source pour afficher les produits.
            </p>
            {scrapeOnlyResult.savedToTrends != null && scrapeOnlyResult.savedToTrends > 0 && (
              <p className="text-sm text-primary font-medium mt-1">
                {scrapeOnlyResult.savedToTrends} tendance(s) enregistrée(s) — affichées dans « Tendances par marché » ci-dessus.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {scrapeOnlyResult.results.map((source) => {
              const isExpanded = scrapeOnlyExpanded === source.sourceId;
              return (
                <div key={source.sourceId} className="border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setScrapeOnlyExpanded(isExpanded ? null : source.sourceId)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted text-left text-sm font-medium"
                  >
                    <span>
                      {source.marketZone} — {source.itemCount} produit{source.itemCount !== 1 ? 's' : ''}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isExpanded && (
                    <div className="p-4 border-t bg-background">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {source.items.map((item, idx) => {
                          const hasTechPack = Boolean(item.composition || item.careInstructions || item.color || item.sizes || item.countryOfOrigin || item.articleNumber);
                          return (
                            <div
                              key={idx}
                              className="rounded-lg border overflow-hidden bg-muted/30 flex flex-col"
                            >
                              <div className="aspect-square bg-muted relative">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                    Pas d&apos;image
                                  </div>
                                )}
                              </div>
                              <div className="p-2 text-xs flex-1 flex flex-col min-w-0">
                                <p className="text-sm font-medium line-clamp-3 leading-snug">{item.name || '—'}</p>
                                {hasTechPack && (
                                  <>
                                    {item.articleNumber && <p className="mt-1 text-muted-foreground line-clamp-1">Ref: {item.articleNumber}</p>}
                                    {item.color && <p className="text-muted-foreground line-clamp-1">Couleur: {item.color}</p>}
                                    {item.composition && <p className="text-muted-foreground line-clamp-2 mt-0.5">Compo: {item.composition}</p>}
                                    {item.careInstructions && <p className="text-muted-foreground line-clamp-1">Entretien: {item.careInstructions}</p>}
                                    {item.sizes && <p className="text-muted-foreground line-clamp-1">Tailles: {item.sizes}</p>}
                                    {item.countryOfOrigin && <p className="text-muted-foreground line-clamp-1">Origine: {item.countryOfOrigin}</p>}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
