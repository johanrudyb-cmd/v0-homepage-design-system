/**
 * POST /api/brands/parse-website
 * Body: { url: string }
 * Fetch la page, extrait meta + texte, et utilise l'IA pour récupérer les données de marque (nom, logo, etc.).
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { parseWebsiteBrandInfo, isClaudeConfigured } from '@/lib/api/claude';

export const runtime = 'nodejs';

const MAX_HTML_SIZE = 100_000;
const FETCH_TIMEOUT_MS = 15_000;

function extractMetaAndText(html: string, baseUrl: string): string {
  const lines: string[] = [];
  // Meta tags
  const metaRegex = /<meta[^>]+(?:property|name)=["'](?:og:|twitter:)?(?:title|image|description|site_name)[^"']*["'][^>]+content=["']([^"']+)["']|content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:|twitter:)?(?:title|image|description|site_name)[^"']*["']/gi;
  let m: RegExpExecArray | null;
  while ((m = metaRegex.exec(html)) !== null) {
    const val = (m[1] || m[2] || '').trim();
    if (val) lines.push(`[meta] ${val}`);
  }
  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) lines.push(`[title] ${titleMatch[1].trim()}`);
  // Logo / image links (common patterns)
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
  while ((m = imgRegex.exec(html)) !== null) {
    let src = m[1].trim();
    const alt = (m[2] || '').trim();
    if (src.startsWith('//')) src = `https:${src}`;
    else if (src.startsWith('/')) {
      try {
        const u = new URL(baseUrl);
        src = `${u.origin}${src}`;
      } catch {
        // ignore
      }
    }
    if (alt.toLowerCase().includes('logo') || src.toLowerCase().includes('logo')) {
      lines.push(`[logo img] ${src} ${alt ? `alt=${alt}` : ''}`);
    }
  }
  // Body text: remove script/style, get first chunk
  let body = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  body = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000);
  if (body) lines.push(`[body] ${body}`);
  return lines.join('\n');
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!isClaudeConfigured()) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY requise pour analyser le site.' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawUrl = typeof body.url === 'string' ? body.url.trim() : '';
    if (!rawUrl) {
      return NextResponse.json(
        { error: 'L’URL du site est requise.' },
        { status: 400 }
      );
    }

    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      return NextResponse.json(
        { error: 'URL invalide.' },
        { status: 400 }
      );
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      return NextResponse.json(
        { error: 'Seules les URL http(s) sont acceptées.' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrandBot/1.0; +https://outfity.fr)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Le site a répondu avec le statut ${response.status}. Vérifiez l’URL.` },
        { status: 422 }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return NextResponse.json(
        { error: 'La page ne semble pas être du HTML (site ou URL incorrecte).' },
        { status: 422 }
      );
    }

    const html = await response.text();
    if (html.length > MAX_HTML_SIZE) {
      return NextResponse.json(
        { error: 'La page est trop volumineuse pour être analysée.' },
        { status: 422 }
      );
    }

    const snippet = extractMetaAndText(html, url.toString());
    const parsed = await parseWebsiteBrandInfo(snippet, url.toString());

    // Normaliser logoUrl en URL absolue si besoin
    if (parsed.logoUrl && parsed.logoUrl.startsWith('/')) {
      try {
        parsed.logoUrl = `${url.origin}${parsed.logoUrl}`;
      } catch {
        // leave as is
      }
    }

    return NextResponse.json({ parsed });
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      return NextResponse.json(
        { error: 'Délai dépassé. Le site met trop de temps à répondre.' },
        { status: 408 }
      );
    }
    const message = e instanceof Error ? e.message : 'Erreur lors de l’analyse du site';
    console.error('[parse-website]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
