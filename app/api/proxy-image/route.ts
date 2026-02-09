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
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MediaBiangory/1.0)',
        Accept: 'image/*',
      },
      cache: 'force-cache',
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (e) {
    console.error('[proxy-image]', e);
    return new NextResponse(null, { status: 502 });
  }
}
