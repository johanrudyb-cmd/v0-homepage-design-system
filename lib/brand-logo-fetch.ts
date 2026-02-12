/**
 * Récupère l'URL du logo d'une marque.
 * 1. Curated (BRAND_LOGOS, REFERENCE_BRAND_WEBSITES)
 * 2. Brandfetch Search API (si BRANDFETCH_CLIENT_ID)
 * 3. Heuristique domaine + favicon Google
 */

import { getBrandLogoUrl } from '@/lib/curated-brands';

function slugToDomain(slug: string): string {
  // "our-legacy" -> "ourlegacy.com", "ami-paris" -> "amiparis.com"
  const clean = slug
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-/g, '');
  return `${clean}.com`;
}

/**
 * Tente de récupérer le logo via Brandfetch Search API.
 * GET https://api.brandfetch.io/v2/search/{name}?c={clientId}
 */
async function fetchLogoFromBrandfetch(brandName: string): Promise<string | null> {
  const clientId = process.env.BRANDFETCH_CLIENT_ID?.trim();
  if (!clientId) return null;

  try {
    const url = `https://api.brandfetch.io/v2/search/${encodeURIComponent(brandName)}?c=${encodeURIComponent(clientId)}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const items = Array.isArray(data) ? data : [];
    const first = items[0];
    if (first?.icon && typeof first.icon === 'string') {
      return first.icon;
    }
    // Si on a un domain, on peut utiliser le favicon Google
    if (first?.domain && typeof first.domain === 'string') {
      try {
        const host = new URL(first.domain.startsWith('http') ? first.domain : `https://${first.domain}`).hostname.replace(/^www\./, '');
        return `https://cdn.brandfetch.io/${host}/w/400/h/400/logo`;
      } catch {
        return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
* Heuristique : domaine probable à partir du nom + Brandfetch CDN.
*/
function fetchLogoFromDomainHeuristic(brandName: string): string | null {
  const slug = brandName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]/g, '');
  if (slug.length < 2) return null;
  const domain = slugToDomain(slug);
  return `https://cdn.brandfetch.io/${domain}/w/400/h/400/logo`;
}

/**
 * Récupère l'URL du logo pour une marque.
 * Utilise getBrandLogoUrl (curated) en premier, puis Brandfetch, puis heuristique domaine.
 */
export async function fetchLogoForBrand(brandName: string): Promise<string | null> {
  const trimmed = brandName?.trim();
  if (!trimmed || trimmed.length < 2) return null;

  // 1. Curated (Wikimedia, REFERENCE_BRAND_WEBSITES)
  const curated = getBrandLogoUrl(trimmed);
  if (curated) return curated;

  // 2. Brandfetch Search API
  const fromBrandfetch = await fetchLogoFromBrandfetch(trimmed);
  if (fromBrandfetch) return fromBrandfetch;

  // 3. Heuristique domaine
  return fetchLogoFromDomainHeuristic(trimmed);
}
