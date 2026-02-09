import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generatePostsFromContentStrategy, isClaudeConfigured } from '@/lib/api/claude';

export const dynamic = 'force-dynamic';

/** POST : génère des posts par plateforme à partir de la stratégie de contenu. Disponible uniquement si toutes les phases 0-6 sont complétées (dont Shopify). */
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
      include: { launchMap: true, strategyGenerations: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque introuvable' }, { status: 404 });
    }

    const lm = brand.launchMap;
    const hasIdentity = Boolean(brand.name && brand.name.trim().length >= 2);
    const allPhasesDone =
      hasIdentity &&
      (lm?.phase1 ?? false) &&
      (lm?.phase2 ?? false) &&
      (lm?.phase3 ?? false) &&
      (lm?.phase4 ?? false) &&
      (lm?.phase5 ?? false) &&
      (lm?.phase6 ?? false);

    if (!allPhasesDone) {
      return NextResponse.json(
        {
          error: 'Complétez toutes les étapes du parcours (y compris la création du site Shopify) pour générer des posts depuis votre stratégie de contenu.',
          locked: true,
        },
        { status: 403 }
      );
    }

    if (!isClaudeConfigured()) {
      return NextResponse.json({ error: 'Génération IA non configurée' }, { status: 503 });
    }

    const latestStrategy = brand.strategyGenerations[0];
    const strategyText = latestStrategy?.strategyText?.trim();
    if (!strategyText) {
      return NextResponse.json(
        { error: 'Aucune stratégie enregistrée pour cette marque. Complétez la phase Stratégie marketing.' },
        { status: 400 }
      );
    }

    const posts = await generatePostsFromContentStrategy(strategyText, brand.name);
    return NextResponse.json({ posts });
  } catch (e) {
    console.error('POST /api/launch-map/generate-posts-from-strategy', e);
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 });
  }
}
