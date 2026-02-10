'use client';

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronRight } from 'lucide-react';
import { Phase0Identity } from './Phase0Identity';
import { Phase1Strategy } from './Phase1Strategy';
import { Phase1Calculator } from './Phase1Calculator';
import { PhaseMockupCreation } from './PhaseMockupCreation';
import { PhaseTechPack } from './PhaseTechPack';
import { Phase3Sourcing } from './Phase3Sourcing';
import { Phase4Marketing } from './Phase4Marketing';
import { Phase6Shopify } from './Phase6Shopify';
import { LAUNCH_MAP_PHASES } from '@/lib/launch-map-constants';

export { LAUNCH_MAP_PHASES };

export interface LaunchMapData {
  id: string;
  phase1: boolean;
  phase2: boolean;
  phase3: boolean;
  phase4: boolean;
  phase5: boolean;
  phase6: boolean;
  phase7: boolean;
  shopifyShopDomain?: string | null;
  phase1Data: any;
  baseMockupByProductType?: Record<string, string> | null;
  phaseSummaries?: Record<string, string> | null;
  siteCreationTodo?: unknown;
}

export interface BrandIdentity {
  id: string;
  name: string;
  logo?: string | null;
  logoVariations?: unknown;
  colorPalette?: { primary?: string; secondary?: string; accent?: string } | null;
  typography?: { heading?: string; body?: string } | null;
  styleGuide?: {
    story?: string;
    targetAudience?: string;
    positioning?: string;
    preferredStyle?: string;
    mainProduct?: string;
    stage?: string;
    moodboard?: string[];
    tagline?: string;
    description?: string;
    productType?: string;
    productWeight?: string;
    noLogo?: boolean;
  } | null;
  domain?: string | null;
  socialHandles?: { instagram?: string; twitter?: string; facebook?: string; tiktok?: string } | null;
  templateBrandSlug?: string | null;
}

interface Brand extends BrandIdentity {}

interface LaunchMapStepperProps {
  brandId: string;
  launchMap: LaunchMapData | null;
  brand?: Brand;
  hasIdentity?: boolean;
  /** Quand défini, n'affiche que le contenu de cette phase (sans barre de progression ni stepper). */
  focusedPhase?: number;
}

/** Fusionne phase1Data (Calculator) avec le choix Phase 0 (styleGuide) pour pré-remplir produit principal et grammage */
function mergePhase1DataWithPhase0(phase1Data: any, styleGuide: BrandIdentity['styleGuide']): any {
  const sg = styleGuide && typeof styleGuide === 'object' ? styleGuide as Record<string, unknown> : null;
  const pt = sg?.productType && typeof sg.productType === 'string' ? sg.productType : null;
  const pw = sg?.productWeight && typeof sg.productWeight === 'string' ? sg.productWeight : null;
  if (!phase1Data && !pt && !pw) return undefined;
  const base = phase1Data ?? {};
  return {
    ...base,
    productType: base.productType ?? pt ?? 'tshirt',
    weight: base.weight ?? pw ?? '180 g/m²',
  };
}

const phases = LAUNCH_MAP_PHASES;

export function LaunchMapStepper({ brandId, launchMap, brand, hasIdentity = false, focusedPhase }: LaunchMapStepperProps) {
  // Calculer la phase initiale : toujours privilégier focusedPhase s'il est défini
  const initialPhase = useMemo(() => {
    if (typeof focusedPhase === 'number') {
      return focusedPhase;
    }
    // Calculer depuis progress : phase3 = Création du mockup (nouvelle phase)
    return !hasIdentity ? 0 :
      !launchMap?.phase1 ? 1 :
      !launchMap?.phase2 ? 2 :
      !launchMap?.phase3 ? 3 :  // Création du mockup
      !launchMap?.phase4 ? 4 :  // Tech Pack
      !launchMap?.phase5 ? 5 :  // Sourcing
      !launchMap?.phase6 ? 6 :  // Création de contenu
      7;  // Création du site
  }, [focusedPhase, hasIdentity, launchMap]);
  
  const [currentPhase, setCurrentPhase] = useState(initialPhase);
  
  // La phase effective à utiliser pour le rendu : toujours privilégier focusedPhase s'il est défini
  const phaseToRender = useMemo(() => {
    // Si focusedPhase est défini, l'utiliser directement (ignore currentPhase)
    if (typeof focusedPhase === 'number') {
      return focusedPhase;
    }
    // Sinon, utiliser currentPhase (qui sera mis à jour par le useEffect basé sur progress)
    return currentPhase;
  }, [focusedPhase, currentPhase]);
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState({
    phase0: hasIdentity,
    phase1: launchMap?.phase1 || false,
    phase2: launchMap?.phase2 || false,
    phase3: launchMap?.phase3 || false,
    phase4: launchMap?.phase4 || false,
    phase5: launchMap?.phase5 || false,
    phase6: launchMap?.phase6 || false,
    phase7: launchMap?.phase7 || false,
  });

  const [summaries, setSummaries] = useState<Record<string, string>>(() => {
    const s = launchMap?.phaseSummaries;
    if (s && typeof s === 'object' && !Array.isArray(s)) return { ...s };
    return {};
  });
  const [savingSummary, setSavingSummary] = useState<string | null>(null);
  const phaseContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = launchMap?.phaseSummaries;
    if (s && typeof s === 'object' && !Array.isArray(s)) setSummaries((prev) => ({ ...prev, ...s }));
  }, [launchMap?.phaseSummaries]);

  const saveSummary = useCallback(
    async (phaseId: number) => {
      const key = String(phaseId);
      setSavingSummary(key);
      try {
        const res = await fetch('/api/launch-map/summaries', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandId,
            phaseSummaries: { ...summaries, [key]: summaries[key] ?? '' },
          }),
        });
        if (!res.ok) throw new Error('Erreur sauvegarde');
      } catch {
        // silent
      } finally {
        setSavingSummary(null);
      }
    },
    [brandId, summaries]
  );

  useEffect(() => {
    // Si focusedPhase est défini, toujours l'utiliser (pas de recalcul automatique)
    // Cette vérification doit être faite en premier pour éviter tout recalcul
    if (typeof focusedPhase === 'number') {
      setCurrentPhase(focusedPhase);
      return;
    }
    // Déterminer la phase en fonction du progrès
    const nextPhase = !progress.phase0 ? 0 :
      !progress.phase1 ? 1 :
      !progress.phase2 ? 2 :
      !progress.phase3 ? 3 :  // Création du mockup
      !progress.phase4 ? 4 :  // Tech Pack
      !progress.phase5 ? 5 :  // Sourcing
      !progress.phase6 ? 6 :  // Création de contenu
      7;  // Création du site
    setCurrentPhase(nextPhase);
  }, [progress, focusedPhase]);

  const handlePhaseComplete = (phase: number) => {
    setProgress((prev) => ({ ...prev, [`phase${phase}`]: true }));
    // En mode phase focalisée (ex. /launch-map/phase/4), ne pas lancer la transition :
    // elle démonte le composant puis le remonte avec l'état initial (step 1), ce qui
    // renvoie l'utilisateur au choix du type de produit au lieu de rester sur l'étape 5.
    if (typeof focusedPhase === 'number') return;
    let nextPhase: number;
    if (phase < 7) {
      nextPhase = phase + 1;
    } else {
      nextPhase = phase;
    }
    if (phase < 6) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPhase(nextPhase);
        setIsTransitioning(false);
        phaseContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  const openPhase = (phaseId: number) => {
    setCurrentPhase(phaseId);
    setTimeout(() => phaseContentRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const completedPhases = Object.values(progress).filter(Boolean).length;
  const progressPercentage = (completedPhases / 7) * 100;

  const onlyPhaseContent = typeof focusedPhase === 'number';

  return (
    <div className="space-y-5">
      {!onlyPhaseContent && (
        <>
      {/* Barre de progression */}
      <Card className="border-2">
        <CardContent className="pt-4 pb-4 px-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Progression globale
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                {completedPhases} sur 7 phases complétées
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className="gradient-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stepper visuel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {phases.map((phase, index) => {
          const isCompleted = progress[`phase${phase.id}` as keyof typeof progress];
          const isCurrent = phaseToRender === phase.id;
          const isAccessible = true; // Tous les onglets débloqués : identité et stratégie déjà remplies à l'accès dashboard.

          return (
            <button
              key={phase.id}
              onClick={() => setCurrentPhase(phase.id)}
              disabled={false}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isCurrent
                  ? 'border-primary bg-primary/10 shadow-modern'
                  : isCompleted
                  ? 'border-success bg-success/10'
                  : isAccessible
                  ? 'border-border bg-card hover:border-primary/50 hover:shadow-modern'
                  : 'border-border bg-muted opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    isCompleted
                      ? 'gradient-primary text-white shadow-modern'
                      : isCurrent
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? '✓' : phase.id}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-foreground">
                    {phase.title}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {phase.subtitle}
                  </div>
                </div>
              </div>
              {index < phases.length - 1 && (
                <div
                  className={`absolute top-1/2 -right-2 w-4 h-0.5 ${
                    isCompleted ? 'bg-primary' : 'bg-border'
                  }`}
                  style={{ transform: 'translateY(-50%)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Espace dashboard : résumés modifiables + accès aux outils */}
      <Card className="border-2 border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Espace dashboard</CardTitle>
          <CardDescription className="text-sm">
            Résumés modifiables par phase et accès rapide aux outils (calculateur, design, sourcing, go-to-market).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {phases.map((phase) => {
              const key = String(phase.id);
              return (
                <Card key={phase.id} className="border-2">
                  <CardHeader className="pb-1 pt-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-sm">{phase.title}</CardTitle>
                        <CardDescription className="text-xs truncate">{phase.subtitle}</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPhase(phase.id)}
                        className="shrink-0 h-8"
                      >
                        Ouvrir
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 pt-0 px-4 pb-4">
                    <label className="text-xs font-medium text-muted-foreground">Résumé (modifiable)</label>
                    <textarea
                      value={summaries[key] ?? ''}
                      onChange={(e) => setSummaries((prev) => ({ ...prev, [key]: e.target.value }))}
                      onBlur={() => saveSummary(phase.id)}
                      placeholder={`Résumé pour ${phase.title}…`}
                      className="w-full min-h-[60px] rounded-md border-2 border-input bg-background px-2.5 py-1.5 text-sm resize-y"
                      rows={2}
                    />
                    {savingSummary === key && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Enregistrement…
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {/* Contenu de la phase actuelle (outils) */}
      <Card className="border-2" ref={phaseContentRef}>
        {!onlyPhaseContent && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">
            Phase {phaseToRender === 0 ? '0' : phaseToRender} : {phases.find(p => p.id === phaseToRender)?.title || 'Identité'}
          </CardTitle>
          <CardDescription className="font-medium text-sm">
            {phases.find(p => p.id === phaseToRender)?.description || 'Créez l\'identité de votre marque'}
          </CardDescription>
        </CardHeader>
        )}
        <CardContent className={onlyPhaseContent ? 'pt-4 pb-5 px-5' : 'pt-0 px-5 pb-5'}>
          {isTransitioning && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {!isTransitioning && phaseToRender === 0 && (
            <Phase0Identity
              brandId={brandId}
              brand={brand}
              onComplete={() => {
                setProgress((prev) => ({ ...prev, phase0: true }));
                setCurrentPhase(1);
              }}
            />
          )}
          {!isTransitioning && phaseToRender === 1 && (
            <Phase1Strategy
              brandId={brandId}
              brand={brand}
              onComplete={() => handlePhaseComplete(1)}
            />
          )}
          {!isTransitioning && phaseToRender === 2 && (
            <Phase1Calculator
              brandId={brandId}
              brand={brand}
              initialData={mergePhase1DataWithPhase0(launchMap?.phase1Data, brand?.styleGuide)}
              onComplete={() => handlePhaseComplete(2)}
            />
          )}
          {!isTransitioning && phaseToRender === 3 && (
            <PhaseMockupCreation
              brandId={brandId}
              brand={brand}
              onComplete={() => handlePhaseComplete(3)}
            />
          )}
          {!isTransitioning && phaseToRender === 4 && (
            <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Chargement...</div></div>}>
              <PhaseTechPack
                brandId={brandId}
                brand={brand}
                onComplete={() => handlePhaseComplete(4)}
              />
            </Suspense>
          )}
          {!isTransitioning && phaseToRender === 5 && (
            <Phase3Sourcing
              brandId={brandId}
              onComplete={() => handlePhaseComplete(5)}
            />
          )}
          {!isTransitioning && phaseToRender === 6 && (
            <Phase4Marketing
              brandId={brandId}
              brandName={brand?.name ?? ''}
              brand={brand ? { id: brand.id, name: brand.name, logo: brand.logo, colorPalette: brand.colorPalette, typography: brand.typography, styleGuide: brand.styleGuide } : null}
              onComplete={() => handlePhaseComplete(6)}
              isCompleted={progress.phase6}
            />
          )}
          {!isTransitioning && phaseToRender === 7 && (
            <Phase6Shopify
              brandId={brandId}
              shopifyShopDomain={launchMap?.shopifyShopDomain ?? null}
              siteCreationTodo={(launchMap?.siteCreationTodo as { steps: { id: string; label: string; done: boolean }[] } | null | undefined) ?? null}
              onComplete={() => handlePhaseComplete(7)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
