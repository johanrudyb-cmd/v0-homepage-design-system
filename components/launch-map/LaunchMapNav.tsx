'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Calendar,
  Palette,
  Target,
  Calculator,
  PenTool,
  FileText,
  Truck,
  Megaphone,
  Store,
} from 'lucide-react';
import { LAUNCH_MAP_PHASES } from '@/lib/launch-map-constants';

const PHASE_ICONS = [Palette, Target, Calculator, PenTool, FileText, Truck, Megaphone, Store] as const;

export interface LaunchMapNavProps {
  brand: { id: string; name: string; logo?: string | null };
  hasIdentity: boolean;
  phase1: boolean;
  phase2: boolean;
  phase3: boolean;
  phase4: boolean;
  phase5: boolean;
  phase6: boolean;
  phase7: boolean;
}

export function LaunchMapNav({
  brand,
  hasIdentity,
  phase1,
  phase2,
  phase3,
  phase4,
  phase5,
  phase6,
  phase7,
}: LaunchMapNavProps) {
  const pathname = usePathname();

  // Ne pas afficher la nav sur Formation (page autonome)
  if (
    pathname === '/launch-map/formation' ||
    pathname.startsWith('/launch-map/formation/')
  ) {
    return null;
  }

  const progress = {
    phase0: hasIdentity,
    phase1,
    phase2,
    phase3,
    phase4,
    phase5,
    phase6,
    phase7,
  };

  const isOverview = pathname === '/launch-map' || pathname === '/launch-map/';
  const phaseMatch = pathname.match(/^\/launch-map\/phase\/(\d+)$/);
  const activePhaseIndex = phaseMatch ? parseInt(phaseMatch[1], 10) : -1;

  // Tous les onglets sont accessibles : identité et stratégie sont déjà remplies à l'accès au dashboard.
  const isPhaseAccessible = () => true;

  return (
    <nav className="sticky top-16 z-30 w-full border-b border-border bg-card">
      <div className="flex h-14 items-center gap-2 px-4 md:px-6 overflow-x-auto">
        {/* Vue d'ensemble */}
        <Link
          href="/launch-map"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-shrink-0',
            isOverview ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden md:inline">Vue d&apos;ensemble</span>
        </Link>

        {/* Calendrier */}
        <Link
          href="/launch-map/calendar"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-shrink-0',
            pathname === '/launch-map/calendar' || pathname.startsWith('/launch-map/calendar/')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          title="Planifier tournages et posts"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden lg:inline">Calendrier</span>
        </Link>

        {/* Onglets phases */}
        {LAUNCH_MAP_PHASES.filter((p) => p.id !== 2 && p.id !== 6).map((p) => {
          const Icon = PHASE_ICONS[p.id];
          const completed = progress[`phase${p.id}` as keyof typeof progress];
          const accessible = isPhaseAccessible();
          const href = p.id === 4 ? '/launch-map/tech-packs' : p.id === 5 ? '/launch-map/sourcing' : `/launch-map/phase/${p.id}`;
          const isActive = pathname === '/launch-map/tech-packs' ? p.id === 4 : pathname === '/launch-map/sourcing' ? p.id === 5 : activePhaseIndex === p.id;

          return (
            <Link
              key={p.id}
              href={accessible ? href : '#'}
              onClick={(e) => !accessible && e.preventDefault()}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-shrink-0',
                isActive ? 'bg-primary text-primary-foreground' : accessible ? 'text-muted-foreground hover:text-foreground hover:bg-muted' : 'text-muted-foreground/50 cursor-not-allowed pointer-events-none'
              )}
              title={p.subtitle}
            >
              {completed ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 flex-shrink-0" />
              )}
              <Icon className="w-4 h-4 hidden sm:block flex-shrink-0" />
              <span className="hidden lg:inline">{p.title}</span>
              <span className="lg:hidden">Phase {p.id}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
