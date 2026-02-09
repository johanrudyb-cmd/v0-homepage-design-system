/**
 * POST /api/launch-map/site-texts
 * Génère les textes du site (titre produit, description, hero) à partir de la stratégie de la marque.
 * Body: { brandId: string, productType?: string }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generateSiteTextsFromStrategy, isClaudeConfigured } from '@/lib/api/claude';
import { withAIUsageLimit } from '@/lib/ai-usage';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const brandId = typeof body.brandId === 'string' ? body.brandId.trim() : '';
    const productType = typeof body.productType === 'string' ? body.productType.trim() : undefined;

    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: { strategyGenerations: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!brand) return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });

    const latestStrategy = brand.strategyGenerations[0];
    const strategyText = latestStrategy?.strategyText?.trim();
    if (!strategyText) {
      return NextResponse.json(
        { error: 'Aucune stratégie enregistrée. Complétez la phase Stratégie marketing pour générer les textes du site.' },
        { status: 400 }
      );
    }

    if (!isClaudeConfigured()) {
      return NextResponse.json({ error: 'Génération IA non configurée' }, { status: 503 });
    }

    const texts = await withAIUsageLimit(
      user.id,
      user.plan,
      'launch_map_site_texts',
      () => generateSiteTextsFromStrategy(brand.name, strategyText, productType),
      { brandId }
    );
    return NextResponse.json(texts);
  } catch (e) {
    console.error('[site-texts] POST', e);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des textes' },
      { status: 500 }
    );
  }
}
