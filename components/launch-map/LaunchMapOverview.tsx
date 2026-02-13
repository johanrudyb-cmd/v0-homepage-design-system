'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle2,
  Palette,
  Target,
  PenTool,
  FileText,
  Truck,
  Store,
} from 'lucide-react';
import { LAUNCH_MAP_PHASES } from '@/lib/launch-map-constants';
import type { BrandIdentity } from './LaunchMapStepper';
import type { LaunchMapData } from './LaunchMapStepper';
import { PHASE_ICONS } from './BrandDashboardView';

export interface LaunchMapOverviewProps {
  brand: { id: string; name: string; logo?: string | null };
  launchMap: LaunchMapData | null;
  brandFull: BrandIdentity;
  hasIdentity: boolean;
  designCount: number;
  quoteCount: number;
  ugcCount: number;
  progressPercentage: number;
  userPlan?: string;
}

export function LaunchMapOverview({
  brand,
  launchMap,
  hasIdentity,
  designCount,
  progressPercentage,
  userPlan = 'free',
}: LaunchMapOverviewProps) {
  const progress: Record<string, boolean> = {
    phase0: hasIdentity,
    phase1: launchMap?.phase1 ?? false,
    phase2: launchMap?.phase2 ?? false,
    phase3: launchMap?.phase3 ?? false,
    phase4: launchMap?.phase4 ?? false,
    phase5: launchMap?.phase5 ?? false,
  };

  const completedPhases = Object.values(progress).filter(Boolean).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center">
              {brand.logo ? <img src={brand.logo} alt="" className="w-full h-full object-cover rounded-2xl" /> : <BarChart3 className="w-8 h-8 text-primary/40" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{brand.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Tableau de bord de lancement</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
            <BarChart3 className="w-4 h-4" />
            <span>{progressPercentage}% — {completedPhases} / {LAUNCH_MAP_PHASES.length} étapes</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Designs</p>
          <p className="text-2xl font-black mt-1">{designCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Progression</p>
          <p className="text-2xl font-black mt-1">{progressPercentage}%</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Parcours de lancement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LAUNCH_MAP_PHASES.map((p) => {
            const Icon = PHASE_ICONS[p.id] || Palette;
            const completed = (progress as any)[`phase${p.id}`];
            const isLocked = userPlan === 'free' && ![0, 1].includes(p.id);
            const href = p.id === 3 ? '/launch-map/tech-packs' : (p.id === 4 ? '/launch-map/sourcing' : `/launch-map/phase/${p.id}`);

            return (
              <Link
                key={p.id}
                href={isLocked ? '/auth/choose-plan' : href}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all",
                  completed ? "bg-green-50/30 border-green-100" : "bg-card border-border hover:border-primary/30",
                  isLocked && "opacity-60 grayscale-[0.3]"
                )}
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", completed ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary")}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{p.subtitle}</p>
                </div>
                {completed && <CheckCircle2 className="w-4 h-4 text-green-600" />}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
