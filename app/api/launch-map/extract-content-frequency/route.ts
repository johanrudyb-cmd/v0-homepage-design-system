import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { extractContentFrequencyFromStrategy, isClaudeConfigured } from '@/lib/api/claude';
import type { ContentCalendarMeta, ContentStrategyFrequencyMeta } from '@/app/api/launch-map/calendar/route';

export const dynamic = 'force-dynamic';

function parseCalendarMeta(raw: unknown): ContentCalendarMeta | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const m = raw as Record<string, unknown>;
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
  return {
    firstContentPostDate: typeof m.firstContentPostDate === 'string' ? m.firstContentPostDate : undefined,
    contentStrategyFrequency,
  };
}

/**
 * POST : extrait la fréquence de publication (max posts/jour) depuis la stratégie de contenu (section 6)
 * et la sauvegarde dans les meta du calendrier. Retourne { maxPostsPerDay, label }.
 * Si pas de stratégie ou IA non dispo : retourne défaut 1 post/jour sans sauvegarder.
 */
export async function POST(request: Request) {
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
      include: { launchMap: true, strategyGenerations: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque introuvable' }, { status: 404 });
    }

    const latestStrategy = brand.strategyGenerations[0];
    const strategyText = latestStrategy?.strategyText?.trim();

    if (!strategyText || !isClaudeConfigured()) {
      return NextResponse.json({
        maxPostsPerDay: 1,
        label: '1 post par jour (par défaut)',
        recommendedPostTime: '18:00',
      });
    }

    const frequency = await extractContentFrequencyFromStrategy(strategyText);

    const lm = brand.launchMap;
    const existingRaw = lm?.contentCalendar;
    let existingMeta: ContentCalendarMeta | undefined;
    if (existingRaw && typeof existingRaw === 'object' && 'meta' in existingRaw) {
      existingMeta = parseCalendarMeta((existingRaw as { meta?: unknown }).meta);
    }
    const nextMeta: ContentCalendarMeta = {
      ...existingMeta,
      contentStrategyFrequency: {
        maxPostsPerDay: frequency.maxPostsPerDay,
        label: frequency.label,
        recommendedPostTime: frequency.recommendedPostTime ?? '18:00',
      },
    };

    const payload = existingRaw && typeof existingRaw === 'object' && 'events' in existingRaw
      ? { ...(existingRaw as object), meta: nextMeta }
      : { events: [], meta: nextMeta };

    if (lm) {
      await prisma.launchMap.update({
        where: { id: lm.id },
        data: { contentCalendar: payload as object },
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
          contentCalendar: payload as object,
        },
      });
    }

    return NextResponse.json({
      maxPostsPerDay: frequency.maxPostsPerDay,
      label: frequency.label ?? `${frequency.maxPostsPerDay} post${frequency.maxPostsPerDay > 1 ? 's' : ''} par jour`,
      recommendedPostTime: frequency.recommendedPostTime ?? '18:00',
    });
  } catch (e) {
    console.error('POST /api/launch-map/extract-content-frequency', e);
    return NextResponse.json(
      { maxPostsPerDay: 1, label: '1 post par jour (par défaut)', recommendedPostTime: '18:00' }
    );
  }
}
