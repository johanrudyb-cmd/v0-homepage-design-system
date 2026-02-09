/**
 * Marques tendances - Top marques de la semaine
 * GET /api/trends/hybrid-radar/brands
 * Données curatées uniquement (pas de scraping).
 */

import { NextResponse } from 'next/server';
import { CURATED_TOP_BRANDS } from '@/lib/curated-brands';
import { getBrandKey } from '@/lib/brand-utils';

export const runtime = 'nodejs';

/** URLs des sites officiels (aucune plateforme). */
const BRAND_URLS: Record<string, string> = {
  "arc'teryx": 'https://arcteryx.com/fr/fr/',
  arcteryx: 'https://arcteryx.com/fr/fr/',
  'stone island': 'https://www.stoneisland.com/fr/',
  zara: 'https://www.zara.com/fr/',
  adidas: 'https://www.adidas.fr/',
  'massimo dutti': 'https://www.massimodutti.com/fr/',
  'carhartt wip': 'https://www.carhartt-wip.com/',
  'ami paris': 'https://amiparis.com/fr/',
  salomon: 'https://www.salomon.com/fr-fr/',
  'mango man': 'https://shop.mango.com/fr/',
  mango: 'https://shop.mango.com/fr/',
  "h&m edition": 'https://www2.hm.com/fr_fr/',
  "h&m": 'https://www2.hm.com/fr_fr/',
  hm: 'https://www2.hm.com/fr_fr/',
};

function getBrandWebsiteUrl(brandName: string): string {
  const key = getBrandKey(brandName);
  return BRAND_URLS[key] ?? '#';
}

function getDomainFromUrl(url: string): string {
  if (!url || url === '#') return '';
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export async function GET() {
  try {
    const brands = CURATED_TOP_BRANDS.map((curated) => {
      const websiteUrl = getBrandWebsiteUrl(curated.brand);
      return {
        name: curated.brand,
        rank: curated.rank,
        score: curated.score,
        signaturePiece: curated.signaturePiece,
        dominantStyle: curated.dominantStyle,
        websiteUrl,
        domain: getDomainFromUrl(websiteUrl),
      };
    });

    return NextResponse.json({ brands });
  } catch (e) {
    console.error('[Brands API]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur' },
      { status: 500 }
    );
  }
}
