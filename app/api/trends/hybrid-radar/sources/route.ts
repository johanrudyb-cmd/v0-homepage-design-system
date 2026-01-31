/**
 * Liste des sources Zalando (villes × segment) pour prévisualisation par ville.
 * GET /api/trends/hybrid-radar/sources
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getAllSources } from '@/lib/hybrid-radar-sources';

export const runtime = 'nodejs';

function toLabel(id: string): string {
  const m = id.match(/zalando-trend-(homme|femme|garcon|fille)-(.+)/);
  if (!m) return id;
  const segment = m[1] === 'homme' ? 'Homme' : m[1] === 'femme' ? 'Femme' : m[1];
  const city = m[2].charAt(0).toUpperCase() + m[2].slice(1);
  return `${city} ${segment}`;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const all = getAllSources();
    const zalando = all.filter((s) => s.brand === 'Zalando');
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
