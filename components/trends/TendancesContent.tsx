'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2, Eye, ChevronDown, ChevronUp, Copy, Check, Globe, Sparkles, AlertTriangle, Flame, MapPin, CheckCircle } from 'lucide-react';

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
  /** % croissance Zalando (ex. 15 pour "+15%") */
  trendGrowthPercent: number | null;
  /** Libellé Zalando (ex. "Tendance", "En hausse") */
  trendLabel: string | null;
  imageUrl: string | null;
  sourceBrand: string | null;
  isGlobalTrendAlert: boolean;
  businessAnalysis: string | null;
}

export function TendancesContent() {
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
  const [copiedTechPackId, setCopiedTechPackId] = useState<string | null>(null);
  const [scrapeOnlyExpanded, setScrapeOnlyExpanded] = useState<string | null>(null);

  const [sourcesList, setSourcesList] = useState<{ id: string; label: string; marketZone: string; segment: string; brand: string }[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [customPreviewUrl, setCustomPreviewUrl] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
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
  const [zone, setZone] = useState<string>('');
  const [segment, setSegment] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('best');
  const [globalOnly, setGlobalOnly] = useState(false);
  const [generatingAnalysis, setGeneratingAnalysis] = useState<string | null>(null);

  const loadTrends = useCallback(async () => {
    setTrendsLoading(true);
    try {
      const params = new URLSearchParams();
      if (zone) params.set('marketZone', zone);
      if (segment) params.set('segment', segment);
      if (sortBy) params.set('sortBy', sortBy);
      if (globalOnly) params.set('globalOnly', 'true');
      params.set('limit', '50');
      const res = await fetch(`/api/trends/hybrid-radar?${params.toString()}`);
      const data = await res.json();
      setTrends(data.trends || []);
    } catch (e) {
      console.error(e);
      setTrends([]);
    } finally {
      setTrendsLoading(false);
    }
  }, [zone, segment, sortBy, globalOnly]);

  useEffect(() => {
    loadTrends();
  }, [loadTrends]);

  useEffect(() => {
    fetch('/api/trends/hybrid-radar/sources')
      .then((r) => r.json())
      .then((data) => setSourcesList(data.sources || []))
      .catch(() => setSourcesList([]));
  }, []);

  const generateBusinessAnalysis = async (productId: string) => {
    setGeneratingAnalysis(productId);
    try {
      const res = await fetch('/api/trends/hybrid-radar/business-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) await loadTrends();
      else alert((await res.json()).error || 'Erreur');
    } finally {
      setGeneratingAnalysis(null);
    }
  };

  const handlePreviewByCity = async () => {
    const useCustomUrl = customPreviewUrl.trim().length > 0;
    if (!useCustomUrl && !selectedSourceId) {
      alert('Choisissez une ville / source ou collez l\'URL de la page Zalando à scraper.');
      return;
    }
    setPreviewLoading(true);
    setPreviewResult(null);
    try {
      const body: { sourceId?: string; customUrl?: string; brand: string; saveToTrends: boolean } = {
        brand: 'Zalando',
        saveToTrends: false,
      };
      if (useCustomUrl) body.customUrl = customPreviewUrl.trim();
      else body.sourceId = selectedSourceId;
      const res = await fetch('/api/trends/hybrid-radar/scrape-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
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
    setSavingPreview(true);
    try {
      const res = await fetch('/api/trends/hybrid-radar/save-from-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: previewResult.sourceId,
          brand: previewResult.brand,
          marketZone: previewResult.marketZone,
          segment: previewResult.segment,
          items: previewResult.items,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await loadTrends();
        setPreviewResult(null);
        const saved = data.savedToTrends ?? 0;
        const skipped = data.skipped?.total ?? 0;
        if (skipped > 0) {
          alert(
            `${saved} tendance(s) enregistrée(s). ${skipped} article(s) non enregistré(s) (URL non valide ou doublon : ${data.skipped.invalidUrl ?? 0} URL invalide, ${data.skipped.duplicate ?? 0} doublon).`
          );
        } else {
          alert(`${saved} tendance(s) enregistrée(s).`);
        }
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSavingPreview(false);
    }
  };

  const handleScrapeOnly = async (quickPreview = false) => {
    setScrapingOnly(true);
    setScrapeOnlyResult(null);
    try {
      const body = quickPreview
        ? { brand: 'Zalando', sourceId: 'zalando-trend-homme-paris', saveToTrends: true }
        : { brand: 'Zalando', saveToTrends: true };
      const res = await fetch('/api/trends/hybrid-radar/scrape-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setScrapeOnlyResult({
          totalItems: data.totalItems,
          savedToTrends: data.savedToTrends,
          results: data.results || [],
        });
        if (data.savedToTrends > 0) {
          await loadTrends();
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
          Tendances
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          Produits tendance scrapés (Zalando) et tendances par marché avec filtres.
        </p>
      </div>

      {/* Carte d'action — Produits tendance Zalando */}
      <Card className="flex flex-col border-2 hover:border-primary/30 transition-colors">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Produits tendance (Zalando)</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Récupérer les articles tendance avec infos tech pack. Copiez le tech pack pour vos fournisseurs.
                Pour ne pas attendre dans l&apos;app, lancez le scrape depuis le terminal : <code className="text-xs bg-muted px-1 rounded">npm run scrape:zalando:quick</code> (1 source) ou <code className="text-xs bg-muted px-1 rounded">npm run scrape:zalando</code> (toutes), puis rafraîchissez cette page.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 mt-auto flex flex-wrap gap-2">
          <Button
            onClick={() => handleScrapeOnly(true)}
            disabled={scrapingOnly}
            variant="default"
            size="sm"
            className="gap-2"
            title="1 source (Paris Homme) — environ 1 min"
          >
            {scrapingOnly ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scrape en cours…
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Aperçu rapide Paris Homme (~1 min)
              </>
            )}
          </Button>
          <Button
            onClick={() => handleScrapeOnly(false)}
            disabled={scrapingOnly}
            variant="outline"
            size="sm"
            className="gap-2"
            title="Toutes les sources Zalando (20) — plusieurs minutes"
          >
            <Eye className="w-4 h-4" />
            Scrape complet (toutes sources)
          </Button>
        </CardContent>
      </Card>

      {/* Prévisualiser par ville → valider */}
      <Card className="flex flex-col border-2 border-dashed border-primary/30">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Prévisualiser par ville ou par URL</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Choisissez une ville (source) ou collez directement l&apos;URL de la page Zalando à scraper (ex. trend-spotter/paris?gender=MEN), puis lancez la prévisualisation.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">URL de la page (optionnel — prioritaire)</label>
            <input
              type="url"
              value={customPreviewUrl}
              onChange={(e) => setCustomPreviewUrl(e.target.value)}
              placeholder="https://www.zalando.fr/trend-spotter/paris?gender=MEN"
              className="h-9 px-3 rounded-md border border-input bg-background text-sm w-full max-w-xl font-mono text-xs"
              disabled={previewLoading}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium">Ou ville / source</label>
            <select
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm min-w-[180px]"
              disabled={previewLoading}
            >
              <option value="">— Choisir —</option>
              {sourcesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <Button
              onClick={handlePreviewByCity}
              disabled={previewLoading || !selectedSourceId}
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
          {previewResult && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {previewResult.brand} — {previewResult.sourceId} : {previewResult.itemCount} produit{previewResult.itemCount !== 1 ? 's' : ''}
                </p>
                <Button
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {previewResult.items.map((item, idx) => (
                  <div key={idx} className="rounded-lg border overflow-hidden bg-background flex flex-col">
                    <div className="aspect-square bg-muted relative">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Pas d&apos;image</div>
                      )}
                      {item.trendGrowthPercent != null && (
                        <div className="absolute top-1 right-1 rounded px-1.5 py-0.5 bg-orange-500/95 text-white text-xs font-semibold flex items-center gap-0.5">
                          <Flame className="w-3 h-3" />
                          +{item.trendGrowthPercent}%
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-xs min-w-0">
                      <p className="font-medium line-clamp-2 leading-tight">{item.name || '—'}</p>
                      <p className="text-primary mt-0.5">
                        {Number(item.price) > 0 ? `${Number(item.price).toFixed(2)} €` : 'Prix non détecté'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résultat scrape */}
      {scrapeOnlyResult && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Produits récupérés ({scrapeOnlyResult.totalItems} produits)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Cliquez sur une source pour afficher les produits. Utilisez « Copier tech pack » pour fournisseur.
            </p>
            {scrapeOnlyResult.savedToTrends != null && scrapeOnlyResult.savedToTrends > 0 && (
              <p className="text-sm text-primary font-medium mt-1">
                {scrapeOnlyResult.savedToTrends} tendance(s) enregistrée(s) — affichées dans « Tendances par marché » ci-dessous.
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
                      {source.brand} ({source.marketZone}) — {source.itemCount} produit{source.itemCount !== 1 ? 's' : ''}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isExpanded && (
                    <div className="p-4 border-t bg-background">
                      <p className="text-xs text-muted-foreground mb-3 truncate" title={source.url}>
                        {source.url}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {source.items.map((item, idx) => {
                          const itemId = `${source.sourceId}-${idx}`;
                          const hasTechPack = Boolean(item.composition || item.careInstructions || item.color || item.sizes || item.countryOfOrigin || item.articleNumber);
                          const buildTechPackText = () => {
                            const lines: string[] = [
                              `--- TECH PACK / FOURNISSEUR ---`,
                              `Nom: ${item.name || '—'}`,
                              `Prix: ${Number(item.price) > 0 ? `${Number(item.price).toFixed(2)} €` : '—'}`,
                              `Référence / Article: ${item.articleNumber || '—'}`,
                              `Couleur: ${item.color || '—'}`,
                              `Composition: ${item.composition || '—'}`,
                              `Entretien: ${item.careInstructions || '—'}`,
                              `Tailles: ${item.sizes || '—'}`,
                              `Pays d'origine: ${item.countryOfOrigin || '—'}`,
                              `Lien: ${item.sourceUrl || ''}`,
                              `---`,
                            ];
                            return lines.join('\n');
                          };
                          const handleCopyTechPack = async () => {
                            try {
                              await navigator.clipboard.writeText(buildTechPackText());
                              setCopiedTechPackId(itemId);
                              setTimeout(() => setCopiedTechPackId(null), 2000);
                            } catch (_) {}
                          };
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
                                <p className="font-medium line-clamp-2 leading-tight">{item.name || '—'}</p>
                                <p className="text-primary mt-0.5">
                                  {Number(item.price) > 0 ? `${Number(item.price).toFixed(2)} €` : 'Prix non détecté'}
                                </p>
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
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 w-full gap-1 text-xs"
                                  onClick={handleCopyTechPack}
                                  title="Copier pour fournisseur / tech pack"
                                >
                                  {copiedTechPackId === itemId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  {copiedTechPackId === itemId ? 'Copié' : 'Copier tech pack'}
                                </Button>
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

      {/* Tendances par marché — filtres Zone, Segment, Tri */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Tendances par marché</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-sm font-medium">Segment</label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Tous</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
            <label className="text-sm font-medium">Zone</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">FR + EU</option>
              <option value="FR">France</option>
              <option value="EU">Europe</option>
            </select>
            <label className="text-sm font-medium">Tri</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="best">Meilleures tendances (score)</option>
              <option value="recent">Plus récents</option>
              <option value="priceAsc">Prix croissant</option>
              <option value="priceDesc">Prix décroissant</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={globalOnly}
                onChange={(e) => setGlobalOnly(e.target.checked)}
              />
              Global Trend Alert uniquement
            </label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>Indicateur tendance : % Zalando (Tendance, En hausse…) quand disponible ; sinon score interne. Cohérent avec les filtres.</span>
        </p>
        {trendsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-12">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement des tendances…
          </div>
        ) : trends.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune tendance enregistrée pour le moment.</p>
              <p className="text-sm mt-1">Seules les tendances réelles (Zalando, ASOS, Zara) sur les marchés FR et EU sont affichées. Lancez un scrape pour alimenter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {trends.map((t) => (
              <Card key={t.id} className="overflow-hidden flex flex-col">
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
                  {/* Indicateur tendance : % Zalando (Tendance, En hausse…) ou score interne */}
                  {(t.trendGrowthPercent != null || (t.trendScoreVisual ?? 0) >= 50) && (
                    <div
                      className={`absolute top-2 right-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold shadow-md ${
                        (t.trendGrowthPercent ?? 0) >= 100 || (t.trendScoreVisual ?? 0) >= 70
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                          : 'bg-orange-500/95 text-white'
                      }`}
                      title={t.trendLabel ?? 'Tendance'}
                    >
                      <Flame className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {t.trendGrowthPercent != null
                          ? (t.trendLabel ? `${t.trendLabel} ` : '') + `+${t.trendGrowthPercent}%`
                          : `Tendance +${Math.round(t.trendScoreVisual ?? 0)}%`}
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold line-clamp-2 leading-tight">{t.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.category} · {t.cut || '—'} · {t.sourceBrand || '—'}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
                    <p className="text-sm font-medium flex items-center gap-1">
                      {(t.trendGrowthPercent != null || (t.trendScoreVisual ?? 0) >= 50) && (
                        <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      )}
                      {t.trendGrowthPercent != null
                        ? `${t.trendLabel ?? 'Tendance'} +${t.trendGrowthPercent}%`
                        : `Score : ${t.trendScoreVisual ?? '—'}/100`}
                    </p>
                    {t.averagePrice > 0 && (
                      <p className="text-sm text-primary font-medium">
                        {Number(t.averagePrice).toFixed(2)} €
                      </p>
                    )}
                  </div>
                  {t.businessAnalysis ? (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3 border-t pt-2">
                      {t.businessAnalysis}
                    </p>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 gap-1 text-xs"
                      disabled={generatingAnalysis === t.id}
                      onClick={() => generateBusinessAnalysis(t.id)}
                    >
                      {generatingAnalysis === t.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Générer analyse business
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
