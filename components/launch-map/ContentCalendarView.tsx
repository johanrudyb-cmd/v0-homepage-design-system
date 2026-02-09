'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfDay,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  FileEdit,
  MessageSquare,
  Trash2,
  Loader2,
} from 'lucide-react';
import { GenerationCostBadge } from '@/components/ui/generation-cost-badge';
import { GenerationLoadingPopup } from '@/components/ui/generation-loading-popup';
import { cn } from '@/lib/utils';
import type { ContentCalendarEvent, ContentCalendarEventType, ContentCalendarPlatform, StructuredPostContent, ContentCalendarMeta } from '@/app/api/launch-map/calendar/route';
import { Sparkles, LayoutList } from 'lucide-react';

const EVENT_TYPE_LABELS: Record<ContentCalendarEventType, string> = {
  tournage: 'Tournage',
  post: 'Post-production',
  content: 'Contenu / Script',
};

const EVENT_TYPE_ICONS: Record<ContentCalendarEventType, typeof Video> = {
  tournage: Video,
  post: FileEdit,
  content: MessageSquare,
};

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

/** Affiche la date (et l'heure si présente) d'un événement. */
function formatEventStart(start: string): string {
  const datePart = start.slice(0, 10);
  if (start.includes('T') && start.length >= 16) {
    const timePart = start.slice(11, 16);
    return `${datePart} à ${timePart.replace(':', 'h')}`;
  }
  return datePart;
}

interface GeneratedPostItem {
  platform: ContentCalendarPlatform;
  text: string;
}

export function ContentCalendarView({
  brandId,
  brandName = '',
  allPhasesDone = false,
}: {
  brandId: string;
  brandName?: string;
  allPhasesDone?: boolean;
}) {
  const [events, setEvents] = useState<ContentCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [formType, setFormType] = useState<ContentCalendarEventType>('content');
  const [formTitle, setFormTitle] = useState('');
  const [formScript, setFormScript] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formPlatform, setFormPlatform] = useState<ContentCalendarPlatform | ''>('');

  const [showStructuredForm, setShowStructuredForm] = useState(false);
  const [formStructured, setFormStructured] = useState<StructuredPostContent>({ headline: '', body: '', cta: '', hashtags: '', description: '' });
  const [generateStructuredLoading, setGenerateStructuredLoading] = useState(false);
  const [generateStructuredError, setGenerateStructuredError] = useState<string | null>(null);
  const [isDropOrSalePeriod, setIsDropOrSalePeriod] = useState(false);
  const [calendarMeta, setCalendarMeta] = useState<ContentCalendarMeta | undefined>(undefined);
  /** Fréquence + heure de post issue de la stratégie de contenu (IA). */
  const [contentFrequency, setContentFrequency] = useState<{ maxPostsPerDay: number; label: string; recommendedPostTime?: string }>({
    maxPostsPerDay: 1,
    label: '1 post par jour (par défaut)',
    recommendedPostTime: '18:00',
  });
  const [contentFrequencyLoading, setContentFrequencyLoading] = useState(false);

  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPostItem[]>([]);
  const [generatePostsLoading, setGeneratePostsLoading] = useState(false);
  const [generatePostsError, setGeneratePostsError] = useState<string | null>(null);
  const [postScheduleDate, setPostScheduleDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/launch-map/calendar?brandId=${encodeURIComponent(brandId)}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.events)) {
        setEvents(data.events);
      }
      if (res.ok && data.meta) {
        setCalendarMeta(data.meta);
      }
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Adapter la limite de posts/jour selon la stratégie de contenu (IA) — pas une limite fixe pour tout le monde.
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
        setCalendarMeta((prev) => ({
          ...prev,
          contentStrategyFrequency: { maxPostsPerDay: max, label, recommendedPostTime },
        }));
      })
      .catch(() => {
        if (!cancelled) setContentFrequency({ maxPostsPerDay: 1, label: '1 post par jour (par défaut)' });
      })
      .finally(() => {
        if (!cancelled) setContentFrequencyLoading(false);
      });
    return () => { cancelled = true; };
  }, [brandId, loading, calendarMeta?.contentStrategyFrequency]);

  const saveEvents = useCallback(
    async (nextEvents: ContentCalendarEvent[], options?: { meta?: ContentCalendarMeta }) => {
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
          setShowForm(false);
          setEditingId(null);
          setShowStructuredForm(false);
          resetForm();
        }
      } finally {
        setSaving(false);
      }
    },
    [brandId, calendarMeta]
  );

  function resetForm() {
    setFormType('content');
    setFormTitle('');
    setFormScript('');
    setFormStart('');
    setFormEnd('');
    setFormPlatform('');
    setShowStructuredForm(false);
    setFormStructured({ headline: '', body: '', cta: '', hashtags: '', description: '' });
  }

  function openFormForDate(date: Date) {
    setFormStart(format(date, 'yyyy-MM-dd'));
    setFormEnd('');
    setFormTitle('');
    setFormScript('');
    setFormType('content');
    setEditingId(null);
    setShowForm(true);
  }

  function openFormForEdit(evt: ContentCalendarEvent) {
    const extended = evt as ContentCalendarEvent & { structuredContent?: StructuredPostContent };
    setEditingId(evt.id);
    setFormType(evt.type);
    setFormTitle(evt.title);
    setFormScript(evt.script ?? '');
    setFormStart(evt.start.slice(0, 10));
    setFormEnd(evt.end?.slice(0, 10) ?? '');
    setFormPlatform(extended.platform ?? '');
    if (extended.structuredContent) {
      setShowStructuredForm(true);
      setFormStructured({
        headline: extended.structuredContent.headline ?? '',
        body: extended.structuredContent.body ?? '',
        cta: extended.structuredContent.cta ?? '',
        hashtags: extended.structuredContent.hashtags ?? '',
        description: extended.structuredContent.description ?? '',
      });
    } else {
      setShowStructuredForm(false);
      setFormStructured({ headline: '', body: '', cta: '', hashtags: '', description: '' });
    }
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const start = formStart.trim() || format(new Date(), 'yyyy-MM-dd');
    const payload: ContentCalendarEvent = {
      id: editingId ?? generateId(),
      type: formType,
      title: formTitle.trim() || EVENT_TYPE_LABELS[formType],
      script: formScript.trim() || undefined,
      start,
      end: formEnd.trim() || undefined,
      platform: formPlatform && formType === 'content' ? (formPlatform as ContentCalendarPlatform) : undefined,
    };
    if (editingId) {
      const next = events.map((ev) => (ev.id === editingId ? payload : ev));
      saveEvents(next);
    } else {
      saveEvents([...events, payload]);
    }
  }

  async function handleGenerateStructuredPost() {
    const platform = (formPlatform || 'instagram') as ContentCalendarPlatform;
    if (platform === 'autre') return;
    setGenerateStructuredError(null);
    setGenerateStructuredLoading(true);
    try {
      const res = await fetch('/api/launch-map/generate-structured-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          platform,
          clothesReceived: false,
        }),
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

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  function handleStructuredSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      doSaveStructuredPost();
      return;
    }
    const start = formStart.trim() || todayStr;
    if (!formStart.trim()) {
      setGenerateStructuredError('Choisissez une date.');
      return;
    }
    const startDate = parseISO(start);
    const todayStart = startOfDay(new Date());
    if (isBefore(startDate, todayStart)) {
      setGenerateStructuredError('Choisissez aujourd\'hui ou une date future.');
      return;
    }
    const maxAllowed = contentFrequency.maxPostsPerDay;
    const dateOnly = start.slice(0, 10);
    const contentOnDay = events.filter((ev) => ev.type === 'content' && ev.start.startsWith(dateOnly)).length;
    if (contentOnDay >= maxAllowed && !isDropOrSalePeriod) {
      setGenerateStructuredError(`Limite : ${contentFrequency.label}. Ce jour a déjà ${contentOnDay} post(s). Cochez « Période drop / vente régulière » pour dépasser.`);
      return;
    }
    doSaveStructuredPost();
  }

  function doSaveStructuredPost() {
    const startDate = formStart.trim() || todayStr;
    const dateOnly = startDate.slice(0, 10);
    const platform = (formPlatform || 'instagram') as ContentCalendarPlatform;
    const headline = formStructured.headline?.trim() || '';
    const structuredContent: StructuredPostContent = {
      headline: headline || undefined,
      body: formStructured.body?.trim() || undefined,
      cta: formStructured.cta?.trim() || undefined,
      hashtags: formStructured.hashtags?.trim() || undefined,
      description: formStructured.description?.trim() || undefined,
    };
    const postTime = calendarMeta?.contentStrategyFrequency?.recommendedPostTime ?? contentFrequency.recommendedPostTime ?? '18:00';
    const postStart = startDate.includes('T') ? startDate : `${dateOnly}T${postTime}`;

    const postPayload: ContentCalendarEvent = {
      id: editingId ?? generateId(),
      type: 'content',
      title: headline || `Post ${PLATFORM_LABELS[platform]}`,
      start: postStart,
      platform,
      structuredContent: headline || structuredContent.body || structuredContent.cta || structuredContent.hashtags || structuredContent.description ? structuredContent : undefined,
    };

    const isFirstContent = !calendarMeta?.firstContentPostDate && events.filter((ev) => ev.type === 'content').length === 0 && !editingId;
    const nextMeta: ContentCalendarMeta | undefined = isFirstContent ? { ...calendarMeta, firstContentPostDate: dateOnly } : calendarMeta;

    if (editingId) {
      saveEvents(events.map((ev) => (ev.id === editingId ? postPayload : ev)));
    } else {
      const prodEvent: ContentCalendarEvent = {
        id: generateId(),
        type: 'tournage',
        title: `Prod — Post ${PLATFORM_LABELS[platform]}`,
        start: `${dateOnly}T08:00`,
        platform,
      };
      saveEvents([...events, prodEvent, postPayload], { meta: nextMeta });
    }
  }

  function handleDelete(id: string) {
    if (confirm('Supprimer cet événement ?')) {
      saveEvents(events.filter((ev) => ev.id !== id));
    }
  }

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

  const filteredEvents = selectedDate
    ? events.filter((ev) => ev.start.startsWith(format(selectedDate, 'yyyy-MM-dd')))
    : [...events].sort((a, b) => a.start.localeCompare(b.start));

  async function handleGeneratePosts() {
    setGeneratePostsError(null);
    setGeneratePostsLoading(true);
    try {
      const res = await fetch('/api/launch-map/generate-posts-from-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGeneratedPosts([]);
        setGeneratePostsError(data.error || 'Erreur lors de la génération');
        return;
      }
      if (Array.isArray(data.posts)) {
        setGeneratedPosts(
          data.posts.map((p: { platform: string; text: string }) => ({
            platform: (p.platform === 'x' || p.platform === 'instagram' || p.platform === 'tiktok' || p.platform === 'linkedin' || p.platform === 'facebook' ? p.platform : 'autre') as ContentCalendarPlatform,
            text: p.text,
          }))
        );
      }
    } finally {
      setGeneratePostsLoading(false);
    }
  }

  function addGeneratedPostToCalendar(post: GeneratedPostItem, date: string) {
    const ev: ContentCalendarEvent = {
      id: generateId(),
      type: 'content',
      title: `Post ${PLATFORM_LABELS[post.platform]}`,
      script: post.text,
      start: date,
      platform: post.platform,
    };
    saveEvents([...events, ev]);
    setGeneratedPosts((prev) => prev.filter((p) => p !== post));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GenerationLoadingPopup open={generatePostsLoading} title="Génération des posts…" />
      <GenerationLoadingPopup open={generateStructuredLoading} title="Génération du post structuré…" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Colonne gauche : contenu, formulaires, liste */}
        <div className="space-y-6 order-2 lg:order-1">
      {/* Créer des posts depuis la stratégie de contenu (toutes les phases + Shopify) */}
      {allPhasesDone && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Posts depuis votre stratégie de contenu
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Générez des posts adaptés à chaque plateforme (Instagram, TikTok, LinkedIn, Facebook, X) à partir de votre stratégie, puis ajoutez-les au calendrier à la date de votre choix.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedPosts.length === 0 ? (
              <Button
                type="button"
                onClick={handleGeneratePosts}
                disabled={generatePostsLoading}
                variant="secondary"
                className="gap-2"
              >
                {generatePostsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Générer des posts par plateforme
                <GenerationCostBadge feature="launch_map_posts_from_strategy" />
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="text-sm">Date d&apos;affichage :</Label>
                  <Input
                    type="date"
                    value={postScheduleDate}
                    onChange={(e) => setPostScheduleDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <ul className="space-y-3">
                  {generatedPosts.map((post) => (
                    <li
                      key={post.platform}
                      className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 rounded-lg border border-border bg-background"
                    >
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary shrink-0 w-fit">
                        {PLATFORM_LABELS[post.platform]}
                      </span>
                      <p className="text-sm text-foreground flex-1 line-clamp-3">{post.text}</p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addGeneratedPostToCalendar(post, postScheduleDate)}
                        disabled={saving}
                        className="shrink-0"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter au calendrier'}
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button type="button" variant="ghost" size="sm" onClick={() => setGeneratedPosts([])}>
                  Fermer
                </Button>
              </>
            )}
            {generatePostsError && (
              <p className="text-sm text-destructive">{generatePostsError}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Boutons ajouter + formulaire */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => {
            resetForm();
            setFormStart(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
            setEditingId(null);
            setShowStructuredForm(false);
            setShowForm(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter un événement
        </Button>
        <Link
          href="/launch-map/phase/5"
          className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <LayoutList className="w-4 h-4" />
          Créer un post structuré
        </Link>
        {selectedDate && (
          <span className="text-sm text-muted-foreground">
            Jour sélectionné : {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
          </span>
        )}
      </div>

      {showForm && showStructuredForm && editingId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LayoutList className="w-4 h-4" />
              {editingId ? 'Modifier le post structuré' : 'Nouveau post structuré'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Le contenu est généré par l&apos;IA à partir de votre stratégie (champs grisés, non modifiables). Choisissez la date de publication en cliquant sur un jour dans le calendrier à droite.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStructuredSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="struct-platform">Plateforme</Label>
                  <select
                    id="struct-platform"
                    value={formPlatform || 'instagram'}
                    onChange={(e) => setFormPlatform(e.target.value as ContentCalendarPlatform)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    {(Object.keys(PLATFORM_LABELS) as ContentCalendarPlatform[]).map((p) => (
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
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Publication prévue à <strong>{(calendarMeta?.contentStrategyFrequency?.recommendedPostTime ?? contentFrequency.recommendedPostTime ?? '18:00').replace(':', 'h')}</strong>. Un créneau « Prod » est ajouté le même jour.
                    </span>
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground mb-2">Génération par IA</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Générez le contenu du post (titre, corps, description, CTA, hashtags) à partir de votre stratégie complète. Les champs générés sont fixes (non modifiables).
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateStructuredPost}
                  disabled={generateStructuredLoading || formPlatform === 'autre'}
                  className="gap-2"
                >
                  {generateStructuredLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Générer le contenu avec l&apos;IA
                  <GenerationCostBadge feature="launch_map_structured_post" />
                </Button>
                {generateStructuredError && (
                  <p className="text-xs text-destructive mt-2">{generateStructuredError}</p>
                )}
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
                <input
                  type="checkbox"
                  id="struct-drop"
                  checked={isDropOrSalePeriod}
                  onChange={(e) => setIsDropOrSalePeriod(e.target.checked)}
                  className="rounded border-input"
                />
                <Label htmlFor="struct-drop" className="cursor-pointer text-sm">
                  Période drop / vente régulière (autoriser plusieurs posts ce jour)
                </Label>
              </div>
              {contentFrequencyLoading ? (
                <p className="text-xs text-muted-foreground">Chargement de la fréquence depuis votre stratégie de contenu…</p>
              ) : (
                <p className="text-xs text-muted-foreground">Limite selon votre stratégie de contenu : <strong>{contentFrequency.label}</strong></p>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditingId(null); setShowStructuredForm(false); resetForm(); }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showForm && !showStructuredForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editingId ? 'Modifier l\'événement' : 'Nouvel événement'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cal-type">Type</Label>
                  <select
                    id="cal-type"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ContentCalendarEventType)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {(Object.keys(EVENT_TYPE_LABELS) as ContentCalendarEventType[]).map((t) => (
                      <option key={t} value={t}>
                        {EVENT_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="cal-title">Titre</Label>
                  <Input
                    id="cal-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex. Tournage lookbook"
                    className="mt-1"
                  />
                </div>
              </div>
              {formType === 'content' && (
                <div>
                  <Label htmlFor="cal-platform">Plateforme (optionnel)</Label>
                  <select
                    id="cal-platform"
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as ContentCalendarPlatform | '')}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">—</option>
                    {(Object.keys(PLATFORM_LABELS) as ContentCalendarPlatform[]).map((p) => (
                      <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Label htmlFor="cal-script">Script / description (optionnel)</Label>
                <textarea
                  id="cal-script"
                  value={formScript}
                  onChange={(e) => setFormScript(e.target.value)}
                  placeholder="Idées de script, notes pour le contenu..."
                  rows={3}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cal-start">Date de début</Label>
                  <Input
                    id="cal-start"
                    type="date"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cal-end">Date de fin (optionnel)</Label>
                  <Input
                    id="cal-end"
                    type="date"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des événements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selectedDate ? `Événements du ${format(selectedDate, 'd MMM yyyy', { locale: fr })}` : 'Tous les événements'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun événement. Ajoutez des créneaux de tournage, post-production, scripts ou CTA UGC.
            </p>
          ) : (
            <ul className="space-y-3">
              {filteredEvents.map((ev) => {
                const Icon = EVENT_TYPE_ICONS[ev.type];
                const extended = ev as ContentCalendarEvent & { structuredContent?: StructuredPostContent };
                const structured = extended.structuredContent;

                if (structured && (structured.headline || structured.body || structured.cta || structured.hashtags || structured.description)) {
                  return (
                    <li
                      key={ev.id}
                      className="rounded-lg border border-border bg-card overflow-hidden"
                    >
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                              <LayoutList className="w-3.5 h-3.5" />
                              Post structuré
                            </span>
                            {extended.platform && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                                {PLATFORM_LABELS[extended.platform]}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatEventStart(ev.start)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => openFormForEdit(ev)}>
                              Modifier
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive" onClick={() => handleDelete(ev.id)} aria-label="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {structured.headline && (
                          <p className="font-semibold text-foreground">{structured.headline}</p>
                        )}
                        {structured.body && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{structured.body}</p>
                        )}
                        {structured.description && (
                          <p className="text-xs text-muted-foreground italic">{structured.description}</p>
                        )}
                        {structured.cta && (
                          <p className="text-sm text-primary font-medium">{structured.cta}</p>
                        )}
                        {structured.hashtags && (
                          <p className="text-xs text-muted-foreground">{structured.hashtags}</p>
                        )}
                      </div>
                    </li>
                  );
                }

                return (
                  <li
                    key={ev.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        <Icon className="w-3.5 h-3.5" />
                        {EVENT_TYPE_LABELS[ev.type]}
                      </span>
                      {(ev as { platform?: ContentCalendarPlatform }).platform && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                          {PLATFORM_LABELS[(ev as { platform: ContentCalendarPlatform }).platform]}
                        </span>
                      )}
                      <span className="font-medium text-foreground truncate">{ev.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatEventStart(ev.start)}
                      {ev.end && ` → ${formatEventStart(ev.end)}`}
                    </div>
                    {ev.script && (
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{ev.script}</p>
                    )}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => openFormForEdit(ev)}>
                        Modifier
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive" onClick={() => handleDelete(ev.id)} aria-label="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
        </div>

        {/* Colonne droite : calendrier (date de publication = clic sur un jour) */}
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
                  const isChosenForStructuredPost = showStructuredForm && editingId && formStart && formStart.startsWith(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isPast}
                      onClick={() => {
                        if (isPast) return;
                        setSelectedDate(day);
                        if (showForm && showStructuredForm) {
                          setFormStart(format(day, 'yyyy-MM-dd'));
                        }
                      }}
                      className={cn(
                        'aspect-square rounded-md border text-sm transition-colors',
                        isSameMonth(day, currentMonth)
                          ? 'bg-background hover:bg-muted border-border'
                          : 'bg-muted/30 text-muted-foreground border-transparent',
                        isPast && 'opacity-50 cursor-not-allowed hover:bg-background',
                        isSelected && !isPast && 'ring-2 ring-primary border-primary',
                        isChosenForStructuredPost && !isPast && 'ring-2 ring-primary border-primary font-semibold'
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
