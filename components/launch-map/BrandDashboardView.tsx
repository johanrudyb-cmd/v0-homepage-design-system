'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Palette,
  Target,
  PenTool,
  FileText,
  Truck,
  Store,
  ExternalLink,
  Minus,
  LucideIcon,
} from 'lucide-react';
import { StrategyPresentationView } from './StrategyPresentationView';
import { LaunchMapStepper, type BrandIdentity } from './LaunchMapStepper';
import { LAUNCH_MAP_PHASES } from '@/lib/launch-map-constants';
import type { LaunchMapData } from './LaunchMapStepper';

export interface SupplierRecap {
  id: string;
  name: string;
  country: string;
  moq?: number;
  leadTime?: number;
  quoteCount: number;
}

interface BrandDashboardViewProps {
  brand: {
    id: string;
    name: string;
    logo?: string | null;
  };
  launchMap: LaunchMapData | null;
  brandFull: BrandIdentity;
  hasIdentity: boolean;
  designCount: number;
  quoteCount: number;
  ugcCount: number;
  progressPercentage: number;
  suppliers?: SupplierRecap[];
  userPlan?: string;
}

export const PHASE_ICONS: Record<number, LucideIcon> = {
  0: Palette,
  1: Target,
  2: PenTool,
  3: FileText,
  4: Truck,
  5: Store,
};

export const PHASE_PRESENTATIONS: Record<number, { intro: string; objectives: string[] }> = {
  0: {
    intro: 'Donnez un nom à votre marque et définissez le produit principal que vous souhaitez lancer.',
    objectives: [
      'Définir le nom de la marque',
      'Valider le type de produit',
      'Optionnel : logo et identité visuelle',
    ],
  },
  1: {
    intro: 'Inspirez-vous d’une grande marque dans votre univers pour aligner votre stratégie.',
    objectives: [
      'Choisir une marque de référence',
      'Récupérer une stratégie marketing adaptée',
      'Valider le positionnement',
    ],
  },
  2: {
    intro: 'Apprenez à créer votre design professionnel grâce au tutoriel vidéo et téléchargez votre pack de mockup.',
    objectives: [
      'Regarder le tutoriel vidéo',
      'Télécharger le pack de mockup',
      'Recommandations IA pour votre vêtement',
    ],
  },
  3: {
    intro: 'Transformez votre mockup en fiche technique fournisseur.',
    objectives: [
      'Sélectionner le mockup',
      'Définir les dimensions (tech pack)',
      'Enregistrer pour le fournisseur',
    ],
  },
  4: {
    intro: 'Contactez des usines qualifiées depuis le Sourcing Hub et obtenez des devis.',
    objectives: [
      'Explorer le Sourcing Hub',
      'Envoyer au moins 2 demandes de devis',
      'Comparer les partenaires usines',
    ],
  },
  5: {
    intro: 'Connectez votre boutique Shopify pour lancer votre marque.',
    objectives: [
      'Saisir votre domaine Shopify',
      'Valider la connexion boutique',
    ],
  },
};

export function PhaseRecap({
  phaseId,
  brandFull,
  launchMap,
  designCount,
  quoteCount,
  ugcCount,
  progress,
  suppliers = [],
}: {
  phaseId: number;
  brandFull: BrandIdentity;
  launchMap: LaunchMapData | null;
  designCount: number;
  quoteCount: number;
  ugcCount: number;
  progress: Record<string, boolean>;
  suppliers?: SupplierRecap[];
}) {
  const completed = (progress as any)[`phase${phaseId}`];
  const sg = brandFull?.styleGuide && typeof brandFull.styleGuide === 'object' ? brandFull.styleGuide as Record<string, unknown> : null;
  const productType = (sg?.productType as string) || null;

  const item = (label: string, value: string | number | null | undefined) =>
    value != null && String(value).trim() !== '' ? (
      <div key={label}>
        <dt className="text-muted-foreground font-medium">{label}</dt>
        <dd className="text-foreground mt-0.5">{value}</dd>
      </div>
    ) : null;

  if (phaseId === 0) {
    return (
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {item('Nom de la marque', brandFull?.name ?? null)}
        {item('Type de produit', productType)}
      </dl>
    );
  }

  if (phaseId === 1) {
    const slug = brandFull?.templateBrandSlug?.trim();
    return (
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {item('Marque d\'inspiration', slug)}
      </dl>
    );
  }

  if (phaseId === 4) {
    return (
      <div className="space-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground font-medium">Devis envoyés</dt>
          <dd className="text-foreground font-semibold mt-0.5">{quoteCount}</dd>
        </div>
        {suppliers && suppliers.length > 0 && (
          <ul className="space-y-1">
            {suppliers.map(s => <li key={s.id} className="text-xs">• {s.name} ({s.country})</li>)}
          </ul>
        )}
      </div>
    );
  }

  return <p className="text-xs text-muted-foreground italic">Aucun récapitulatif détaillé pour cette phase.</p>;
}

export function BrandDashboardView({
  brand,
  launchMap,
  brandFull,
  hasIdentity,
  designCount,
  quoteCount,
  ugcCount,
  progressPercentage,
  suppliers = [],
  userPlan = 'free',
}: BrandDashboardViewProps) {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [editingPhaseIndex, setEditingPhaseIndex] = useState<number | null>(null);
  const [strategyText, setStrategyText] = useState<string | null>(null);
  const detailSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const phase = LAUNCH_MAP_PHASES[activePhaseIndex];
    if (phase.id === 1 && brand.id) {
      fetch(`/api/brands/strategy/history?brandId=${encodeURIComponent(brand.id)}`)
        .then((r) => r.json())
        .then((data) => setStrategyText(data?.strategies?.[0]?.strategyText ?? null));
    }
  }, [activePhaseIndex, brand.id]);

  useEffect(() => {
    if (editingPhaseIndex !== null && detailSectionRef.current) {
      detailSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingPhaseIndex]);

  const activePhase = LAUNCH_MAP_PHASES[activePhaseIndex];
  const presentation = PHASE_PRESENTATIONS[activePhase.id];
  const PhaseIcon = PHASE_ICONS[activePhase.id] || Palette;

  const progress = {
    phase0: hasIdentity,
    phase1: launchMap?.phase1 ?? false,
    phase2: launchMap?.phase2 ?? false,
    phase3: launchMap?.phase3 ?? false,
    phase4: launchMap?.phase4 ?? false,
    phase5: launchMap?.phase5 ?? false,
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6 max-w-6xl mx-auto space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{brand.name} — Tableau de bord</h1>
            <p className="text-sm text-muted-foreground">{progressPercentage}% du parcours complété ({Object.values(progress).filter(Boolean).length}/{LAUNCH_MAP_PHASES.length} phases)</p>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border mb-6 overflow-x-auto">
          {LAUNCH_MAP_PHASES.map((p, index) => {
            const Icon = PHASE_ICONS[p.id] || Palette;
            const completed = (progress as any)[`phase${p.id}`];
            const active = activePhaseIndex === index;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePhaseIndex(index);
                  setEditingPhaseIndex([2, 3, 4, 5].includes(p.id) ? p.id : null);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-shrink-0',
                  active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
              >
                {completed ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4" />}
                <Icon className="w-4 h-4 hidden sm:block" />
                <span>{p.title}</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <PhaseIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold">{activePhase.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{presentation?.intro}</p>
              </div>

              <div className="p-6">
                {activePhase.id === 1 && !editingPhaseIndex ? (
                  <StrategyPresentationView strategyText={strategyText || ''} brandName={brand.name} embedded />
                ) : (editingPhaseIndex === activePhase.id) ? (
                  <div ref={detailSectionRef}>
                    <LaunchMapStepper brandId={brand.id} launchMap={launchMap} brand={brandFull} hasIdentity={hasIdentity} focusedPhase={activePhase.id} userPlan={userPlan} />
                  </div>
                ) : (
                  <PhaseRecap phaseId={activePhase.id} brandFull={brandFull} launchMap={launchMap} designCount={designCount} quoteCount={quoteCount} ugcCount={ugcCount} progress={progress} suppliers={suppliers} />
                )}

                {!editingPhaseIndex && (activePhase.id !== 1 || strategyText) && (
                  <Button onClick={() => setEditingPhaseIndex(activePhase.id)} className="mt-6">Modifier</Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Objectifs</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {presentation?.objectives.map((obj, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary/40" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
