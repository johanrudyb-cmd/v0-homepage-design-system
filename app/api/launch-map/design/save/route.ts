/**
 * Enregistre un design créé depuis la phase Design (sticker → preview → tech pack).
 * Crée un Design completed puis marque la phase 3 du LaunchMap.
 * POST /api/launch-map/design/save
 * Body: { brandId, productType, designImageUrl (preview), stickerUrl?, placement?, mockupSpec? }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  tshirt: 'T-shirt',
  hoodie: 'Hoodie',
  veste: 'Veste',
  pantalon: 'Pantalon',
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { brandId, productType, designImageUrl, stickerUrl, placement, mockupSpec } = await request.json();

    if (!brandId || !designImageUrl) {
      return NextResponse.json(
        { error: 'brandId et designImageUrl requis' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const typeLabel = PRODUCT_TYPE_LABELS[productType || 'tshirt'] || productType || 'T-shirt';

    // designImageUrl = preview (produit + sticker) ; flatSketchUrl = sticker pour ref impression
    const design = await prisma.design.create({
      data: {
        brandId,
        type: typeLabel,
        cut: 'standard',
        material: null,
        flatSketchUrl: stickerUrl || designImageUrl,
        productImageUrl: designImageUrl,
        mockupSpec: mockupSpec ?? (placement || stickerUrl ? { productType: productType || 'tshirt', placement, stickerUrl } : undefined),
        techPack: placement ? { placement } : undefined,
        prompt: null,
        status: 'completed',
      },
    });

    await prisma.launchMap.upsert({
      where: { brandId },
      update: { phase3: true },
      create: {
        brandId,
        phase1: false,
        phase2: false,
        phase3: true,
        phase4: false,
        phase5: false,
      },
    });

    return NextResponse.json({ success: true, design });
  } catch (error: unknown) {
    console.error('[launch-map/design/save]', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
