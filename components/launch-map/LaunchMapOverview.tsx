'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  BarChart3,
  Lightbulb,
  Loader2,
  ExternalLink,
  Palette,
  PenTool,
  Truck,
  Megaphone,
  Store,
  FileText,
  Target,
  ChevronDown,
} from 'lucide-react';
import { getSeasonalRecommendation, getProductTypeLabel } from '@/lib/seasonal-recommendation';
import { LAUNCH_MAP_PHASES } from '@/lib/launch-map-constants';
import type { BrandIdentity } from './LaunchMapStepper';
import type { LaunchMapData } from './LaunchMapStepper';
import type { SupplierRecap } from './BrandDashboardView';
import type { WeekCalendarEvent } from '@/lib/calendar-week-events';

const EVENT_TYPE_LABELS: Record<string, string> = {
  tournage: 'Tournage',
  post: 'Post-production',
  content: 'Contenu / Script',
};

function formatEventStart(start: string): string {
  const datePart = start.slice(0, 10);
  if (start.includes('T') && start.length >= 16) {
    const timePart = start.slice(11, 16).replace(':', 'h');
    return `${datePart} à ${timePart}`;
  }
  return datePart;
}

function formatProductType(key: string): string {
  const labels: Record<string, string> = {
    tshirt: 'T-shirt',
    hoodie: 'Hoodie',
    veste: 'Veste',
    pantalon: 'Pantalon',
  };
  return labels[key] || key;
}

function formatSlugAsName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface LaunchMapOverviewProps {
  brand: { id: string; name: string; logo?: string | null };
  launchMap: LaunchMapData | null;
  brandFull: BrandIdentity;
  hasIdentity: boolean;
  designCount: number;
  quoteCount: number;
  ugcCount: number;
  progressPercentage: number;
  suppliers?: SupplierRecap[];
  weekEvents?: WeekCalendarEvent[];
  userPlan?: string;
}

export function LaunchMapOverview({
  brand,
  launchMap,
  brandFull,
  hasIdentity,
  designCount,
  quoteCount,
  ugcCount,
  progressPercentage,
  suppliers = [],
  weekEvents = [],
  userPlan = 'free',
}: LaunchMapOverviewProps) {
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [recommendationsCached, setRecommendationsCached] = useState(false);

  const seasonalRec = getSeasonalRecommendation();
  const sg = brandFull?.styleGuide && typeof brandFull.styleGuide === 'object' ? (brandFull.styleGuide as Record<string, unknown>) : null;
  const brandProductType = (sg?.productType as string) || null;
  const brandSlug = brandFull?.templateBrandSlug?.trim();
  const targetAudience = (sg?.targetAudience as string)?.trim();
  const positioning = (sg?.preferredStyle as string)?.trim() || (sg?.positioning as string)?.trim();

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
  const completedPhases = [
    progress.phase0,
    progress.phase1,
    progress.phase2,
    progress.phase3,
    progress.phase4,
    progress.phase5,
    progress.phase6,
    progress.phase7,
  ].filter(Boolean).length;

  const canGetRecommendations = hasIdentity && (launchMap?.phase1 ?? false) && userPlan !== 'free';

  useEffect(() => {
    if (!canGetRecommendations) {
      setAiRecommendations([]);
      setRecommendationsError(null);
      setRecommendationsLoading(false);
      setRecommendationsCached(false);
      return;
    }
    let cancelled = false;
    setRecommendationsLoading(true);
    setRecommendationsError(null);
    setRecommendationsCached(false);
    fetch('/api/launch-map/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandId: brand.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.recommendations)) {
          setAiRecommendations(data.recommendations);
        }
        if (data.locked) setAiRecommendations([]);
        if (data.cached) setRecommendationsCached(true);
        if (data.error) setRecommendationsError(data.error);
      })
      .catch(() => {
        if (!cancelled) setRecommendationsError('Impossible de charger les recommandations conseil');
      })
      .finally(() => {
        if (!cancelled) setRecommendationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [brand.id, canGetRecommendations]);

  const [isAdviceOpen, setIsAdviceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="px-4 sm:px-6 lg:px-12 py-4 sm:py-10 lg:py-12 max-w-[96rem] mx-auto space-y-4 sm:space-y-10">
        {/* En-tête avec logo en coin */}
        <section className="rounded-xl border border-border bg-card overflow-hidden animate-slide-in-down">
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary/70">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{brand.name}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">Vue d&apos;ensemble — métriques et conseils</p>
                {(brandSlug || positioning || targetAudience) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    {brandSlug && (
                      <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5">
                        Inspiré de {formatSlugAsName(brandSlug)}
                      </span>
                    )}
                    {positioning && (
                      <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5">
                        {positioning}
                      </span>
                    )}
                    {targetAudience && (
                      <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5">
                        {targetAudience}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="w-4 h-4" />
              <span>{progressPercentage}% du parcours — {completedPhases} / {LAUNCH_MAP_PHASES.length} phases</span>
            </div>
          </div>
        </section>

        {/* Métriques détaillées */}
        <section className="rounded-xl border border-border bg-card overflow-hidden animate-slide-in-up">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Tableau de bord</h2>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
              <BarChart3 className="w-3 h-3" />
              <span>{progressPercentage}% · {completedPhases}/8</span>
            </div>
          </div>
          <div className="flex overflow-x-auto p-3 gap-3 scrollbar-hide sm:grid sm:grid-cols-4 sm:p-4">
            <div className="flex-shrink-0 w-36 sm:w-auto rounded-lg border border-border bg-muted/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <PenTool className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Designs</span>
              </div>
              <p className="text-xl font-black text-foreground mt-1">{designCount}</p>
              <Link href="/design-studio" className="text-[10px] text-primary font-bold hover:underline mt-1 inline-flex items-center gap-1">
                Studio <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
            <div className="flex-shrink-0 w-36 sm:w-auto rounded-lg border border-border bg-muted/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Progression</span>
              </div>
              <p className="text-xl font-black text-foreground mt-1">{progressPercentage}%</p>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">{completedPhases}/8 phases</p>
            </div>
            <div className="flex-shrink-0 w-36 sm:w-auto rounded-lg border border-border bg-muted/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Fournisseurs</span>
              </div>
              <p className="text-xl font-black text-foreground mt-1">{suppliers.length}</p>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Partenaires</p>
            </div>
            <div className="flex-shrink-0 w-36 sm:w-auto rounded-lg border border-border bg-muted/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Megaphone className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Scripts</span>
              </div>
              <p className="text-xl font-black text-foreground mt-1">{ugcCount}</p>
              <Link href="/ugc" className="text-[10px] text-primary font-bold hover:underline mt-1 inline-flex items-center gap-1">
                UGC Lab <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Événements de la semaine */}
        <section className="rounded-xl border border-border bg-card overflow-hidden animate-slide-in-up">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Événements de la semaine</h2>
            <Link href="/launch-map/calendar" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              Calendrier <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4">
            {weekEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun événement cette semaine. Planifiez vos tournages et posts dans le calendrier.</p>
            ) : (
              <ul className="space-y-2">
                {weekEvents.map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {EVENT_TYPE_LABELS[ev.type] || ev.type} · {formatEventStart(ev.start)}
                      </p>
                    </div>
                    <Link href="/launch-map/calendar" className="text-xs text-primary hover:underline shrink-0">Voir</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-xl border-2 border-primary/25 bg-primary/5 shadow-sm overflow-hidden animate-slide-in-up">
          <button
            type="button"
            onClick={() => setIsAdviceOpen(!isAdviceOpen)}
            className="w-full p-3 sm:p-4 border-b border-primary/20 bg-primary/10 flex items-center justify-between hover:bg-primary/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
                Conseil IA
              </h2>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-primary transition-transform duration-300", isAdviceOpen && "rotate-180")} />
          </button>
          {isAdviceOpen && (
            <div className="p-4 sm:p-6 space-y-4">
              {!canGetRecommendations ? (
                <div className="rounded-lg border-2 border-primary/20 bg-background/80 p-5">
                  <p className="text-base font-semibold text-foreground">Conseils personnalisés</p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {userPlan === 'free'
                      ? "Les conseils personnalisés par IA sont réservés aux membres Créateur. Passez au plan supérieur pour débloquer vos recommandations de croissance."
                      : "Complétez l'identité et la stratégie de votre marque pour recevoir vos conseils, adaptés à votre secteur et à votre marque d'inspiration. Mise à jour une fois par jour."}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {userPlan === 'free' ? (
                      <Link
                        href="/auth/choose-plan"
                        className="text-sm text-primary hover:underline font-semibold"
                      >
                        🚀 Passer au plan Créateur →
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/launch-map/phase/0"
                          className="text-sm text-primary hover:underline font-semibold"
                        >
                          Compléter l&apos;identité →
                        </Link>
                        <span className="text-muted-foreground">·</span>
                        <Link
                          href="/launch-map/phase/1"
                          className="text-sm text-primary hover:underline font-semibold"
                        >
                          Compléter la stratégie →
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ) : recommendationsLoading ? (
                <div className="flex items-center gap-3 text-foreground py-4 font-medium animate-fade-in">
                  <div className="w-5 h-5 border-2 border-[#007AFF]/20 border-t-[#007AFF] rounded-full animate-apple-spin" />
                  <span>Génération de vos conseils…</span>
                </div>
              ) : recommendationsError ? (
                <p className="text-sm text-muted-foreground">{recommendationsError}</p>
              ) : aiRecommendations.length > 0 ? (
                <>
                  <ul className="space-y-4">
                    {aiRecommendations.slice(0, 3).map((rec, i) => (
                      <li key={i} className="flex gap-4 rounded-lg bg-background/80 border border-border py-3 px-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <p className="text-base text-foreground leading-relaxed font-medium">{rec}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground font-medium">
                    {recommendationsCached ? 'Prochaine mise à jour demain.' : 'Mises à jour une fois par jour.'}
                  </p>
                </>
              ) : null}

              {/* Contexte saisonnier (complément) */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="font-semibold text-foreground text-sm">Saison à venir (hémisphère nord)</p>
                <p className="text-sm text-muted-foreground mt-1">{seasonalRec.reason}</p>
                <p className="text-sm text-foreground mt-2">
                  Produit recommandé : <strong>{getProductTypeLabel(seasonalRec.productType)}</strong> — {seasonalRec.weight}
                  {brandProductType && brandProductType !== seasonalRec.productType && (
                    <span className="text-muted-foreground ml-2">
                      (vous : {formatProductType(brandProductType)})
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Accès rapide aux phases - Horz scroll on mobile */}
        <section className="rounded-xl border border-border bg-card overflow-hidden animate-slide-in-up">
          <div className="p-3 border-b border-border bg-muted/30">
            <h2 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Phases du parcours</h2>
          </div>
          <div className="flex overflow-x-auto p-3 gap-3 scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 sm:p-4">
            {LAUNCH_MAP_PHASES.map((p) => {
              const completed = progress[`phase${p.id}` as keyof typeof progress];
              const isLocked = userPlan === 'free' && ![0, 2].includes(p.id);
              const href = isLocked ? '/auth/choose-plan' : (p.id === 4 ? '/launch-map/tech-packs' : p.id === 5 ? '/launch-map/sourcing' : `/launch-map/phase/${p.id}`);
              const Icon = p.id === 0 ? Palette : p.id === 1 ? Target : p.id === 3 ? PenTool : p.id === 4 ? FileText : p.id === 5 ? Truck : p.id === 7 ? Store : Palette;

              return (
                <Link
                  key={p.id}
                  href={href}
                  className={cn(
                    'flex-shrink-0 w-48 sm:w-auto flex items-center gap-3 rounded-lg border p-3 transition-colors relative',
                    'border-border bg-muted/10 hover:bg-muted/30 hover:border-primary/30',
                    isLocked && 'opacity-80 grayscale-[0.5]'
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-medium text-foreground text-sm">{p.title}</p>
                      {isLocked && (
                        <span className="text-[10px] font-bold uppercase tracking-tight bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded border border-amber-500/20">
                          Créateur
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{p.subtitle}</p>
                  </div>
                  {completed ? (
                    <span className="text-xs font-medium text-green-600 flex-shrink-0">Complété</span>
                  ) : isLocked && (
                    <span className="text-xs font-medium text-muted-foreground flex-shrink-0">🔒</span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
