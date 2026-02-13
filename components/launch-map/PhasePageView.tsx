'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Copy,
  Pencil,
  X,
  ArrowLeft,
  Palette,
  Target,
  PenTool,
  FileText,
  Truck,
  Store,
} from 'lucide-react';
import { StrategyPresentationView } from './StrategyPresentationView';
import { LaunchMapStepper, type BrandIdentity } from './LaunchMapStepper';
import { LAUNCH_MAP_PHASES } from '@/lib/launch-map-constants';
import type { LaunchMapData } from './LaunchMapStepper';
import { PhaseRecap, PHASE_PRESENTATIONS, PHASE_ICONS } from './BrandDashboardView';
import type { SupplierRecap } from './BrandDashboardView';

export interface PhasePageViewProps {
  phaseId: number;
  brand: { id: string; name: string; logo?: string | null };
  launchMap: LaunchMapData | null;
  brandFull: BrandIdentity;
  hasIdentity: boolean;
  designCount: number;
  quoteCount: number;
  ugcCount: number;
  suppliers?: SupplierRecap[];
  userPlan?: string;
}

export function PhasePageView({
  phaseId,
  brand,
  launchMap,
  brandFull,
  hasIdentity,
  designCount,
  quoteCount,
  ugcCount,
  suppliers = [],
  userPlan = 'free',
}: PhasePageViewProps) {
  const [isShowingDetail, setShowingDetail] = useState(false);
  const [strategyText, setStrategyText] = useState<string | null>(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const detailSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phaseId === 1 && brand.id) {
      setStrategyLoading(true);
      fetch(`/api/brands/strategy/history?brandId=${encodeURIComponent(brand.id)}`)
        .then((r) => r.json())
        .then((data) => {
          const latest = data?.strategies?.[0];
          setStrategyText(latest?.strategyText ?? null);
        })
        .finally(() => setStrategyLoading(false));
    }
  }, [phaseId, brand.id]);

  const phase = LAUNCH_MAP_PHASES.find(p => p.id === phaseId);
  const presentation = PHASE_PRESENTATIONS[phaseId];
  const PhaseIcon = PHASE_ICONS[phaseId] || Palette;

  const progress: Record<string, boolean> = {
    phase0: hasIdentity,
    phase1: launchMap?.phase1 ?? false,
    phase3: launchMap?.phase3 ?? false,
    phase4: launchMap?.phase4 ?? false,
    phase5: launchMap?.phase5 ?? false,
    phase7: launchMap?.phase7 ?? false,
  };

  useEffect(() => {
    if (isShowingDetail && detailSectionRef.current) {
      detailSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isShowingDetail]);

  const isLocked = userPlan === 'free' && ![0, 1].includes(phaseId);

  if (!phase || !presentation) {
    return (
      <div className="p-4">
        <Link href="/launch-map">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la vue d&apos;ensemble
          </Button>
        </Link>
        <p className="text-muted-foreground mt-4">Phase introuvable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="px-4 sm:px-6 lg:px-12 py-6 max-w-[96rem] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/launch-map" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à la vue d&apos;ensemble
          </Link>
          {isLocked && <div className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Plan Créateur requis</div>}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <PhaseIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{phase.title}</h2>
                <p className="text-sm text-muted-foreground">{presentation.intro}</p>
              </div>
            </div>
          </div>

          {!isLocked && (
            <div className="p-6 bg-background">
              {(phaseId === 0 || phaseId === 1) && !isShowingDetail ? (
                <>
                  <PhaseRecap phaseId={phaseId} brandFull={brandFull} launchMap={launchMap} designCount={designCount} quoteCount={quoteCount} ugcCount={ugcCount} progress={progress} suppliers={suppliers} />
                  <Button onClick={() => setShowingDetail(true)} className="mt-4">Modifier</Button>
                </>
              ) : (
                <div ref={detailSectionRef}>
                  <LaunchMapStepper brandId={brand.id} launchMap={launchMap} brand={brandFull} hasIdentity={hasIdentity} focusedPhase={phaseId} userPlan={userPlan} />
                </div>
              )}
            </div>
          )}

          {isLocked && (
            <div className="p-12 text-center space-y-4">
              <h3 className="text-lg font-bold">Cette phase est réservée aux membres Créateurs</h3>
              <p className="text-sm text-muted-foreground">Passez au plan Créateur pour débloquer cet outil.</p>
              <Link href="/auth/choose-plan"><Button>Débloquer maintenant</Button></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
