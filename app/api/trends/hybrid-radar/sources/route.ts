/**
 * Liste des sources Zalando pour prévisualisation par ville.
 * 10 villes Homme : Paris, Berlin, Milan, Copenhague, Stockholm, Anvers, Zurich, Londres, Amsterdam, Varsovie.
 * GET /api/trends/hybrid-radar/sources
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getAllSources } from '@/lib/hybrid-radar-sources';

export const runtime = 'nodejs';

const ACTIVE_CITIES = ['paris', 'berlin', 'milan', 'copenhagen', 'stockholm', 'antwerp', 'zurich', 'london', 'amsterdam', 'warsaw'] as const;

function toLabel(id: string): string {
  const m = id.match(/zalando-trend-(homme|femme|garcon|fille)-(.+)/);
  if (!m) return id;
  const segment = m[1] === 'homme' ? 'Homme' : m[1] === 'femme' ? 'Femme' : m[1];
  const citySlug = m[2];
  const cityLabels: Record<string, string> = {
    paris: 'Paris',
    berlin: 'Berlin',
    milan: 'Milan',
    copenhagen: 'Copenhague',
    stockholm: 'Stockholm',
    antwerp: 'Anvers',
    zurich: 'Zurich',
    london: 'Londres',
    amsterdam: 'Amsterdam',
    warsaw: 'Varsovie',
  };
  const city = cityLabels[citySlug] ?? citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
  return `${city} ${segment}`;
}

/** Références actives : 10 villes Homme + 10 villes Femme. */
const ACTIVE_HOMME_IDS = ACTIVE_CITIES.map((c) => `zalando-trend-homme-${c}`);
const ACTIVE_FEMME_IDS = ACTIVE_CITIES.map((c) => `zalando-trend-femme-${c}`);
const ACTIVE_ZALANDO_IDS = [...ACTIVE_HOMME_IDS, ...ACTIVE_FEMME_IDS];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const all = getAllSources();
    const zalando = all.filter((s) => s.brand === 'Zalando' && ACTIVE_ZALANDO_IDS.includes(s.id));
    const sources = zalando.map((s) => ({
      id: s.id,
      label: toLabel(s.id),
      marketZone: s.marketZone,
      segment: s.segment,
      brand: s.brand,
    }));
    return NextResponse.json({ sources });
  } catch (e) {
    console.error('[Hybrid Radar Sources]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur' },
      { status: 500 }
    );
  }
}
