/**
 * Génère un sticker / design d'impression par IA à partir de la marque et de la stratégie.
 * POST /api/launch-map/design/generate-sticker
 * Body: { brandId, productType? } — productType (tshirt, hoodie, etc.) adapte le prompt d'impression
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { rateLimitByUser } from '@/lib/rate-limit';
import { isIdeogramConfigured } from '@/lib/api/ideogram';
import {
  generateGarmentDesign,
  isGenerateGarmentDesignResultMultiple,
  type GenerateGarmentDesignInput,
} from '@/lib/garment-design';

export const runtime = 'nodejs';
export const maxDuration = 180;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const rateLimitResult = await rateLimitByUser(user.id, 'launch-map:generate-sticker', {
      maxRequests: 10,
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
        { error: 'Génération d\'image non configurée (IDEogram_API_KEY manquante).' },
        { status: 503 }
      );
    }

    const {
      brandId,
      productType,
      userDescription,
      logoUrl,
      placement,
      source,
      textByPlacement: textByPlacementRaw,
      garmentColor: garmentColorRaw,
      designStyleKeywords: designStyleKeywordsRaw,
      designAvoid: designAvoidRaw,
      inspiration: inspirationRaw,
    } = await request.json();
    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }
    const designStyleKeywords = typeof designStyleKeywordsRaw === 'string' && designStyleKeywordsRaw.trim() ? designStyleKeywordsRaw.trim() : null;
    const designAvoid = typeof designAvoidRaw === 'string' && designAvoidRaw.trim() ? designAvoidRaw.trim() : null;
    const designInspiration = typeof inspirationRaw === 'string' && inspirationRaw.trim() ? inspirationRaw.trim() : null;
    const garmentColorHex = typeof garmentColorRaw === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(garmentColorRaw.trim()) ? garmentColorRaw.trim() : null;
    const productTypeKeys = ['tshirt', 'hoodie', 'veste', 'pantalon'] as const;
    const productTypeKey = productTypeKeys.includes(productType as (typeof productTypeKeys)[number]) ? (productType as (typeof productTypeKeys)[number]) : 'tshirt';
    const productLabel = { tshirt: 't-shirt', hoodie: 'hoodie', veste: 'veste', pantalon: 'pantalon' }[productTypeKey] ?? 't-shirt';
    const useLogoFrame = !!logoUrl && typeof logoUrl === 'string' && logoUrl.trim().length > 0;

    const placementRaw = placement;
    const placementList: string[] = Array.isArray(placementRaw)
      ? placementRaw.filter((p): p is string => typeof p === 'string' && p.trim().length > 0).map((p) => p.trim())
      : typeof placementRaw === 'string' && placementRaw.trim()
        ? [placementRaw.trim()]
        : [];
    const placementLabel = placementList.length > 0 ? placementList.join(', ') : null;

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const latestStrategy = await prisma.strategyGeneration.findFirst({
      where: { brandId },
      orderBy: { createdAt: 'desc' },
    });

    const brandName = (brand.name || 'Brand').trim();
    const positioning = latestStrategy?.positioning || '';
    const targetAudience = latestStrategy?.targetAudience || '';
    const styleGuide = brand.styleGuide && typeof brand.styleGuide === 'object' ? (brand.styleGuide as Record<string, unknown>) : null;
    const preferredStyleRaw = styleGuide?.preferredStyle ?? styleGuide?.positioning ?? positioning ?? 'streetwear';
    const preferredStyle = typeof preferredStyleRaw === 'string' && preferredStyleRaw.trim() ? preferredStyleRaw.trim() : 'streetwear';
    const vi = (latestStrategy?.visualIdentity && typeof latestStrategy.visualIdentity === 'object' ? latestStrategy.visualIdentity : null) as { colorPalette?: { primary?: string; secondary?: string; accent?: string }; typography?: { heading?: string; body?: string } } | null;
    const brandPalette = (brand.colorPalette && typeof brand.colorPalette === 'object' ? brand.colorPalette : null) as { primary?: string; secondary?: string; accent?: string } | null;
    const brandTypography = (brand.typography && typeof brand.typography === 'object' ? brand.typography : null) as { heading?: string; body?: string } | null;
    const palette = brandPalette ?? vi?.colorPalette ?? null;
    const typography = brandTypography ?? vi?.typography ?? null;

    const textByPlacementResolved: Record<string, string> = {};
    const textByPlacementClean =
      textByPlacementRaw && typeof textByPlacementRaw === 'object' && !Array.isArray(textByPlacementRaw)
        ? Object.fromEntries(
            Object.entries(textByPlacementRaw).filter(
              (e): e is [string, string] => typeof e[0] === 'string' && typeof e[1] === 'string'
            )
          )
        : {};
    const userDescFallback = typeof userDescription === 'string' && userDescription.trim() ? userDescription.trim() : '';
    const placementsToUse = placementList.length ? placementList : ['Poitrine (centre)'];
    placementsToUse.forEach((p) => {
      const t = (textByPlacementClean[p] && textByPlacementClean[p].trim()) || userDescFallback || brandName;
      textByPlacementResolved[p] = t;
    });

    const sourceVal =
      typeof source === 'string' && /^(ai|logo_only|logo_plus_ai)$/.test(source)
        ? source
        : useLogoFrame
          ? 'logo_plus_ai'
          : 'ai';

    // Génération d'un "design sticker" via Ideogram (phase 1 design).
    // Utilise generateGarmentDesign qui construit les prompts appropriés avec Claude si disponible.
    const designInput: GenerateGarmentDesignInput = {
      brand_name: brandName,
      inspiration_brand: preferredStyle,
      target_audience: targetAudience,
      positioning_style: preferredStyle,
      preferred_style: preferredStyle,
      visual_identity: palette || typography ? { colorPalette: palette ?? undefined, typography: typography ?? undefined } : undefined,
      text_by_placement: textByPlacementResolved,
      placement_list: placementsToUse,
      garment_color_hex: garmentColorHex ?? undefined,
      design_style_keywords: designStyleKeywords ?? undefined,
      design_avoid: designAvoid ?? undefined,
      design_inspiration: designInspiration ?? undefined,
      use_logo_frame: sourceVal === 'logo_plus_ai' && useLogoFrame,
    };

    const result = await generateGarmentDesign(designInput);
    const designs: Array<{ placement: string; imageUrl: string; rationale: string }> = [];

    if (isGenerateGarmentDesignResultMultiple(result)) {
      // Plusieurs designs (un par emplacement)
      for (const d of result.designs) {
        designs.push({ placement: d.placement, imageUrl: d.imageUrl, rationale: d.rationale });
        try {
          await prisma.launchMapDesignDraft.create({
            data: { brandId, imageUrl: d.imageUrl.trim(), placement: d.placement, source: sourceVal },
          });
        } catch (err) {
          console.error('[launch-map/design/generate-sticker] Erreur enregistrement historique:', err);
        }
      }
    } else {
      // Un seul design
      const placement = placementsToUse[0] || 'Poitrine (centre)';
      designs.push({ placement, imageUrl: result.imageUrl, rationale: result.rationale || 'Design généré' });
      try {
        await prisma.launchMapDesignDraft.create({
          data: { brandId, imageUrl: result.imageUrl.trim(), placement, source: sourceVal },
        });
      } catch (err) {
        console.error('[launch-map/design/generate-sticker] Erreur enregistrement historique:', err);
      }
    }

    return NextResponse.json({
      imageUrl: designs[0]?.imageUrl,
      designs,
      prompt: 'Generated via AI engine',
      rationale: 'Designs generated from brand context and placements.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération du sticker';
    console.error('[launch-map/design/generate-sticker]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
