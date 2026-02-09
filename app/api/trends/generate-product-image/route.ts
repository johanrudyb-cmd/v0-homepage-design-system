/**
 * Génère une image produit via GPT (prompt) + Ideogram (image), et la stocke pour réutilisation.
 * POST /api/trends/generate-product-image
 * Body: { productName, productType, cut?, material?, color?, style? }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { sanitizeErrorMessage } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { generateProductImagePrompt, isChatGptConfigured } from '@/lib/api/chatgpt';
import { generateDesignImage, isIdeogramConfigured } from '@/lib/api/ideogram';

export const runtime = 'nodejs';
export const maxDuration = 120;

function buildTrendKey(productType: string, cut?: string | null, material?: string | null): string {
  return `${productType}|${cut ?? ''}|${material ?? ''}`;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!isChatGptConfigured()) {
      return NextResponse.json(
        { error: 'Génération d\'image non configurée.' },
        { status: 503 }
      );
    }
    if (!isIdeogramConfigured()) {
      return NextResponse.json(
        { error: 'IDEogram_API_KEY non configurée. Ajoutez-la dans les variables d\'environnement (génération image).' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { productName, productType, cut, material, color, style } = body;

    if (!productName || !productType) {
      return NextResponse.json(
        { error: 'productName et productType requis' },
        { status: 400 }
      );
    }

    const trendKey = buildTrendKey(productType, cut, material);

    const existing = await prisma.generatedProductImage.findUnique({
      where: { trendKey },
    });

    if (existing) {
      return NextResponse.json({
        imageUrl: existing.imageUrl,
        promptText: existing.promptText,
        trendKey: existing.trendKey,
        reused: true,
      });
    }

    const promptText = await generateProductImagePrompt({
      productName,
      productType,
      cut: cut ?? null,
      material: material ?? null,
      color: color ?? null,
      style: style ?? null,
    });

    const imageUrl = await generateDesignImage(promptText, { aspect_ratio: '1:1', transparent: false });

    await prisma.generatedProductImage.upsert({
      where: { trendKey },
      create: { trendKey, promptText, imageUrl },
      update: { promptText, imageUrl },
    });

    return NextResponse.json({
      imageUrl,
      promptText,
      trendKey,
      reused: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération';
    console.error('[generate-product-image]', error);
    return NextResponse.json({ error: sanitizeErrorMessage(message) }, { status: 500 });
  }
}
