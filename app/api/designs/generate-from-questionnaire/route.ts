/**
 * Génère une photo produit à partir des réponses au questionnaire mockup.
 * POST /api/designs/generate-from-questionnaire
 * Body: { brandId, questionnaire: MockupQuestionnaireAnswers }
 * @see docs/spec-mockup-questionnaire-et-techpack-visuel.md
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generateDesignImage, isIdeogramConfigured } from '@/lib/api/ideogram';
import { enhancePrompt, isChatGptConfigured } from '@/lib/api/chatgpt';
import { rateLimitByUser } from '@/lib/rate-limit';
import {
  buildProductPhotoPrompt,
  type MockupQuestionnaireAnswers,
} from '@/lib/mockup-and-techpack-types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const rateLimitResult = await rateLimitByUser(user.id, 'designs:generate-from-questionnaire', {
      maxRequests: 5,
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

    const body = await request.json();
    const { brandId, questionnaire, refinePromptWithAI, modificationRequest } = body as {
      brandId: string;
      questionnaire: MockupQuestionnaireAnswers;
      refinePromptWithAI?: boolean;
      modificationRequest?: string;
    };

    if (!brandId || !questionnaire?.productType || !questionnaire?.material || !questionnaire?.colorMain) {
      return NextResponse.json(
        { error: 'brandId et questionnaire (productType, material, colorMain) requis.' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    let prompt = buildProductPhotoPrompt(questionnaire);
    if (modificationRequest && typeof modificationRequest === 'string' && modificationRequest.trim()) {
      prompt += ` IMPORTANT - User requested modifications: ${modificationRequest.trim()}`;
    }
    if (refinePromptWithAI && isChatGptConfigured()) {
      try {
        prompt = await enhancePrompt(prompt, {
          type: questionnaire.productType,
          style: questionnaire.photoStyle || 'ecommerce',
        });
      } catch (e) {
        console.warn('[generate-from-questionnaire] enhancePrompt failed, using raw prompt', e);
      }
    }
    const imageUrl = await generateDesignImage(prompt, { aspect_ratio: '1:1', transparent: false });

    return NextResponse.json({
      imageUrl,
      prompt,
      questionnaire,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération';
    console.error('[designs/generate-from-questionnaire]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
