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
import { PhaseMockupCreation } from './PhaseMockupCreation';
import { PhaseTechPack } from './PhaseTechPack';
import { Phase3Sourcing } from './Phase3Sourcing';
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
    mainVibe?: string;
  } | null;
  socialHandles?: unknown;
  domain?: string | null;
  templateBrandSlug?: string | null;
}

interface LaunchMapStepperProps {
  brandId: string;
  launchMap: LaunchMapData | null;
  brand: BrandIdentity | null;
  hasIdentity: boolean;
  focusedPhase?: number | null;
  userPlan?: string;
}

export function LaunchMapStepper({
  brandId,
  launchMap,
  brand,
  hasIdentity,
  focusedPhase = null,
  userPlan = 'free',
}: LaunchMapStepperProps) {
  const { toast } = useToast();

  const initialPhase = useMemo(() => {
    if (typeof focusedPhase === 'number') {
      return focusedPhase;
    }
    return !hasIdentity ? 0 :
      !launchMap?.phase1 ? 1 :
        !launchMap?.phase2 ? 2 :  // Mockup
          !launchMap?.phase3 ? 3 :  // Tech Pack
            !launchMap?.phase4 ? 4 :  // Sourcing
              5;  // Création du site
  }, [focusedPhase, hasIdentity, launchMap]);

  const [currentPhase, setCurrentPhase] = useState(initialPhase);

  const phaseToRender = useMemo(() => {
    if (typeof focusedPhase === 'number') {
      return focusedPhase;
    }
    return currentPhase;
  }, [focusedPhase, currentPhase]);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState({
    phase0: hasIdentity,
    phase1: launchMap?.phase1 ?? false,
    phase2: launchMap?.phase2 ?? false,
    phase3: launchMap?.phase3 ?? false,
    phase4: launchMap?.phase4 ?? false,
    phase5: launchMap?.phase5 ?? false,
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
    if (s && typeof s === 'object' && !Array.isArray(s)) {
      setSummaries({ ...s });
    }
  }, [launchMap?.phaseSummaries]);

  const saveSummaryLocally = useCallback(
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
    if (typeof focusedPhase === 'number') {
      setCurrentPhase(focusedPhase);
      return;
    }
    const nextPhase = !progress.phase0 ? 0 :
      !progress.phase1 ? 1 :
        !progress.phase2 ? 2 :  // Mockup
          !progress.phase3 ? 3 :  // Tech Pack
            !progress.phase4 ? 4 :  // Sourcing
              5;  // Création du site
    setCurrentPhase(nextPhase);
  }, [progress, focusedPhase]);

  const handlePhaseComplete = (phase: number) => {
    setProgress((prev) => ({ ...prev, [`phase${phase}`]: true }));
    toast({
      title: `Étape ${phase} validée ! 🎉`,
      message: `Vous avez complété la phase : ${LAUNCH_MAP_PHASES.find(p => p.id === phase)?.title}.`,
      type: 'success',
    });

    if (typeof focusedPhase === 'number') return;

    let nextPhase: number = phase < 5 ? phase + 1 : phase;

    if (nextPhase !== phase) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPhase(nextPhase);
        setIsTransitioning(false);
        phaseContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }

    setTimeout(() => saveSummaryLocally(phase), 500);
    setTimeout(() => phaseContentRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const completedPhases = Object.values(progress).filter(Boolean).length;
  const progressPercentage = (completedPhases / LAUNCH_MAP_PHASES.length) * 100;

  const onlyPhaseContent = typeof focusedPhase === 'number';

  return (
    <div className={cn("space-y-6 w-full", !onlyPhaseContent && "max-w-4xl mx-auto")}>
      {!onlyPhaseContent && (
        <Card className="border-border shadow-md overflow-hidden bg-card">
          <CardHeader className="bg-muted/30 border-b border-border py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Votre Progression</CardTitle>
                  <CardDescription>Étape {currentPhase + 1} sur {LAUNCH_MAP_PHASES.length}</CardDescription>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  {completedPhases}/{LAUNCH_MAP_PHASES.length} Phases
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full bg-muted h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-700 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div ref={phaseContentRef} className="w-full">
        {!onlyPhaseContent && (
          <div className="flex items-center gap-3 mb-6 bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm">{currentPhase + 1}</span>
            </div>
            <h2 className="text-base font-bold text-foreground">
              {LAUNCH_MAP_PHASES[currentPhase]?.title}
            </h2>
            <div className="ml-auto h-px flex-1 bg-border/50 max-w-[100px] hidden sm:block" />
            <div className="flex gap-1">
              <div className={cn("w-2 h-2 rounded-full", currentPhase === 0 ? "bg-primary" : "bg-muted")} />
              <div className={cn("w-2 h-2 rounded-full", currentPhase === 1 ? "bg-primary" : "bg-muted")} />
              <div className={cn("w-2 h-2 rounded-full", currentPhase === 2 ? "bg-primary" : "bg-muted")} />
              <div className={cn("w-2 h-2 rounded-full", currentPhase === 3 ? "bg-primary" : "bg-muted")} />
              <div className={cn("w-2 h-2 rounded-full", currentPhase === 4 ? "bg-primary" : "bg-muted")} />
              <div className={cn("w-2 h-2 rounded-full", currentPhase === 5 ? "bg-primary" : "bg-muted")} />
            </div>
          </div>
        )}

        <Card className={cn(
          "border-border shadow-xl transform transition-all duration-300 bg-card overflow-hidden",
          isTransitioning ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100",
          onlyPhaseContent && "border-none shadow-none bg-transparent rounded-none"
        )}>
          {!isTransitioning && phaseToRender === 0 && (
            <Phase0Identity
              brandId={brandId}
              brandName={brand?.name ?? ''}
              onComplete={() => handlePhaseComplete(0)}
            />
          )}
          {!isTransitioning && phaseToRender === 1 && (
            <Phase1Strategy
              brandId={brandId}
              brandName={brand?.name ?? ''}
              onComplete={() => handlePhaseComplete(1)}
              userPlan={userPlan}
            />
          )}
          {!isTransitioning && phaseToRender === 2 && (
            <PhaseMockupCreation
              brandId={brandId}
              brand={brand}
              onComplete={() => handlePhaseComplete(2)}
            />
          )}
          {!isTransitioning && phaseToRender === 3 && (
            <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Chargement...</div></div>}>
              <PhaseTechPack
                brandId={brandId}
                brand={brand}
                onComplete={() => handlePhaseComplete(3)}
              />
            </Suspense>
          )}
          {!isTransitioning && phaseToRender === 4 && (
            <Phase3Sourcing
              brandId={brandId}
              onComplete={() => handlePhaseComplete(4)}
            />
          )}
          {!isTransitioning && phaseToRender === 5 && (
            <Phase6Shopify
              brandId={brandId}
              brand={brand ? { id: brand.id, name: brand.name, logo: brand.logo, colorPalette: brand.colorPalette, typography: brand.typography } : null}
              shopifyShopDomain={launchMap?.shopifyShopDomain ?? null}
              siteCreationTodo={(launchMap?.siteCreationTodo as { steps: { id: string; label: string; done: boolean }[] } | null | undefined) ?? null}
              onComplete={() => handlePhaseComplete(5)}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
