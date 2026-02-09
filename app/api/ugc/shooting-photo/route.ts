import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { sanitizeErrorMessage } from '@/lib/utils';
import { generateShootingPhoto, isHiggsfieldConfigured } from '@/lib/api/higgsfield';
import { prisma } from '@/lib/prisma';
import { NotificationHelpers } from '@/lib/notifications';
import { withAIUsageLimit } from '@/lib/ai-usage';

export const runtime = 'nodejs';

/** Convertit une URL relative en URL absolue (Higgsfield doit pouvoir récupérer l'image depuis ses serveurs). */
function toAbsoluteImageUrl(url: string, request: Request): string {
  const u = url.trim();
  if (!u) return u;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (!u.startsWith('/')) return u;
  const baseUrl = process.env.NEXTAUTH_URL
    ? process.env.NEXTAUTH_URL.replace(/\/$/, '')
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`.replace(/\/$/, '')
      : null;
  if (baseUrl) return `${baseUrl}${u}`;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}${u}`;
}

/** POST : génère une photo de shooting (mannequin + vêtement) */
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
    const mannequinId = typeof body.mannequinId === 'string' ? body.mannequinId : null;
    const designUrl = typeof body.designUrl === 'string' ? body.designUrl : null;
    const garmentType = typeof body.garmentType === 'string' ? body.garmentType : 'T-shirt';
    const garmentLabel = typeof body.garmentLabel === 'string' && body.garmentLabel.trim() ? body.garmentLabel.trim() : undefined;
    const aspectRatio = typeof body.aspectRatio === 'string' && ['1:1', '3:4', '4:5', '9:16', '16:9'].includes(body.aspectRatio) ? body.aspectRatio : '3:4';
    const scenePrompt = typeof body.scenePrompt === 'string' && body.scenePrompt.trim() ? body.scenePrompt.trim() : 'professional fashion photo, realistic';
    const mannequinInstruction = typeof body.mannequinInstruction === 'string' && body.mannequinInstruction.trim() ? body.mannequinInstruction.trim() : undefined;
    const mannequinPoseOptional = typeof body.mannequinPoseOptional === 'string' && body.mannequinPoseOptional.trim() ? body.mannequinPoseOptional.trim() : undefined;
    const sceneOptions = body.sceneOptions && typeof body.sceneOptions === 'object' && !Array.isArray(body.sceneOptions) ? body.sceneOptions : undefined;

    if (!brandId || !mannequinId || !designUrl) {
      return NextResponse.json(
        { error: 'brandId, mannequinId et designUrl requis' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });

    const mannequin = await prisma.mannequin.findFirst({
      where: { id: mannequinId, brandId },
    });
    if (!mannequin) return NextResponse.json({ error: 'Mannequin non trouvé' }, { status: 404 });

    const mannequinImageUrl = toAbsoluteImageUrl(mannequin.imageUrl, request);
    const designImageUrl = toAbsoluteImageUrl(designUrl, request);

    const imageUrl = await withAIUsageLimit(
      user.id,
      user.plan ?? 'free',
      'ugc_shooting_photo',
      () =>
        generateShootingPhoto(mannequinImageUrl, {
          designUrl: designImageUrl,
          garmentType,
          garmentLabel,
          aspectRatio,
          scenePrompt,
          mannequinInstruction,
          mannequinPoseOptional,
          sceneOptions,
        }),
      { brandId }
    );

    await prisma.uGCContent.create({
      data: {
        brandId,
        type: 'shooting_photo',
        content: imageUrl,
      },
    });

    await NotificationHelpers.ugcGenerated(user.id, 'shooting_photo', brandId);

    return NextResponse.json({ imageUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération';
    console.error('POST /api/ugc/shooting-photo', error);
    const isQuota = typeof message === 'string' && (message.includes('limité') || message.includes('Quota') || message.includes('épuisé'));
    return NextResponse.json({ error: sanitizeErrorMessage(message) }, { status: isQuota ? 403 : 500 });
  }
}
