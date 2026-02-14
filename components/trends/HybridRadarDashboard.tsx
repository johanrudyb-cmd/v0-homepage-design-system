'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Zap, Upload, Loader2, AlertTriangle, Sparkles, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { GenerationCostBadge } from '@/components/ui/generation-cost-badge';
import { GenerationLoadingPopup } from '@/components/ui/generation-loading-popup';
import { getProductBrand } from '@/lib/brand-utils';
import { safeDisplayBrand } from '@/lib/constants/retailer-exclusion';

interface HybridTrend {
  id: string;
  name: string;
  category: string;
  marketZone: string | null;
  cut: string | null;
  trendScoreVisual: number | null;
  imageUrl: string | null;
  sourceBrand: string | null;
  isGlobalTrendAlert: boolean;
  businessAnalysis: string | null;
}

export function HybridRadarDashboard() {
  const [trends, setTrends] = useState<HybridTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [zone, setZone] = useState<string>('');
  const [globalOnly, setGlobalOnly] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    matchInZones: string[];
    analysis?: { cut: string; productSignature: string };
    message: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingAnalysis, setGeneratingAnalysis] = useState<string | null>(null);
  const [scrapingOnly, setScrapingOnly] = useState(false);
  const [scrapeOnlyResult, setScrapeOnlyResult] = useState<{
    totalItems: number;
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

  const loadTrends = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (zone) params.set('marketZone', zone);
      if (globalOnly) params.set('globalOnly', 'true');
      params.set('limit', '50');
      const res = await fetch(`/api/trends/hybrid-radar?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      setTrends(data.trends || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [zone, globalOnly]);

  useEffect(() => {
    loadTrends();
  }, [loadTrends]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/trends/hybrid-radar/scan', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await loadTrends();
        alert(`Scan terminé. ${data.totalSaved} tendances enregistrées.`);
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setScanning(false);
    }
  };

  const handleScrapeOnly = async () => {
    setScrapingOnly(true);
    setScrapeOnlyResult(null);
    try {
      const res = await fetch('/api/trends/hybrid-radar/scrape-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: 'Zalando' }),
      });
      const data = await res.json();
      if (res.ok) {
        setScrapeOnlyResult({ totalItems: data.totalItems, results: data.results || [] });
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setScrapingOnly(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const form = new FormData();
      form.append('image', uploadFile);
      const res = await fetch('/api/trends/check-trend-image', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadResult({
          matchInZones: data.matchInZones || [],
          analysis: data.analysis,
          message: data.message || '',
        });
      } else {
        setUploadResult({ matchInZones: [], message: data.error || 'Erreur' });
      }
    } catch (e) {
      setUploadResult({
        matchInZones: [],
        message: e instanceof Error ? e.message : 'Erreur',
      });
    } finally {
      setUploading(false);
    }
  };

  const generateBusinessAnalysis = async (productId: string) => {
    setGeneratingAnalysis(productId);
    try {
      const res = await fetch('/api/trends/hybrid-radar/business-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        await loadTrends();
      } else {
        alert(data.error || 'Erreur');
      }
    } finally {
      setGeneratingAnalysis(null);
    }
  };

  return (
    <div className="space-y-8">
      <GenerationLoadingPopup
        open={uploading}
        title="Analyse de l'image en cours…"
        messages={[
          "Scan des bases de données mondiales...",
          "Analyse de la récurrence visuelle...",
          "Calcul du score de viralité...",
          "Détection des signaux faibles...",
        ]}
      />
      <GenerationLoadingPopup
        open={!!generatingAnalysis}
        title="Génération de l'analyse business…"
        messages={[
          "Étude des volumes de recherche...",
          "Analyse de la saturation marché...",
          "Calcul des marges prévisionnelles...",
          "Extraction des opportunités locales...",
        ]}
      />
      <GenerationLoadingPopup
        open={scanning}
        title="Scan des tendances en cours…"
        messages={[
          "Inspection des boutiques leaders...",
          "Filtrage des nouveaux produits...",
          "Détection des ruptures de stock...",
          "Correlation multi-marchés...",
        ]}
      />
      <GenerationLoadingPopup
        open={scrapingOnly}
        title="Récupération des données…"
        messages={[
          "Connexion aux sources mondiales...",
          "Capture des visuels produits...",
          "Collecte des métadonnées techniques...",
          "Normalisation des informations...",
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Globe className="w-7 h-7" />
          Trend Radar Hybride (Mondial)
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          Données réelles + IA Vision (analyse). Tendances par zone (France, Europe, USA, Asie). Badge Global Trend Alert si tendance présente dans 2+ zones.
        </p>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-4 items-end">
          <Button
            onClick={handleScrapeOnly}
            disabled={scrapingOnly || scanning}
            variant="outline"
            size="sm"
            className="gap-2"
            title="Voir les données récupérées (sans IA ni enregistrement)"
          >
            {scrapingOnly ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Récupération en cours…
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Récupérer les données
              </>
            )}
          </Button>
          <Button
            onClick={handleScan}
            disabled={scanning || scrapingOnly}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {scanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scan en cours…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Lancer le scan (New In par zone)
              </>
            )}
          </Button>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-sm font-medium">Zone</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Toutes</option>
              <option value="FR">France</option>
              <option value="EU">Europe</option>
              <option value="US">USA</option>
              <option value="ASIA">Asie</option>
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
        </CardContent>
      </Card>

      {/* Résultat scrape seul (données brutes) */}
      {scrapeOnlyResult && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Données récupérées ({scrapeOnlyResult.totalItems} produits, sans IA)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Cliquez sur une source pour afficher les produits récupérés.
            </p>
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
                          const hasTechPack = item.composition || item.careInstructions || item.color || item.sizes || item.countryOfOrigin || item.articleNumber;
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

      {/* Upload photo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Déposer une photo : est-ce une tendance actuelle ?
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Uploadez une image produit ; le système indique si c&apos;est une tendance en Europe, USA ou Asie.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setUploadFile(e.target.files?.[0] ?? null);
                setUploadResult(null);
              }}
              className="text-sm"
            />
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || uploading}
              size="sm"
              className="gap-2"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Analyser
            </Button>
          </div>
          {uploadResult && (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium">{uploadResult.message}</p>
              {uploadResult.matchInZones?.length > 0 && (
                <p className="text-primary mt-1">
                  Zones : {uploadResult.matchInZones.join(', ')}
                </p>
              )}
              {uploadResult.analysis && (
                <p className="text-muted-foreground mt-1">
                  Coupe : {uploadResult.analysis.cut} · Signature : {uploadResult.analysis.productSignature}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des tendances */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Tendances de la semaine</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement…
          </div>
        ) : trends.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune marque configurée. Les marques (marché français d&apos;abord, homme/femme) seront ajoutées une par une.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  <h3 className="font-semibold line-clamp-2 leading-tight">{t.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.category} · {t.cut || '—'} · {safeDisplayBrand((t as { productBrand?: string | null }).productBrand ?? getProductBrand(t.name, t.sourceBrand))}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    Score tendance : {t.trendScoreVisual ?? '—'}/100
                  </p>
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
                      <GenerationCostBadge feature="trends_analyse" />
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
