/**
 * POST /api/launch-map/apply-strategy-and-reset
 * Calque une stratégie sur la marque de l'utilisateur et réinitialise toutes les étapes de Gérer ma marque.
 * Body: { brandId, templateBrandSlug, templateBrandName, strategyText, positioning?, targetAudience?, visualIdentity? }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generateSiteCreationTodo } from '@/lib/api/claude';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const brandId = typeof body.brandId === 'string' ? body.brandId.trim() : '';
    const templateBrandSlug = typeof body.templateBrandSlug === 'string' ? body.templateBrandSlug.trim() : '';
    const templateBrandName = typeof body.templateBrandName === 'string' ? body.templateBrandName.trim() : '';
    const strategyText = typeof body.strategyText === 'string' ? body.strategyText : '';
    const positioning = typeof body.positioning === 'string' ? body.positioning.trim() || null : null;
    const targetAudience = typeof body.targetAudience === 'string' ? body.targetAudience.trim() || null : null;
    const visualIdentity = body.visualIdentity && typeof body.visualIdentity === 'object' ? body.visualIdentity : null;

    if (!brandId || !templateBrandSlug || !templateBrandName || !strategyText) {
      return NextResponse.json(
        { error: 'brandId, templateBrandSlug, templateBrandName et strategyText requis' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: { launchMap: true },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const currentStyleGuide = (brand.styleGuide && typeof brand.styleGuide === 'object')
      ? (brand.styleGuide as Record<string, unknown>)
      : {};
    const styleGuide = {
      ...currentStyleGuide,
      ...(positioning != null && { positioning, preferredStyle: positioning }),
      ...(targetAudience != null && { targetAudience }),
    };

    await prisma.brand.update({
      where: { id: brandId },
      data: { templateBrandSlug, styleGuide },
    });

    await prisma.strategyGeneration.create({
      data: {
        brandId,
        templateBrandSlug,
        templateBrandName,
        strategyText,
        positioning,
        targetAudience,
        visualIdentity: visualIdentity ?? undefined,
      },
    });

    let siteCreationTodo: { steps: { id: string; label: string; done?: boolean }[] } | null = null;
    try {
      const steps = await generateSiteCreationTodo(brand.name, strategyText);
      siteCreationTodo = { steps };
    } catch (e) {
      console.warn('[apply-strategy-and-reset] generateSiteCreationTodo failed', e);
    }

    await prisma.launchMap.upsert({
      where: { brandId },
      update: {
        phase1: true,
        phase2: false,
        phase3: false,
        phase4: false,
        phase5: false,
        phase6: false,
        phase1Data: null,
        phaseSummaries: null,
        contentCalendar: null,
        recommendationsCache: null,
        recommendationsCachedAt: null,
        baseMockupByProductType: null,
        siteCreationTodo: siteCreationTodo ?? undefined,
      },
      create: {
        brandId,
        phase1: true,
        phase2: false,
        phase3: false,
        phase4: false,
        phase5: false,
        phase6: false,
        siteCreationTodo: siteCreationTodo ?? undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[apply-strategy-and-reset]', e);
    return NextResponse.json(
      { error: 'Erreur lors du calquage de la stratégie' },
      { status: 500 }
    );
  }
}
