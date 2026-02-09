/**
 * Génère une description produit e-commerce à partir de la marque, stratégie (phase 1) et identité,
 * puis la sauvegarde sur le design. À appeler après validation du tech pack.
 * POST /api/designs/[id]/generate-product-description
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { sanitizeErrorMessage } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import {
  generateProductDescriptionFromBrand,
  isChatGptConfigured,
  type ProductDescriptionContext,
} from '@/lib/api/chatgpt';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!isChatGptConfigured()) {
      return NextResponse.json(
        { error: 'Génération non configurée.' },
        { status: 503 }
      );
    }

    const { id } = await params;
    const design = await prisma.design.findFirst({
      where: {
        id,
        brand: { userId: user.id },
      },
      include: {
        brand: {
          include: { launchMap: true },
        },
      },
    });

    if (!design || !design.brand) {
      return NextResponse.json({ error: 'Design non trouvé' }, { status: 404 });
    }

    const brand = design.brand as { name: string; styleGuide?: unknown; launchMap?: { phase1Data?: unknown; phaseSummaries?: unknown } | null };
    const lm = brand.launchMap;
    const phase1Data = lm?.phase1Data && typeof lm.phase1Data === 'object' ? (lm.phase1Data as Record<string, unknown>) : null;
    const phaseSummaries = lm?.phaseSummaries && typeof lm.phaseSummaries === 'object' ? (lm.phaseSummaries as Record<string, string>) : null;
    const styleGuide = brand.styleGuide && typeof brand.styleGuide === 'object' ? (brand.styleGuide as Record<string, unknown>) : null;

    const techPack = design.techPack as Record<string, unknown> | null;
    const techPackSummary =
      techPack?.materials && Array.isArray(techPack.materials)
        ? `Matières : ${(techPack.materials as { name: string }[]).map((m) => m.name).join(', ')}`
        : techPack?.constructionNotes
          ? String(techPack.constructionNotes).slice(0, 200)
          : null;

    const context: ProductDescriptionContext = {
      brandName: brand.name || 'Ma marque',
      styleGuide: styleGuide
        ? {
            preferredStyle: styleGuide.preferredStyle as string | undefined,
            positioning: styleGuide.positioning as string | undefined,
            targetAudience: styleGuide.targetAudience as string | undefined,
            productType: styleGuide.productType as string | undefined,
            tagline: styleGuide.tagline as string | undefined,
            description: styleGuide.description as string | undefined,
            story: styleGuide.story as string | undefined,
          }
        : null,
      phase1Data: phase1Data
        ? {
            productType: phase1Data.productType as string | undefined,
            weight: phase1Data.weight as string | undefined,
          }
        : null,
      phaseSummaries: phaseSummaries ?? null,
      designType: design.type,
      designCut: design.cut ?? null,
      designMaterial: design.material ?? null,
      techPackSummary: techPackSummary ?? null,
    };

    const productDescription = await generateProductDescriptionFromBrand(context);

    await prisma.design.update({
      where: { id },
      data: { productDescription },
    });

    return NextResponse.json({ productDescription });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération';
    console.error('[designs/generate-product-description]', error);
    return NextResponse.json({ error: sanitizeErrorMessage(message) }, { status: 500 });
  }
}
