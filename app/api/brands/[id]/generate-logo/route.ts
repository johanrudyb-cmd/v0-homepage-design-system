/**
 * Génère 4 propositions de logo par IA. On retire nous-mêmes l'arrière-plan et on duplique en version fond transparent.
 * POST /api/brands/[id]/generate-logo
 * Body: { logoRecommendation?: string }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { sanitizeErrorMessage } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { generateDesignImage, isIdeogramConfigured } from '@/lib/api/ideogram';
import { rateLimitByUser } from '@/lib/rate-limit';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { makeWhiteBackgroundTransparent } from '@/lib/image-remove-background';
import { withAIUsageLimit } from '@/lib/ai-usage';

export const runtime = 'nodejs';
export const maxDuration = 300;

const PROPOSAL_STYLES = [
  'minimalist geometric shape, clean lines',
  'bold typography only, wordmark style',
  'icon or symbol combined with text, balanced',
  'abstract shape or emblem, distinctive',
];

async function downloadBuffer(imageUrl: string): Promise<Buffer> {
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) throw new Error('Impossible de récupérer l\'image générée');
  return Buffer.from(await imageRes.arrayBuffer());
}

async function saveLogoAndTransparent(
  imageBuffer: Buffer,
  brandId: string,
  index: number
): Promise<{ url: string; urlTransparent: string }> {
  const uploadsDir = join(process.cwd(), 'public', 'uploads', brandId);
  if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });
  const ts = Date.now();
  const id = Math.random().toString(36).slice(2, 8);

  const mainFilename = `logo-${index + 1}-${ts}-${id}.png`;
  const mainPath = join(uploadsDir, mainFilename);
  await writeFile(mainPath, imageBuffer);
  const url = `/uploads/${brandId}/${mainFilename}`;

  const transparentBuffer = await makeWhiteBackgroundTransparent(imageBuffer);
  const transparentFilename = `logo-${index + 1}-${ts}-${id}-transparent.png`;
  const transparentPath = join(uploadsDir, transparentFilename);
  await writeFile(transparentPath, transparentBuffer);
  const urlTransparent = `/uploads/${brandId}/${transparentFilename}`;

  return { url, urlTransparent };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const rateLimitResult = await rateLimitByUser(user.id, 'brands:generate-logo', {
      maxRequests: 1,
      windowMs: 5 * 60 * 1000,
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Réessayez dans quelques minutes (génération de 4 logos en cours).' },
        { status: 429 }
      );
    }

    if (!isIdeogramConfigured()) {
      return NextResponse.json(
        { error: 'Génération d\'image non configurée (IDEogram_API_KEY).' },
        { status: 503 }
      );
    }

    const { id: brandId } = await params;
    const body = await request.json().catch(() => ({}));
    const logoRecommendation = typeof body.logoRecommendation === 'string' ? body.logoRecommendation.trim() : null;

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    let recommendationText = logoRecommendation;
    if (!recommendationText) {
      const latestStrategy = await prisma.strategyGeneration.findFirst({
        where: { brandId },
        orderBy: { createdAt: 'desc' },
      });
      const vi = latestStrategy?.visualIdentity && typeof latestStrategy.visualIdentity === 'object'
        ? (latestStrategy.visualIdentity as { logoRecommendation?: string })
        : null;
      recommendationText = vi?.logoRecommendation ?? null;
    }

    const brandName = brand.name || 'Brand';
    const styleGuide = brand.styleGuide && typeof brand.styleGuide === 'object' ? (brand.styleGuide as Record<string, unknown>) : null;
    const positioning = (styleGuide?.preferredStyle || styleGuide?.positioning || '') as string;

    // Get inspiration brand from latest strategy
    const latestStrategy = await prisma.strategyGeneration.findFirst({
      where: { brandId },
      orderBy: { createdAt: 'desc' },
    });
    const templateBrandName = latestStrategy?.templateBrandName;

    // Use technical style keywords based on the inspiration brand
    const { getTechnicalStyleKeywords } = await import('@/lib/brand-style-keywords');
    const technicalStyle = getTechnicalStyleKeywords(templateBrandName || positioning || undefined);

    const baseContext = `Fashion brand "${brandName}". Style: ${technicalStyle}. ${positioning ? `Context: ${positioning}.` : ''} ${recommendationText ? `Creative direction: ${recommendationText}` : ''}`;

    const proposals: { url: string; urlTransparent: string }[] = [];

    // Vérifier le quota avant de générer
    await withAIUsageLimit(
      user.id,
      user.plan,
      'brand_logo',
      async () => {
        // Génération des logos dans le callback
        for (let i = 0; i < 4; i++) {
          const styleHint = PROPOSAL_STYLES[i];
          const prompt = `Logo design, ${styleHint}. ${baseContext} Square 1:1, high contrast, vector-style, professional. White or light grey background.`;

          const imageUrl = await generateDesignImage(prompt, { aspect_ratio: '1:1', transparent: true });
          if (!imageUrl || typeof imageUrl !== 'string') throw new Error('Aucune image générée');

          const imageBuffer = await downloadBuffer(imageUrl);
          const { url, urlTransparent } = await saveLogoAndTransparent(imageBuffer, brandId, i);
          proposals.push({ url, urlTransparent });
        }
      },
      { brandId }
    );

    const updatedStyleGuide = styleGuide ? { ...styleGuide, noLogo: false } : { noLogo: false };
    await prisma.brand.update({
      where: { id: brandId },
      data: {
        logo: proposals[0].url,
        logoVariations: {
          main: proposals[0].url,
          proposals: proposals,
        },
        styleGuide: updatedStyleGuide,
      },
    });

    return NextResponse.json({ proposals, logo: proposals[0].url, success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération du logo';
    console.error('[brands/generate-logo]', error);
    return NextResponse.json({ error: sanitizeErrorMessage(message) }, { status: 500 });
  }
}
