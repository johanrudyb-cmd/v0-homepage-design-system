/**
 * Stratégie template d'une marque de référence : générée une fois, visible par tous.
 * GET ?slug=xxx → retourne la stratégie si elle existe (404 sinon).
 * POST body: { templateBrandSlug, templateBrandName } → génère si absent, enregistre, retourne.
 * Chaque consultation consomme 1 quota strategy_view (limite 10/mois, 3 en onboarding).
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generateBrandStrategyTemplate, generateVisualIdentityFromBrand, isClaudeConfigured } from '@/lib/api/claude';
import { generateBrandAnalysis } from '@/lib/api/chatgpt';
import { recordAIUsage } from '@/lib/ai-usage';
import { STRATEGY_VIEW_ONBOARDING_LIMIT } from '@/lib/quota-config';

export const runtime = 'nodejs';

function getBrandKey(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function isAnalyzeConfigured(): boolean {
  return !!(
    process.env.ANTHROPIC_API_KEY ||
    process.env.CHATGPT_API_KEY
  );
}

async function checkAndRecordStrategyView(userId: string, plan: string, isOnboarding: boolean): Promise<{ allowed: boolean; message?: string }> {
  const limit = isOnboarding ? STRATEGY_VIEW_ONBOARDING_LIMIT : 10;
  const { getFeatureCountThisMonth } = await import('@/lib/ai-usage');
  const used = await getFeatureCountThisMonth(userId, 'strategy_view');
  if (used >= limit) {
    return {
      allowed: false,
      message: isOnboarding
        ? `Vous avez atteint la limite de ${limit} consultations en onboarding. Les stratégies restent consultables pendant 1 mois.`
        : `Quota de consultation épuisé (${limit}/mois). Prochaine consultation à la date de renouvellement de votre abonnement.`,
    };
  }
  await recordAIUsage(userId, 'strategy_view', { onboarding: isOnboarding });
  return { allowed: true };
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug')?.trim();
    const isOnboarding = searchParams.get('onboarding') === '1';
    if (!slug) {
      return NextResponse.json({ error: 'slug requis' }, { status: 400 });
    }

    const { allowed, message } = await checkAndRecordStrategyView(user.id, user.plan ?? 'free', isOnboarding);
    if (!allowed) {
      return NextResponse.json({ error: message ?? 'Quota consultation stratégie épuisé.' }, { status: 403 });
    }

    const template = await prisma.templateStrategy.findUnique({
      where: { templateBrandSlug: slug },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Aucune stratégie template pour cette marque' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      templateBrandSlug: template.templateBrandSlug,
      templateBrandName: template.templateBrandName,
      strategyText: template.strategyText,
      visualIdentity: template.visualIdentity ?? undefined,
      createdAt: template.createdAt,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[Strategy Template GET]', e);
    const isMissingTable =
      /does not exist|Unknown table|relation.*does not exist|Table.*not found/i.test(message);
    const hint = isMissingTable
      ? ' Exécutez: npx prisma db push (ou migrez la base).'
      : '';
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de la stratégie template" + hint,
        detail: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!isClaudeConfigured()) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY requise pour générer la stratégie.' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const templateBrandSlug =
      typeof body.templateBrandSlug === 'string' ? body.templateBrandSlug.trim() : '';
    const templateBrandName =
      typeof body.templateBrandName === 'string' ? body.templateBrandName.trim() : '';
    const isOnboarding = body.onboarding === true || body.onboarding === '1';

    if (!templateBrandSlug || !templateBrandName) {
      return NextResponse.json(
        { error: 'templateBrandSlug et templateBrandName requis' },
        { status: 400 }
      );
    }

    const { allowed, message } = await checkAndRecordStrategyView(user.id, user.plan ?? 'free', isOnboarding);
    if (!allowed) {
      return NextResponse.json({ error: message ?? 'Quota consultation stratégie épuisé.' }, { status: 403 });
    }

    // Si déjà en base, retourner
    const existing = await prisma.templateStrategy.findUnique({
      where: { templateBrandSlug },
    });
    if (existing) {
      return NextResponse.json({
        templateBrandSlug: existing.templateBrandSlug,
        templateBrandName: existing.templateBrandName,
        strategyText: existing.strategyText,
        visualIdentity: existing.visualIdentity ?? undefined,
        createdAt: existing.createdAt,
      });
    }

    // Récupérer l'analyse (BrandAnalysis ou générer)
    let analysisText = '';
    const brandKey = getBrandKey(templateBrandName);
    const analysisRecord = await prisma.brandAnalysis.findUnique({
      where: { brandKey },
    });
    if (analysisRecord) {
      analysisText = analysisRecord.analysis;
    } else if (isAnalyzeConfigured()) {
      const analysis = await generateBrandAnalysis(templateBrandName);
      analysisText = analysis;
      await prisma.brandAnalysis.create({
        data: { brandKey, brandName: templateBrandName, analysis },
      });
    }

    const [strategyText, visualIdentity] = await Promise.all([
      generateBrandStrategyTemplate(templateBrandName, analysisText),
      generateVisualIdentityFromBrand(templateBrandName, analysisText),
    ]);

    const created = await prisma.templateStrategy.create({
      data: {
        templateBrandSlug,
        templateBrandName,
        strategyText,
        visualIdentity: visualIdentity as object,
      },
    });

    return NextResponse.json({
      templateBrandSlug: created.templateBrandSlug,
      templateBrandName: created.templateBrandName,
      strategyText: created.strategyText,
      visualIdentity: created.visualIdentity ?? undefined,
      createdAt: created.createdAt,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur lors de la génération';
    console.error('[Strategy Template POST]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
