'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, Search, RefreshCw, Copy, Download, X } from 'lucide-react';
import { GenerationCostBadge } from '@/components/ui/generation-cost-badge';
import { ConfirmGenerateModal } from '@/components/ui/confirm-generate-modal';
import { useQuota } from '@/lib/hooks/useQuota';
import { CURATED_TOP_BRANDS, CYCLE_PHASE_LABELS, LAUNCH_POTENTIAL_LABELS } from '@/lib/curated-brands';
import { StrategyPresentationView } from '@/components/launch-map/StrategyPresentationView';
import { GenerationLoadingPopup } from '@/components/ui/generation-loading-popup';
import { USAGE_REFRESH_EVENT } from '@/lib/hooks/useAIUsage';

interface BrandAnalyzerProps {
  initialBrand?: string;
}

export function BrandAnalyzer({ initialBrand = '' }: BrandAnalyzerProps) {
  const router = useRouter();
  const [brandName, setBrandName] = useState(initialBrand);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialBrand) setBrandName(initialBrand);
  }, [initialBrand]);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [visualIdentity, setVisualIdentity] = useState<{
    colorPalette?: { primary?: string; secondary?: string; accent?: string };
    typography?: { heading?: string; body?: string };
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyError, setStrategyError] = useState('');
  const [strategyResult, setStrategyResult] = useState<string | null>(null);
  const [creatorBrandName, setCreatorBrandName] = useState('');
  const [strategyBudget, setStrategyBudget] = useState('');
  const [strategyPositioning, setStrategyPositioning] = useState('');
  const [strategyTargetAudience, setStrategyTargetAudience] = useState('');
  const [showConfirmAnalyze, setShowConfirmAnalyze] = useState(false);
  const analyzeQuota = useQuota('brand_analyze');

  const curatedBrand = CURATED_TOP_BRANDS.find(
    (b) => b.brand.toLowerCase() === brandName.trim().toLowerCase()
  );

  const context = curatedBrand
    ? {
        signaturePiece: curatedBrand.signaturePiece,
        dominantStyle: curatedBrand.dominantStyle,
        cyclePhase: CYCLE_PHASE_LABELS[curatedBrand.cyclePhase],
        launchPotential: LAUNCH_POTENTIAL_LABELS[curatedBrand.launchPotential],
        indicativePrice: curatedBrand.indicativePrice,
        rank: curatedBrand.rank,
        score: curatedBrand.score,
      }
    : undefined;

  const handleAnalyze = async () => {
    const name = brandName.trim();
    if (!name || name.length < 2) {
      setError('Saisissez un nom de marque (2 caractères min.)');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);
    setVisualIdentity(null);

    try {
      const res = await fetch('/api/brands/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName: name, context }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse');
      }

      setAnalysis(data.analysis || '');
      setVisualIdentity(data.visualIdentity ?? null);
      window.dispatchEvent(new CustomEvent(USAGE_REFRESH_EVENT));
      router.replace(`/brands/analyze?brand=${encodeURIComponent(name)}`, { scroll: false });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const openStrategyModal = () => {
    setStrategyResult(null);
    setStrategyError('');
    setModalOpen(true);
  };

  const closeStrategyModal = () => {
    setModalOpen(false);
    setStrategyResult(null);
    setStrategyError('');
  };

  const handleGenerateStrategy = async () => {
    const name = creatorBrandName.trim();
    if (!name || name.length < 2) {
      setStrategyError('Saisissez le nom de votre marque (2 caractères min.)');
      return;
    }
    if (!analysis) {
      setStrategyError('Analyse de marque manquante.');
      return;
    }

    setStrategyLoading(true);
    setStrategyError('');
    setStrategyResult(null);

    try {
      const res = await fetch('/api/brands/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateBrandName: brandName.trim(),
          creatorBrandName: name,
          analysisText: analysis,
          budget: strategyBudget.trim() || undefined,
          positioning: strategyPositioning.trim() || undefined,
          targetAudience: strategyTargetAudience.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setStrategyResult(data.strategy || '');
      window.dispatchEvent(new CustomEvent(USAGE_REFRESH_EVENT));
    } catch (err: unknown) {
      setStrategyError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setStrategyLoading(false);
    }
  };

  const downloadStrategy = () => {
    if (!strategyResult || !creatorBrandName.trim()) return;
    const filename = `strategie-${creatorBrandName.trim().replace(/\s+/g, '-').toLowerCase()}.md`;
    const blob = new Blob([strategyResult], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Analyse de marque
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Analyse IA complète : positionnement, marketing, opportunités pour votre marque
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Analyser une marque
          </CardTitle>
          <CardDescription>
            Saisissez le nom d&apos;une marque de mode (ex. Zara, Arc&apos;teryx, Ami Paris) pour obtenir une analyse IA complète : positionnement, cible, stratégie marketing, opportunités et recommandations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Input
              type="text"
              placeholder="Nom de la marque..."
              value={brandName}
              onChange={(e) => {
                setBrandName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && setShowConfirmAnalyze(true)}
              className="flex-1 min-w-[200px]"
              disabled={loading}
            />
            <Button onClick={() => setShowConfirmAnalyze(true)} disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyse en cours…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyser
                  <GenerationCostBadge feature="brand_analyze" />
                </>
              )}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}
          {curatedBrand && (
            <p className="text-xs text-muted-foreground">
              Marque du top tendances — analyse enrichie avec pièce maîtresse, style dominant et potentiel de lancement.
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmGenerateModal
        open={showConfirmAnalyze}
        onClose={() => setShowConfirmAnalyze(false)}
        onConfirm={() => { setShowConfirmAnalyze(false); handleAnalyze(); }}
        actionLabel="Analyser cette marque"
        remaining={analyzeQuota?.remaining ?? 0}
        limit={analyzeQuota?.limit ?? 10}
        loading={loading}
      />

      <GenerationLoadingPopup
        open={loading || strategyLoading}
        title={loading ? 'Analyse de la marque en cours…' : 'Génération de la stratégie…'}
      />
      {/* Résultat : même présentation que les marques tendances (StrategyPresentationView) */}
      {analysis && (
        <>
          <StrategyPresentationView
            strategyText={analysis}
            brandName={brandName.trim()}
            templateBrandName={brandName.trim()}
            isTemplateView
            titleMode="analysis"
            visualIdentity={visualIdentity ? { colorPalette: visualIdentity.colorPalette, typography: visualIdentity.typography } : null}
            visualIdentityLocked
            onClose={() => { setAnalysis(null); setVisualIdentity(null); setModalOpen(false); }}
            optionalPrimaryAction={{
              label: 'Dupliquer pour ma marque',
              onClick: openStrategyModal,
            }}
          />
        </>
      )}

      {/* Modal Dupliquer pour ma marque */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95"
          onClick={(e) => e.target === e.currentTarget && closeStrategyModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="strategy-modal-title"
        >
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col border-2 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b shrink-0">
              <div>
                <CardTitle id="strategy-modal-title" className="text-lg flex items-center gap-2">
                  <Copy className="w-5 h-5" />
                  Dupliquer pour ma marque
                </CardTitle>
                <CardDescription>
                  Générez un plan stratégique personnalisé pour votre marque, inspiré de {brandName}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={closeStrategyModal} aria-label="Fermer">
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto flex-1 space-y-4">
              {!strategyResult ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor="creator-brand" className="text-sm font-medium">
                      Nom de votre marque <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="creator-brand"
                      placeholder="Ex. Ma Marque"
                      value={creatorBrandName}
                      onChange={(e) => {
                        setCreatorBrandName(e.target.value);
                        setStrategyError('');
                      }}
                      disabled={strategyLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="strategy-budget" className="text-sm font-medium text-muted-foreground">
                      Budget indicatif (optionnel)
                    </label>
                    <Input
                      id="strategy-budget"
                      placeholder="Ex. 5 000 € pour le lancement"
                      value={strategyBudget}
                      onChange={(e) => setStrategyBudget(e.target.value)}
                      disabled={strategyLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="strategy-positioning" className="text-sm font-medium text-muted-foreground">
                      Positionnement souhaité (optionnel)
                    </label>
                    <Input
                      id="strategy-positioning"
                      placeholder="Ex. streetwear premium, durable"
                      value={strategyPositioning}
                      onChange={(e) => setStrategyPositioning(e.target.value)}
                      disabled={strategyLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="strategy-audience" className="text-sm font-medium text-muted-foreground">
                      Cible visée (optionnel)
                    </label>
                    <Input
                      id="strategy-audience"
                      placeholder="Ex. 18-30 ans, urbains, sensibles à l'éthique"
                      value={strategyTargetAudience}
                      onChange={(e) => setStrategyTargetAudience(e.target.value)}
                      disabled={strategyLoading}
                    />
                  </div>
                  {strategyError && (
                    <p className="text-sm text-destructive font-medium">{strategyError}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleGenerateStrategy} disabled={strategyLoading} className="gap-2">
                      {strategyLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Génération…
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Générer ma stratégie
                          <GenerationCostBadge feature="brand_strategy" />
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={closeStrategyModal} disabled={strategyLoading}>
                      Annuler
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:text-base prose-h2:mt-6 prose-h2:mb-3 prose-p:leading-relaxed prose-ul:my-2 prose-li:my-0.5 max-h-[50vh] overflow-y-auto rounded-lg border bg-muted/30 p-4">
                    {strategyResult.split('\n').map((line, i) => {
                      if (line.startsWith('## ')) {
                        return (
                          <h2 key={i} className="text-base font-semibold mt-6 mb-2 first:mt-0">
                            {line.replace(/^## /, '')}
                          </h2>
                        );
                      }
                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        return (
                          <div key={i} className="flex gap-2 my-1 ml-4">
                            <span className="text-muted-foreground">•</span>
                            <span>{line.replace(/^[-*] /, '')}</span>
                          </div>
                        );
                      }
                      if (line.trim()) {
                        return (
                          <p key={i} className="my-2 leading-relaxed">
                            {line}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={downloadStrategy} className="gap-2">
                      <Download className="w-4 h-4" />
                      Télécharger en .md
                    </Button>
                    <Button variant="outline" onClick={() => setStrategyResult(null)} disabled={strategyLoading}>
                      Nouvelle stratégie
                    </Button>
                    <Button variant="ghost" onClick={closeStrategyModal}>
                      Fermer
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suggestion : marques du top */}
      {!analysis && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Marques tendances à analyser :
            </p>
            <div className="flex flex-wrap gap-2">
              {CURATED_TOP_BRANDS.slice(0, 6).map((b) => (
                <Button
                  key={b.brand}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBrandName(b.brand);
                    setError('');
                  }}
                >
                  {b.brand}
                </Button>
              ))}
              <Link href="/brands">
                <Button variant="ghost" size="sm">
                  Voir toutes les marques →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
