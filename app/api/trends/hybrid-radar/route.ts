import { NextResponse } from 'next/server';
import { getHybridRadarTrends } from '@/lib/trends-data';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      marketZone: searchParams.get('marketZone') || 'EU',
      segment: searchParams.get('segment') || 'homme',
      sortBy: searchParams.get('sortBy') || 'best',
      limit: Math.min(parseInt(searchParams.get('limit') || '60', 10), 100),
      globalOnly: searchParams.get('globalOnly') === 'true',
      brandFilter: searchParams.get('brand')?.trim(),
      ageRange: searchParams.get('ageRange')?.trim(),
    };

    const result = await getHybridRadarTrends(params);

    return NextResponse.json(result);
  } catch (e) {
    console.error('[Hybrid Radar GET]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur' },
      { status: 500 }
    );
  }
}
