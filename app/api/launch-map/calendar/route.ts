import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export type ContentCalendarEventType = 'tournage' | 'post' | 'content';

export type ContentCalendarPlatform = 'instagram' | 'tiktok' | 'linkedin' | 'facebook' | 'x' | 'autre';

/** Champs d’un post structuré (titre, corps, CTA, hashtags, description) — générés par IA, non modifiables */
export interface StructuredPostContent {
  headline?: string;
  body?: string;
  cta?: string;
  hashtags?: string;
  description?: string;
}

export interface ContentCalendarEvent {
  id: string;
  type: ContentCalendarEventType;
  title: string;
  script?: string;
  start: string; // ISO date (YYYY-MM-DD) ou datetime
  end?: string;
  /** Plateforme pour les posts générés depuis la stratégie de contenu */
  platform?: ContentCalendarPlatform;
  /** Post structuré : accroche, corps, CTA, hashtags */
  structuredContent?: StructuredPostContent;
}

/** Fréquence de publication issue de la stratégie de contenu (section 6) — limite dynamique de posts/jour + heure. */
export interface ContentStrategyFrequencyMeta {
  maxPostsPerDay: number;
  label?: string;
  /** Heure de publication recommandée (HH:mm). */
  recommendedPostTime?: string;
}

export interface ContentCalendarMeta {
  firstContentPostDate?: string;
  /** Fréquence extraite par IA depuis la stratégie de contenu (non fixe 1/jour). */
  contentStrategyFrequency?: ContentStrategyFrequencyMeta;
}

export interface ContentCalendarPayload {
  events: ContentCalendarEvent[];
  meta?: ContentCalendarMeta;
}

function parseCalendar(raw: unknown): ContentCalendarPayload {
  if (raw && typeof raw === 'object' && 'events' in raw && Array.isArray((raw as { events: unknown }).events)) {
    const events = ((raw as { events: unknown[] }).events)
      .filter((e): e is ContentCalendarEvent => Boolean(e && typeof e === 'object' && 'id' in e && 'type' in e && 'title' in e && 'start' in e))
      .map((e) => {
        const ev = e as ContentCalendarEvent & { structuredContent?: unknown };
        let structuredContent: StructuredPostContent | undefined;
        if (ev.structuredContent && typeof ev.structuredContent === 'object' && !Array.isArray(ev.structuredContent)) {
          const s = ev.structuredContent as Record<string, unknown>;
          structuredContent = {
            headline: typeof s.headline === 'string' ? s.headline : undefined,
            body: typeof s.body === 'string' ? s.body : undefined,
            cta: typeof s.cta === 'string' ? s.cta : undefined,
            hashtags: typeof s.hashtags === 'string' ? s.hashtags : undefined,
            description: typeof s.description === 'string' ? s.description : undefined,
          };
        }
        return {
          id: String(e.id),
          type: ['tournage', 'post', 'content'].includes(e.type) ? e.type : 'content',
          title: String(e.title ?? ''),
          script: e.script != null ? String(e.script) : undefined,
          start: String(e.start),
          end: e.end != null ? String(e.end) : undefined,
          platform: e.platform && ['instagram', 'tiktok', 'linkedin', 'facebook', 'x', 'autre'].includes(e.platform) ? e.platform : undefined,
          structuredContent,
        };
      });
    const rawObj = raw as { events: unknown[]; meta?: unknown };
    let meta: ContentCalendarMeta | undefined;
    if (rawObj.meta && typeof rawObj.meta === 'object' && !Array.isArray(rawObj.meta)) {
      const m = rawObj.meta as Record<string, unknown>;
      let contentStrategyFrequency: ContentStrategyFrequencyMeta | undefined;
      if (m.contentStrategyFrequency && typeof m.contentStrategyFrequency === 'object' && !Array.isArray(m.contentStrategyFrequency)) {
        const f = m.contentStrategyFrequency as Record<string, unknown>;
        const max = typeof f.maxPostsPerDay === 'number' && f.maxPostsPerDay >= 1 ? Math.min(10, Math.round(f.maxPostsPerDay)) : undefined;
        if (max != null) {
          contentStrategyFrequency = {
            maxPostsPerDay: max,
            label: typeof f.label === 'string' && f.label.trim() ? f.label.trim() : undefined,
            recommendedPostTime: typeof f.recommendedPostTime === 'string' && /^\d{2}:\d{2}$/.test(f.recommendedPostTime) ? f.recommendedPostTime : undefined,
          };
        }
      }
      meta = {
        firstContentPostDate: typeof m.firstContentPostDate === 'string' ? m.firstContentPostDate : undefined,
        contentStrategyFrequency,
      };
    }
    return { events, meta };
  }
  return { events: [], meta: undefined };
}

/** GET : récupère les événements du calendrier contenu pour la marque de l'utilisateur */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: { launchMap: true },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque introuvable' }, { status: 404 });
    }

    const lm = brand.launchMap;
    const payload = parseCalendar(lm?.contentCalendar ?? null);
    return NextResponse.json(payload);
  } catch (e) {
    console.error('GET /api/launch-map/calendar', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/** PATCH : enregistre les événements du calendrier contenu */
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const brandId = typeof body.brandId === 'string' ? body.brandId : null;
    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: { launchMap: true },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque introuvable' }, { status: 404 });
    }

    const payload = parseCalendar(
      body.events != null ? { events: body.events, meta: body.meta } : body
    );
    if (!payload.meta && brand.launchMap?.contentCalendar) {
      const existing = parseCalendar(brand.launchMap.contentCalendar);
      (payload as { meta?: ContentCalendarMeta }).meta = existing.meta;
    }
    const contentCalendar = payload as unknown as Prisma.InputJsonValue;

    if (brand.launchMap) {
      await prisma.launchMap.update({
        where: { id: brand.launchMap.id },
        data: { contentCalendar },
      });
    } else {
      await prisma.launchMap.create({
        data: {
          brandId: brand.id,
          phase1: false,
          phase2: false,
          phase3: false,
          phase4: false,
          phase5: false,
          phase6: false,
          contentCalendar,
        },
      });
    }

    return NextResponse.json({ events: payload.events, meta: payload.meta });
  } catch (e) {
    console.error('PATCH /api/launch-map/calendar', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
