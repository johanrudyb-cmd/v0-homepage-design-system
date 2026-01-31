/**
 * Trend Radar Hybride - Upload photo → détection tendance par zone
 * POST /api/trends/check-trend-image
 * Body: FormData avec "image" (fichier) ou "imageUrl" (URL)
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { analyzeProductImage, isChatGptConfigured } from '@/lib/api/chatgpt';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!isChatGptConfigured()) {
      return NextResponse.json(
        { error: 'CHATGPT_API_KEY requise pour l’analyse visuelle (GPT-4o).' },
        { status: 503 }
      );
    }

    let imageUrl: string;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('image') as File | null;
      if (!file) {
        return NextResponse.json(
          { error: 'Fichier "image" requis dans le FormData.' },
          { status: 400 }
        );
      }
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mime = file.type || 'image/jpeg';
      imageUrl = `data:${mime};base64,${base64}`;
    } else {
      const body = await request.json().catch(() => ({}));
      imageUrl = body.imageUrl || body.url;
      if (!imageUrl || typeof imageUrl !== 'string') {
        return NextResponse.json(
          { error: 'Body doit contenir "imageUrl" (URL) ou envoyer FormData avec "image".' },
          { status: 400 }
        );
      }
    }

    const analysis = await analyzeProductImage(imageUrl, 'Produit uploadé');

    const orConditions: { productSignature?: string; cut?: string }[] = [];
    if (analysis.productSignature) orConditions.push({ productSignature: analysis.productSignature });
    if (analysis.cut) orConditions.push({ cut: analysis.cut });

    const matches = await prisma.trendProduct.findMany({
      where: {
        marketZone: { not: null },
        ...(orConditions.length ? { OR: orConditions } : {}),
      },
      select: { marketZone: true, name: true, trendScoreVisual: true, isGlobalTrendAlert: true },
      take: 20,
    });

    const byZone = new Map<string | null, { name: string; score: number; isGlobal: boolean }[]>();
    for (const m of matches) {
      if (!m.marketZone) continue;
      if (!byZone.has(m.marketZone)) byZone.set(m.marketZone, []);
      byZone.get(m.marketZone)!.push({
        name: m.name,
        score: m.trendScoreVisual ?? 0,
        isGlobal: m.isGlobalTrendAlert ?? false,
      });
    }

    const zones = Array.from(byZone.keys()).filter(Boolean) as string[];

    return NextResponse.json({
      analysis: {
        cut: analysis.cut,
        attributes: analysis.attributes,
        trendScoreVisual: analysis.trendScoreVisual,
        productSignature: analysis.productSignature,
      },
      matchInZones: zones,
      byZone: Object.fromEntries(byZone),
      message:
        zones.length > 0
          ? `Tendance actuelle détectée en : ${zones.join(', ')}.`
          : 'Aucune tendance similaire trouvée en EU, US ou ASIA pour le moment.',
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur lors de l’analyse';
    console.error('[Check Trend Image]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
