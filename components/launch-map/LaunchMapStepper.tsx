'use client';

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Loader2,
  ChevronRight,
  BarChart3,
  LayoutDashboard,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
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

interface Brand extends BrandIdentity { }

interface LaunchMapStepperProps {
  brandId: string;
  launchMap: LaunchMapData | null;
  brand?: Brand;
  hasIdentity?: boolean;
  /** Quand défini, n'affiche que le contenu de cette phase (sans barre de progression ni stepper). */
  focusedPhase?: number;
  userPlan?: string;
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

export function LaunchMapStepper({ brandId, launchMap, brand, hasIdentity = false, focusedPhase, userPlan = 'free' }: LaunchMapStepperProps) {
  const { toast } = useToast();
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
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

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
    toast({
      title: `Étape ${phase} validée ! 🎉`,
      message: `Vous avez complété la phase : ${phases.find(p => p.id === phase)?.title}.`,
      type: 'success',
    });
    // En mode phase focalisée (ex. /launch-map/phase/4), ne pas lancer la transition :
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
          {/* Barre de progression - Version compacte sur mobile */}
          <Card className="border-2 shadow-sm">
            <CardContent className="py-3 px-4 sm:py-4 sm:px-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm sm:text-lg font-extrabold text-[#1d1d1f] flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Progression
                    </h3>
                    <span className="text-sm font-bold text-primary">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="gradient-primary h-2 rounded-full transition-all duration-700 ease-out shadow-apple-sm"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    {completedPhases}/7 Phases
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stepper visuel - Horizontal scroll on mobile */}
          <div className="flex overflow-x-auto pb-4 pt-1 px-1 -mx-4 sm:mx-0 sm:px-0 scrollbar-hide gap-3 sm:grid sm:grid-cols-4 lg:grid-cols-7 sm:gap-2">
            {phases.map((phase, index) => {
              const isCompleted = progress[`phase${phase.id}` as keyof typeof progress];
              const isCurrent = phaseToRender === phase.id;
              const isAccessible = true; // Tous les onglets débloqués : identité et stratégie déjà remplies à l'accès dashboard.

              return (
                <button
                  key={phase.id}
                  onClick={() => setCurrentPhase(phase.id)}
                  disabled={false}
                  className={cn(
                    "relative flex-shrink-0 w-[140px] sm:w-auto p-3 rounded-xl border-2 transition-all duration-300",
                    isCurrent
                      ? 'border-primary bg-primary/10 shadow-apple'
                      : isCompleted
                        ? 'border-success/30 bg-success/5'
                        : isAccessible
                          ? 'border-border bg-card hover:border-primary/50'
                          : 'border-border bg-muted opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${isCompleted
                        ? 'gradient-primary text-white shadow-modern'
                        : isCurrent
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {isCompleted ? '✓' : phase.id}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {phase.title}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate hidden sm:block">
                        {phase.subtitle}
                      </div>
                    </div>
                  </div>
                  {index < phases.length - 1 && (
                    <div
                      className={`absolute top-1/2 -right-2 w-4 h-0.5 hidden lg:block ${isCompleted ? 'bg-primary' : 'bg-border'
                        }`}
                      style={{ transform: 'translateY(-50%)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Espace dashboard : résumés modifiables + accès aux outils */}
          <Card className="border-2 border-primary/10 overflow-hidden">
            <button
              onClick={() => setIsDashboardOpen(!isDashboardOpen)}
              className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-muted/30 transition-colors"
            >
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  Espace dashboard
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Résumés et accès rapide aux outils.
                </CardDescription>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", isDashboardOpen && "rotate-180")} />
            </button>
            {isDashboardOpen && (
              <CardContent className="pt-0">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 pb-4">
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
            )}
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
              userPlan={userPlan}
            />
          )}
          {!isTransitioning && phaseToRender === 1 && (
            <Phase1Strategy
              brandId={brandId}
              brand={brand}
              onComplete={() => handlePhaseComplete(1)}
              userPlan={userPlan}
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
              brand={brand ? { id: brand.id, name: brand.name, logo: brand.logo, colorPalette: brand.colorPalette, typography: brand.typography } : null}
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
