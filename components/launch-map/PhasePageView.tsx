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
  Calculator,
  Video,
  FileText,
  Truck,
  Megaphone,
  Store,
} from 'lucide-react';
import { StrategyPresentationView } from './StrategyPresentationView';
import { LaunchMapStepper, type BrandIdentity } from './LaunchMapStepper';
import { LAUNCH_MAP_PHASES } from '@/lib/launch-map-constants';
import type { LaunchMapData } from './LaunchMapStepper';
import { PhaseRecap, PHASE_PRESENTATIONS } from './BrandDashboardView';
import type { SupplierRecap } from './BrandDashboardView';

const PHASE_ICONS = [Palette, Target, Calculator, Video, FileText, Truck, Megaphone, Store] as const;

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
}: PhasePageViewProps) {
  const [isShowingDetail, setShowingDetail] = useState(phaseId === 2);
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

  const phase = LAUNCH_MAP_PHASES[phaseId];
  const presentation = PHASE_PRESENTATIONS[phaseId];
  const PhaseIcon = PHASE_ICONS[phaseId];

  const progress = {
    phase0: hasIdentity,
    phase1: launchMap?.phase1 ?? false,
    phase2: launchMap?.phase2 ?? false,
    phase3: launchMap?.phase3 ?? false,
    phase4: launchMap?.phase4 ?? false,
    phase5: launchMap?.phase5 ?? false,
    phase6: launchMap?.phase6 ?? false,
    phase7: launchMap?.phase7 ?? false,
  };

  useEffect(() => {
    if (isShowingDetail && detailSectionRef.current) {
      detailSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isShowingDetail]);

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
    <div className="min-h-screen bg-muted/30">
      <div className="px-4 py-5 max-w-[96rem] mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Link
            href="/launch-map"
            className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la vue d&apos;ensemble
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border bg-muted/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <PhaseIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                    Phase {phase.id} — {phase.subtitle}
                  </p>
                  <h2 className="text-xl font-bold text-foreground mb-2">{phase.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {presentation.intro}
                  </p>
                  <ul className="space-y-2">
                    {presentation.objectives.map((obj, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {phase.id === 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowingDetail(true)}
                  className="shrink-0 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Changer la stratégie
                </Button>
              )}
            </div>
          </div>

          {/* Phase 1 : présentation de la stratégie (onglet cliqué) ou formulaire pour changer */}
          {phase.id === 1 && !isShowingDetail && (
            <div className="p-4 sm:p-6 border-b border-border bg-background">
              {strategyLoading ? (
                <p className="text-sm text-muted-foreground">Chargement de la stratégie…</p>
              ) : strategyText ? (
                <StrategyPresentationView
                  strategyText={strategyText}
                  brandName={brand.name}
                  titleMode="strategy"
                  visualIdentityLocked
                  onClose={() => {}}
                  embedded
                />
              ) : (
                <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
                  <p className="text-muted-foreground mb-4">Aucune stratégie enregistrée.</p>
                  <Button size="sm" onClick={() => setShowingDetail(true)} className="gap-2">
                    <Copy className="w-4 h-4" />
                    Copier une stratégie depuis une marque d&apos;inspiration
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Phase 1 en mode édition : formulaire pour copier une autre stratégie */}
          {phase.id === 1 && isShowingDetail && (
            <div className="px-6 sm:px-8 py-4 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Changer la stratégie
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowingDetail(false);
                    fetch(`/api/brands/strategy/history?brandId=${encodeURIComponent(brand.id)}`)
                      .then((r) => r.json())
                      .then((data) => {
                        const latest = data?.strategies?.[0];
                        setStrategyText(latest?.strategyText ?? null);
                      });
                  }}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Fermer et revenir à la présentation
                </Button>
              </div>
            </div>
          )}

          {/* Phase 0 : récap */}
          {phase.id === 0 && (
            <div className="px-6 sm:px-8 py-5 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Récap de la phase
                </h3>
                {isShowingDetail ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowingDetail(false)}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Fermer le détail
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setShowingDetail(true)}
                    className="gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Modifier
                  </Button>
                )}
              </div>
              <div className="mt-3">
                <PhaseRecap
                  phaseId={phase.id}
                  brandFull={brandFull}
                  launchMap={launchMap}
                  designCount={designCount}
                  quoteCount={quoteCount}
                  ugcCount={ugcCount}
                  progress={progress}
                  suppliers={suppliers}
                />
              </div>
            </div>
          )}

          {([0, 2, 3, 4, 5, 6, 7].includes(phase.id) || (phase.id === 1 && isShowingDetail)) && (
            <div ref={detailSectionRef} className="p-4 sm:p-6 bg-background">
              <LaunchMapStepper
                brandId={brand.id}
                launchMap={launchMap}
                brand={brandFull}
                hasIdentity={hasIdentity}
                focusedPhase={phase.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
