/**
 * POST /api/launch-map/strategy
 * Valide la phase 1 "Stratégie marketing" : enregistre templateBrandSlug sur la marque et marque phase1 complétée.
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const brandId = body.brandId;
    const templateBrandSlug = typeof body.templateBrandSlug === 'string' ? body.templateBrandSlug.trim() || null : null;
    const positioning = typeof body.positioning === 'string' ? body.positioning.trim() || undefined : undefined;
    const targetAudience = typeof body.targetAudience === 'string' ? body.targetAudience.trim() || undefined : undefined;

    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: { launchMap: true },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const hasStrategyFields = positioning !== undefined || targetAudience !== undefined;
    const currentStyleGuide = (brand.styleGuide && typeof brand.styleGuide === 'object')
      ? (brand.styleGuide as Record<string, unknown>)
      : {};
    const styleGuide = hasStrategyFields
      ? {
          ...currentStyleGuide,
          ...(positioning !== undefined && { positioning, preferredStyle: positioning }),
          ...(targetAudience !== undefined && { targetAudience }),
        }
      : undefined;

    await prisma.brand.update({
      where: { id: brandId },
      data: {
        templateBrandSlug,
        ...(styleGuide !== undefined && { styleGuide }),
      },
    });

    const launchMap = await prisma.launchMap.upsert({
      where: { brandId },
      update: { phase1: true },
      create: {
        brandId,
        phase1: true,
        phase2: false,
        phase3: false,
        phase4: false,
        phase5: false,
      },
    });

    return NextResponse.json({ success: true, launchMap });
  } catch (e) {
    console.error('[Launch Map Strategy]', e);
    return NextResponse.json(
      { error: 'Erreur lors de la validation' },
      { status: 500 }
    );
  }
}
