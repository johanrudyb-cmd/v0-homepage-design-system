/**
 * Génère une image produit via GPT (prompt) + Higgsfield (image), et la stocke pour réutilisation.
 * POST /api/trends/generate-product-image
 * Body: { productName, productType, cut?, material?, color?, style? }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generateProductImagePrompt, isChatGptConfigured } from '@/lib/api/chatgpt';
import { generateProductImage, isHiggsfieldConfigured } from '@/lib/api/higgsfield';

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
        { error: 'CHATGPT_API_KEY non configurée. Ajoutez-la dans les variables d\'environnement (texte du prompt).' },
        { status: 503 }
      );
    }
    if (!isHiggsfieldConfigured()) {
      return NextResponse.json(
        { error: 'HIGGSFIELD_API_KEY non configurée. Ajoutez-la dans les variables d\'environnement (génération image).' },
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

    const imageUrl = await generateProductImage(promptText, { aspect_ratio: '1:1' });

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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
