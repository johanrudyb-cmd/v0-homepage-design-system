/**
 * Génère une image de base du vêtement (T-shirt, Hoodie, etc.) sans design, pour servir de fond au placement des stickers.
 * La première fois on génère et on enregistre ; les designs suivants utilisent cette image.
 * POST /api/launch-map/design/generate-base-mockup
 * Body: { brandId, productType }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generateDesignImage, isIdeogramConfigured } from '@/lib/api/ideogram';
import { rateLimitByUser } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const PRODUCT_PROMPT: Record<string, string> = {
  tshirt: 'plain cotton t-shirt, no logo no print, neutral grey or white, worn shape',
  hoodie: 'plain cotton hoodie, no logo no print, neutral grey or black, worn shape',
  veste: 'plain jacket, no logo no print, neutral color, worn shape',
  pantalon: 'plain pants, no logo no print, neutral color',
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const rateLimitResult = await rateLimitByUser(user.id, 'launch-map:generate-base-mockup', {
      maxRequests: 3,
      windowMs: 60 * 1000,
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez dans une minute.' },
        { status: 429 }
      );
    }

    if (!isIdeogramConfigured()) {
      return NextResponse.json(
        { error: 'Génération d\'image non configurée (IDEogram_API_KEY).' },
        { status: 503 }
      );
    }

    const { brandId, productType } = await request.json();
    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }
    const pType = productType || 'tshirt';
    const productDesc = PRODUCT_PROMPT[pType] || PRODUCT_PROMPT.tshirt;

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const prompt = `3D render of a ${productDesc}, floating in empty void, no mannequin no body, dark gradient background, soft studio lighting, front view, square crop, photorealistic fabric`;

    const imageUrl = await generateDesignImage(prompt, { aspect_ratio: '1:1', transparent: false });

    const launchMap = await prisma.launchMap.findUnique({
      where: { brandId },
    });
    const existing = (launchMap?.baseMockupByProductType as Record<string, string> | null) || {};
    const updated = { ...existing, [pType]: imageUrl };

    await prisma.launchMap.upsert({
      where: { brandId },
      create: {
        brandId,
        baseMockupByProductType: updated,
      },
      update: {
        baseMockupByProductType: updated,
      },
    });

    return NextResponse.json({
      imageUrl,
      productType: pType,
      prompt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération du mockup';
    console.error('[launch-map/design/generate-base-mockup]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
