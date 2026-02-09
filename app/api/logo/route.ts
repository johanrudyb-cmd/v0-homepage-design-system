/**
 * GET /api/logo?url=...
 * Proxie une image de logo (Clearbit, Wikimedia, etc.) pour éviter blocages CORS/referrer.
 */

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://logo.clearbit.com',
  'https://upload.wikimedia.org',
  'https://commons.wikimedia.org',
];

const FETCH_TIMEOUT_MS = 12_000;

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url requis' }, { status: 400 });
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'url invalide' }, { status: 400 });
  }
  const origin = `${parsed.protocol}//${parsed.host}`;
  if (!ALLOWED_ORIGINS.some((o) => origin === o || origin.startsWith(o + '/'))) {
    return NextResponse.json({ error: 'origine non autorisée' }, { status: 403 });
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MediaBiangory/1.0)' },
      next: { revalidate: 86400 },
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }
    const contentType = res.headers.get('content-type') ?? '';
    const isSvg = contentType.includes('svg') || url.toLowerCase().includes('.svg');
    const finalContentType = isSvg ? 'image/svg+xml' : (contentType || 'image/png').split(';')[0]?.trim() || 'image/png';
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': finalContentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (e) {
    clearTimeout(timeoutId);
    const err = e instanceof Error ? e : new Error(String(e));
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: 'Timeout chargement logo' }, { status: 504 });
    }
    console.error('[API logo]', err);
    return NextResponse.json({ error: 'Erreur chargement logo' }, { status: 502 });
  }
}
