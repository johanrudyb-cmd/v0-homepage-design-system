/**
 * Proxy pour afficher des images externes (ex. tendances Zalando/ASOS) sans blocage referrer/CORS.
 * GET /api/proxy-image?url=https://...
 */

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = ['https://', 'http://'];

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url || !isAllowedUrl(url)) {
    return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
  }

  try {
    const targetUrl = new URL(url);
    const origin = targetUrl.origin;

    // Logique de Referer intelligent
    let referer = origin + '/';
    if (url.includes('asos')) {
      referer = 'https://www.asos.com/';
    } else if (url.includes('zalando')) {
      referer = origin + '/';
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': referer,
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      cache: 'force-cache',
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn(`[proxy-image] Échec fetch: ${res.status} pour ${url}`);
      // Tentative sans Referer si échec
      if (referer) {
        return fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
      }
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    console.error('[proxy-image] Erreur critique:', e);
    return new NextResponse(null, { status: 502 });
  }
}
