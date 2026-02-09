import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { sanitizeErrorMessage } from '@/lib/utils';
import { generateProductImage, isHiggsfieldConfigured } from '@/lib/api/higgsfield';
import { prisma } from '@/lib/prisma';
import { NotificationHelpers } from '@/lib/notifications';
import { withAIUsageLimit } from '@/lib/ai-usage';

export const runtime = 'nodejs';
export const maxDuration = 120;

const PRODUCT_ANGLES = [
  { key: 'front', label: 'Face', promptPart: 'front view, facing camera' },
  { key: 'back', label: 'Dos', promptPart: 'back view, back of garment' },
  { key: 'left', label: 'Profil gauche', promptPart: 'left side view, three quarter left' },
  { key: 'right', label: 'Profil droit', promptPart: 'right side view, three quarter right' },
] as const;

const BACKGROUND_PROMPTS: Record<string, string> = {
  white: 'white background',
  grey: 'neutral grey background',
  black: 'black background',
  minimal: 'minimal shadow, clean background',
};

/** POST : génère 4 photos produit (face, dos, profil gauche, profil droit). */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    if (!isHiggsfieldConfigured()) {
      return NextResponse.json(
        { error: 'Génération IA non configurée. Configurez la clé API pour les shootings.' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const brandId = typeof body.brandId === 'string' ? body.brandId : null;
    const designUrl = typeof body.designUrl === 'string' ? body.designUrl : null;
    const garmentType = typeof body.garmentType === 'string' ? body.garmentType : 'T-shirt';
    const background = typeof body.background === 'string' ? body.background : 'white';

    if (!brandId || !designUrl) {
      return NextResponse.json(
        { error: 'brandId et designUrl requis' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });

    const bgPrompt = BACKGROUND_PROMPTS[background] ?? BACKGROUND_PROMPTS.white;
    const imageUrls = await withAIUsageLimit(
      user.id,
      user.plan ?? 'free',
      'ugc_shooting_product',
      async () => {
        const urls: string[] = [];
        for (const angle of PRODUCT_ANGLES) {
          const prompt = `Professional product photography, ${garmentType}, ${angle.promptPart}, ${bgPrompt}, clean, high quality, 8k, e-commerce style`;
          const url = await generateProductImage(prompt, { aspect_ratio: '1:1' });
          urls.push(url);
        }
        return urls;
      },
      { brandId }
    );

    for (const imageUrl of imageUrls) {
      await prisma.uGCContent.create({
        data: {
          brandId,
          type: 'shooting_photo',
          content: imageUrl,
        },
      });
    }

    await NotificationHelpers.ugcGenerated(user.id, 'shooting_photo', brandId);

    return NextResponse.json({ imageUrls });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération';
    console.error('POST /api/ugc/shooting-product', error);
    const isQuota = typeof message === 'string' && (message.includes('limité') || message.includes('Quota') || message.includes('épuisé'));
    return NextResponse.json({ error: sanitizeErrorMessage(message) }, { status: isQuota ? 403 : 500 });
  }
}
