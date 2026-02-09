import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import {
  generateLaunchMapRecommendations,
  isClaudeConfigured,
  type LaunchMapRecommendationsContext,
} from '@/lib/api/claude';
import { withAIUsageLimit } from '@/lib/ai-usage';

export const dynamic = 'force-dynamic';

const RECOMMENDATIONS_TTL_MS = 24 * 60 * 60 * 1000; // 24 heures

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const brandId = typeof body.brandId === 'string' ? body.brandId : null;
    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: { launchMap: true },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque introuvable' }, { status: 404 });
    }

    const hasIdentity = Boolean(brand.name && brand.name.trim().length >= 2);
    const lm = brand.launchMap;
    const hasStrategy = lm?.phase1 ?? false;

    // Recommandations conseil uniquement si identité ET stratégie sont complétées
    if (!hasIdentity || !hasStrategy) {
      return NextResponse.json(
        {
          recommendations: [],
          locked: true,
          message: 'Complétez l’identité et la stratégie de votre marque pour recevoir vos recommandations conseil personnalisées.',
        },
        { status: 200 }
      );
    }

    // Cache : au plus une génération par 24 h
    const cachedAt = lm?.recommendationsCachedAt ? new Date(lm.recommendationsCachedAt).getTime() : 0;
    const now = Date.now();
    if (lm?.recommendationsCache && Array.isArray(lm.recommendationsCache) && now - cachedAt < RECOMMENDATIONS_TTL_MS) {
      return NextResponse.json({
        recommendations: lm.recommendationsCache as string[],
        cached: true,
        cachedAt: lm.recommendationsCachedAt,
      });
    }

    if (!isClaudeConfigured()) {
      return NextResponse.json(
        { recommendations: [], error: 'Recommandations conseil non configurées' },
        { status: 200 }
      );
    }

    const sg = brand.styleGuide && typeof brand.styleGuide === 'object' ? (brand.styleGuide as Record<string, unknown>) : null;
    const [designCount, quoteCount, ugcCount, quotesCount] = await Promise.all([
      prisma.design.count({ where: { brandId, status: 'completed' } }),
      prisma.quote.count({ where: { brandId } }),
      prisma.uGCContent.count({ where: { brandId } }),
      prisma.quote.groupBy({ by: ['factoryId'], where: { brandId } }).then((r) => r.length),
    ]);

    const completedPhases = [
      hasIdentity,
      hasStrategy,
      lm?.phase2,
      lm?.phase3,
      lm?.phase4,
      lm?.phase5,
    ].filter(Boolean).length;

    const context: LaunchMapRecommendationsContext = {
      brandName: brand.name,
      productType: (sg?.productType as string) ?? null,
      productWeight: (sg?.productWeight as string) ?? null,
      templateBrandSlug: brand.templateBrandSlug ?? null,
      positioning: (sg?.preferredStyle as string) ?? (sg?.positioning as string) ?? null,
      targetAudience: (sg?.targetAudience as string) ?? null,
      story: (sg?.story as string) ?? null,
      tagline: (sg?.tagline as string) ?? null,
      phase1Data: lm?.phase1Data && typeof lm.phase1Data === 'object' ? (lm.phase1Data as Record<string, unknown>) : null,
      designCount,
      quoteCount,
      suppliersCount: quotesCount,
      ugcCount,
      completedPhases,
    };

    const recommendations = await withAIUsageLimit(
      user.id,
      user.plan ?? 'free',
      'launch_map_recommendations',
      () => generateLaunchMapRecommendations(context),
      { brandId }
    );

    if (lm && recommendations.length > 0) {
      await prisma.launchMap.update({
        where: { id: lm.id },
        data: {
          recommendationsCache: recommendations,
          recommendationsCachedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ recommendations });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur lors de la génération des recommandations conseil';
    console.error('Launch map recommendations error:', e);
    const isQuota = message.includes('limité') || message.includes('Quota') || message.includes('épuisé');
    return NextResponse.json(
      { error: message, recommendations: [] },
      { status: isQuota ? 403 : 500 }
    );
  }
}
