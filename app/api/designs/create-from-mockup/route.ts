/**
 * Crée un design à partir du résultat du questionnaire mockup (photo produit + réponses).
 * POST /api/designs/create-from-mockup
 * Body: { brandId, productImageUrl, prompt, questionnaire (MockupQuestionnaireAnswers) }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { brandId, productImageUrl, backImageUrl, prompt, questionnaire } = body;

    if (!brandId || !productImageUrl) {
      return NextResponse.json(
        { error: 'brandId et productImageUrl requis.' },
        { status: 400 }
      );
    }
    // Un seul document : devant + dos sur le même fichier (mockup unifié)
    const flatSketch = backImageUrl || productImageUrl;

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const design = await prisma.design.create({
      data: {
        brandId,
        type: questionnaire?.productType || 'T-shirt',
        cut: questionnaire?.cut || null,
        material: questionnaire?.material || null,
        productImageUrl,
        flatSketchUrl: flatSketch,
        mockupSpec: questionnaire || undefined,
        prompt: prompt || null,
        status: 'completed',
      },
    });

    return NextResponse.json({ design });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la création';
    console.error('[designs/create-from-mockup]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
