'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  format,
  addDays,
  addMonths,
  subMonths,
  isBefore,
  isWithinInterval,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, LayoutList, VideoIcon, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { GenerationCostBadge } from '@/components/ui/generation-cost-badge';
import { GenerationLoadingPopup } from '@/components/ui/generation-loading-popup';
import { cn } from '@/lib/utils';
import type {
  ContentCalendarEvent,
  ContentCalendarPlatform,
  StructuredPostContent,
  ContentCalendarMeta,
} from '@/app/api/launch-map/calendar/route';

const PLATFORM_LABELS: Record<ContentCalendarPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  x: 'X (Twitter)',
  autre: 'Autre',
};

function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

interface StructuredPostCreatorProps {
  brandId: string;
  brandName: string;
  onSaved?: () => void;
}

export function StructuredPostCreator({ brandId, brandName, onSaved }: StructuredPostCreatorProps) {
  const [events, setEvents] = useState<ContentCalendarEvent[]>([]);
  const [calendarMeta, setCalendarMeta] = useState<ContentCalendarMeta | undefined>(undefined);
  const [contentFrequency, setContentFrequency] = useState({
    maxPostsPerDay: 1,
    label: '1 post par jour (par défaut)',
    recommendedPostTime: '18:00',
  });
  const [contentFrequencyLoading, setContentFrequencyLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [clothesReceived, setClothesReceived] = useState<boolean | null>(null);

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date());

  const [platform, setPlatform] = useState<ContentCalendarPlatform>('instagram');
  const [formStart, setFormStart] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [formStructured, setFormStructured] = useState<StructuredPostContent>({
    headline: '',
    body: '',
    cta: '',
    hashtags: '',
    description: '',
  });
  const [generateStructuredLoading, setGenerateStructuredLoading] = useState(false);
  const [generateStructuredError, setGenerateStructuredError] = useState<string | null>(null);
  const [isDropOrSalePeriod, setIsDropOrSalePeriod] = useState(false);
  const [showUgcSavingsBannerAfterSave, setShowUgcSavingsBannerAfterSave] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/launch-map/calendar?brandId=${encodeURIComponent(brandId)}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.events)) setEvents(data.events);
      if (res.ok && data.meta) setCalendarMeta(data.meta);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (loading || !brandId) return;
    const fromMeta = calendarMeta?.contentStrategyFrequency;
    if (fromMeta && fromMeta.maxPostsPerDay >= 1) {
      setContentFrequency({
        maxPostsPerDay: fromMeta.maxPostsPerDay,
        label: fromMeta.label ?? `${fromMeta.maxPostsPerDay} post${fromMeta.maxPostsPerDay > 1 ? 's' : ''} par jour`,
        recommendedPostTime: fromMeta.recommendedPostTime ?? '18:00',
      });
      return;
    }
    let cancelled = false;
    setContentFrequencyLoading(true);
    fetch('/api/launch-map/extract-content-frequency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const max = typeof data.maxPostsPerDay === 'number' && data.maxPostsPerDay >= 1 ? Math.min(10, data.maxPostsPerDay) : 1;
        const label = typeof data.label === 'string' && data.label.trim() ? data.label.trim() : `${max} post${max > 1 ? 's' : ''} par jour`;
        const recommendedPostTime = typeof data.recommendedPostTime === 'string' && /^\d{2}:\d{2}$/.test(data.recommendedPostTime) ? data.recommendedPostTime : '18:00';
        setContentFrequency({ maxPostsPerDay: max, label, recommendedPostTime });
        setCalendarMeta((prev) => ({ ...prev, contentStrategyFrequency: { maxPostsPerDay: max, label, recommendedPostTime } }));
      })
      .catch(() => {
        if (!cancelled) setContentFrequency({ maxPostsPerDay: 1, label: '1 post par jour (par défaut)', recommendedPostTime: '18:00' });
      })
      .finally(() => {
        if (!cancelled) setContentFrequencyLoading(false);
      });
    return () => { cancelled = true; };
  }, [brandId, loading, calendarMeta?.contentStrategyFrequency]);

  const saveEvents = useCallback(
    async (nextEvents: ContentCalendarEvent[], options?: { meta?: ContentCalendarMeta; showUgcSavingsBanner?: boolean }) => {
      setSaving(true);
      try {
        const res = await fetch('/api/launch-map/calendar', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandId, events: nextEvents, meta: options?.meta ?? calendarMeta }),
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.events)) {
          setEvents(data.events);
          if (data.meta) setCalendarMeta(data.meta);
          if (options?.showUgcSavingsBanner) setShowUgcSavingsBannerAfterSave(true);
          setFormStructured({ headline: '', body: '', cta: '', hashtags: '', description: '' });
          onSaved?.();
        }
      } finally {
        setSaving(false);
      }
    },
    [brandId, calendarMeta, onSaved]
  );

  async function handleGenerate() {
    if (platform === 'autre') return;
    setGenerateStructuredError(null);
    setGenerateStructuredLoading(true);
    try {
      const res = await fetch('/api/launch-map/generate-structured-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, platform, clothesReceived: clothesReceived === true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerateStructuredError(data.error || 'Erreur lors de la génération');
        return;
      }
      setFormStructured({
        headline: data.headline ?? '',
        body: data.body ?? '',
        cta: data.cta ?? '',
        hashtags: data.hashtags ?? '',
        description: data.description ?? '',
      });
    } finally {
      setGenerateStructuredLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const start = formStart.trim() || todayStr;
    const startDate = parseISO(start);
    const todayStart = startOfDay(new Date());
    if (isBefore(startDate, todayStart)) {
      setGenerateStructuredError('Choisissez aujourd\'hui ou une date future.');
      return;
    }
    if (clothesReceived === true && !isWithinInterval(startDate, { start: new Date(), end: suggestedRangeEnd })) {
      setGenerateStructuredError('Les 7 prochains jours sont recommandés (vous avez reçu vos vêtements).');
      return;
    }
    const maxAllowed = contentFrequency.maxPostsPerDay;
    const dateOnly = start.slice(0, 10);
    const contentOnDay = events.filter((ev) => ev.type === 'content' && ev.start.startsWith(dateOnly)).length;
    if (contentOnDay >= maxAllowed && !isDropOrSalePeriod) {
      setGenerateStructuredError(`Limite : ${contentFrequency.label}. Ce jour a déjà ${contentOnDay} post(s). Cochez « Période drop / vente régulière » pour dépasser.`);
      return;
    }
    const headline = formStructured.headline?.trim() || '';
    const structuredContent: StructuredPostContent = {
      headline: headline || undefined,
      body: formStructured.body?.trim() || undefined,
      cta: formStructured.cta?.trim() || undefined,
      hashtags: formStructured.hashtags?.trim() || undefined,
      description: formStructured.description?.trim() || undefined,
    };
    const postTime = calendarMeta?.contentStrategyFrequency?.recommendedPostTime ?? contentFrequency.recommendedPostTime ?? '18:00';
    const postStart = start.includes('T') ? start : `${dateOnly}T${postTime}`;
    const postPayload: ContentCalendarEvent = {
      id: generateId(),
      type: 'content',
      title: headline || `Post ${PLATFORM_LABELS[platform]}`,
      start: postStart,
      platform,
      structuredContent: headline || structuredContent.body || structuredContent.cta || structuredContent.hashtags || structuredContent.description ? structuredContent : undefined,
    };
    const prodEvent: ContentCalendarEvent = {
      id: generateId(),
      type: 'tournage',
      title: `Prod — Post ${PLATFORM_LABELS[platform]}`,
      start: `${dateOnly}T08:00`,
      platform,
    };
    const isFirstContent = !calendarMeta?.firstContentPostDate && events.filter((ev) => ev.type === 'content').length === 0;
    const nextMeta: ContentCalendarMeta | undefined = isFirstContent ? { ...calendarMeta, firstContentPostDate: dateOnly } : calendarMeta;
    saveEvents([...events, prodEvent, postPayload], { meta: nextMeta, showUgcSavingsBanner: clothesReceived === true });
  }

  const hasContent = formStructured.headline || formStructured.body || formStructured.cta || formStructured.hashtags || formStructured.description;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const suggestedRangeEnd = addDays(new Date(), 6);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const eventsByDate = events.reduce<Record<string, ContentCalendarEvent[]>>((acc, ev) => {
    const d = ev.start.slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(ev);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GenerationLoadingPopup open={generateStructuredLoading} title="Génération du post structuré…" />
      {/* Modal : Avez-vous reçu vos vêtements ? */}
      {clothesReceived === null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-labelledby="clothes-modal-title">
          <div className="rounded-xl border border-border bg-background p-6 shadow-xl max-w-md w-full text-foreground">
            <h2 id="clothes-modal-title" className="text-lg font-semibold text-foreground mb-2">
              Avez-vous reçu vos vêtements du fournisseur ?
            </h2>
            <p className="text-sm text-foreground/90 mb-4">
              Oui : contenu mettant en avant le vêtement (tournage ou visuels IA). Non : vous créerez le contenu avec l&apos;IA. Vous pourrez planifier la date de publication ci-dessous.
            </p>
            <div className="flex gap-3">
              <Button type="button" onClick={() => { setClothesReceived(true); setGenerateStructuredError(null); }} className="flex-1">
                Oui
              </Button>
              <Button type="button" variant="outline" onClick={() => { setClothesReceived(false); setGenerateStructuredError(null); }} className="flex-1">
                Non (pas encore reçu)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bannière économies shooting (après enregistrement) */}
      {showUgcSavingsBannerAfterSave && (
        <div className="rounded-lg border-2 border-emerald-600/50 bg-emerald-500/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3 relative">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <VideoIcon className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <p className="text-base font-semibold text-foreground">Faites des économies sur vos shootings.</p>
              <p className="text-sm text-foreground/90 mt-0.5">
                Générez des visuels au rendu pro avec l&apos;IA dans Virtual Try-On à moindre coût.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="ghost" size="icon" className="h-10 w-10" onClick={() => setShowUgcSavingsBannerAfterSave(false)} aria-label="Fermer">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bannière UGC LAB (quand pas encore reçu) */}
      {clothesReceived === false && (
        <div className="rounded-lg border-2 border-amber-500 bg-amber-500/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <VideoIcon className="w-6 h-6 text-amber-700 shrink-0" />
            <div>
              <p className="text-base font-semibold text-foreground">Vous créerez ce contenu avec l&apos;aide de l&apos;IA.</p>
              <p className="text-sm text-foreground/90 mt-0.5">Vos posts planifiés apparaîtront dans le Calendrier.</p>
            </div>
          </div>
          <Link href="/launch-map/calendar" className="inline-flex items-center justify-center rounded-lg font-semibold h-10 px-5 text-sm bg-amber-600 text-white hover:bg-amber-700 shrink-0">
            Voir le calendrier
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Colonne gauche : formulaire */}
        <div className="space-y-6 order-2 lg:order-1">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <LayoutList className="w-5 h-5" />
            Créer un post structuré
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Générez un post (accroche, corps, CTA, hashtags) par IA à partir de votre stratégie. Choisissez la date en cliquant sur un jour dans le calendrier à droite.
          </p>
        </CardHeader>
        <CardContent>
          {clothesReceived === null ? (
            <p className="text-sm text-muted-foreground">Répondez à la question ci-dessus pour continuer.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="struct-platform">Plateforme</Label>
                  <select
                    id="struct-platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as ContentCalendarPlatform)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    {(['instagram', 'tiktok', 'linkedin', 'facebook', 'x'] as const).map((p) => (
                      <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Date de publication</Label>
                  <p className="text-sm mt-1 text-muted-foreground">
                    {formStart ? (
                      <strong className="text-foreground">{format(parseISO(formStart), 'd MMMM yyyy', { locale: fr })}</strong>
                    ) : (
                      'Choisissez un jour sur le calendrier à droite →'
                    )}
                    {clothesReceived === true && formStart && (
                      <>
                        <span className="block text-xs text-primary mt-0.5">Les 7 prochains jours (en surbrillance) sont recommandés.</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">Vous pouvez générer vos visuels avec l&apos;IA dans Virtual Try-On pour faire des économies sur les shootings.</span>
                      </>
                    )}
                    {clothesReceived === false && (
                      <span className="block text-xs text-muted-foreground mt-0.5">Vos posts planifiés apparaîtront dans le calendrier.</span>
                    )}
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Publication prévue à <strong>{(calendarMeta?.contentStrategyFrequency?.recommendedPostTime ?? contentFrequency.recommendedPostTime ?? '18:00').replace(':', 'h')}</strong>. Un créneau « Prod » est ajouté le même jour.
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground mb-2">Génération par IA</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Générez le contenu (titre, corps, description, CTA, hashtags) à partir de votre stratégie. Les champs sont fixes (non modifiables).
                </p>
                <Button type="button" variant="secondary" size="sm" onClick={handleGenerate} disabled={generateStructuredLoading || platform === 'autre'} className="gap-2">
                  {generateStructuredLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Générer le contenu avec l&apos;IA
                  <GenerationCostBadge feature="launch_map_structured_post" />
                </Button>
                {generateStructuredError && <p className="text-xs text-destructive mt-2">{generateStructuredError}</p>}
              </div>

              <div>
                <Label>Titre / Accroche</Label>
                <div className="mt-1 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground min-h-[2.5rem]">
                  {formStructured.headline || '— Généré par l\'IA —'}
                </div>
              </div>
              <div>
                <Label>Corps du message</Label>
                <div className="mt-1 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground min-h-[5rem] whitespace-pre-wrap">
                  {formStructured.body || '— Généré par l\'IA —'}
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <div className="mt-1 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground min-h-[2.5rem]">
                  {formStructured.description || '— Généré par l\'IA —'}
                </div>
              </div>
              <div>
                <Label>Call-to-action (CTA)</Label>
                <div className="mt-1 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground min-h-[2.5rem]">
                  {formStructured.cta || '— Généré par l\'IA —'}
                </div>
              </div>
              <div>
                <Label>Hashtags</Label>
                <div className="mt-1 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground min-h-[2.5rem]">
                  {formStructured.hashtags || '— Généré par l\'IA —'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="struct-drop" checked={isDropOrSalePeriod} onChange={(e) => setIsDropOrSalePeriod(e.target.checked)} className="rounded border-input" />
                <Label htmlFor="struct-drop" className="cursor-pointer text-sm">
                  Période drop / vente régulière (autoriser plusieurs posts ce jour)
                </Label>
              </div>
              {contentFrequencyLoading ? (
                <p className="text-xs text-muted-foreground">Chargement de la fréquence…</p>
              ) : (
                <p className="text-xs text-muted-foreground">Limite selon votre stratégie : <strong>{contentFrequency.label}</strong></p>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={saving || !hasContent}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer dans le calendrier'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormStructured({ headline: '', body: '', cta: '', hashtags: '', description: '' });
                    setFormStart(todayStr);
                    setGenerateStructuredError(null);
                  }}
                >
                  Nouveau post
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        <Link href="/launch-map/calendar" className="text-primary hover:underline">
          Voir le calendrier complet et gérer les événements →
        </Link>
      </p>
        </div>

        {/* Colonne droite : calendrier */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth((d) => subMonths(d, 1))}
                    aria-label="Mois précédent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
                    aria-label="Mois suivant"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                  <div key={d} className="font-medium text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
                {Array.from({ length: paddingDays }).map((_, i) => (
                  <div key={`pad-${i}`} className="aspect-square" />
                ))}
                {days.map((day) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDate[key] ?? [];
                  const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isInSuggested7Days = clothesReceived === true && !isPast && isWithinInterval(day, { start: new Date(), end: suggestedRangeEnd });
                  const isChosenForPost = formStart && formStart.startsWith(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isPast}
                      onClick={() => {
                        if (isPast) return;
                        setSelectedDate(day);
                        setFormStart(key);
                      }}
                      className={cn(
                        'aspect-square rounded-md border text-sm transition-colors',
                        isSameMonth(day, currentMonth)
                          ? 'bg-background hover:bg-muted border-border'
                          : 'bg-muted/30 text-muted-foreground border-transparent',
                        isPast && 'opacity-50 cursor-not-allowed hover:bg-background',
                        isSelected && !isPast && 'ring-2 ring-primary border-primary',
                        isInSuggested7Days && !isPast && 'animate-pulse ring-2 ring-primary/60 bg-primary/10 border-primary/40',
                        isChosenForPost && !isPast && 'ring-2 ring-primary border-primary font-semibold'
                      )}
                    >
                      {format(day, 'd')}
                      {dayEvents.length > 0 && (
                        <span className="block w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedDate && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Jour sélectionné : {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Événements du jour sélectionné */}
          {selectedDate && (() => {
            const dateKey = format(selectedDate, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[dateKey] ?? [];
            if (dayEvents.length === 0) return null;
            return (
              <Card className="mt-4">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">
                    Événements du {format(selectedDate, 'd MMM yyyy', { locale: fr })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {dayEvents.map((ev) => {
                      const ext = ev as ContentCalendarEvent & { structuredContent?: StructuredPostContent };
                      return (
                        <li key={ev.id} className="text-xs flex items-center gap-2 p-2 rounded-md bg-muted/30">
                          <LayoutList className="w-3.5 h-3.5 shrink-0 text-primary" />
                          <span className="font-medium truncate">{ev.title}</span>
                          {ext.platform && (
                            <span className="shrink-0 text-muted-foreground">{PLATFORM_LABELS[ext.platform]}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
