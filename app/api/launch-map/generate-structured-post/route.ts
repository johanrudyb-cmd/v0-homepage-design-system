import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generateStructuredPostFromStrategy, isClaudeConfigured } from '@/lib/api/claude';
import type { GeneratedPostPlatform } from '@/lib/api/claude';

export const dynamic = 'force-dynamic';

const PLATFORMS: GeneratedPostPlatform[] = ['instagram', 'tiktok', 'linkedin', 'facebook', 'x'];

/** POST : génère un post structuré (headline, body, cta, hashtags) par IA à partir de la stratégie complète. Nécessite stratégie enregistrée (phase 1). */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const brandId = typeof body.brandId === 'string' ? body.brandId : null;
    const platform = typeof body.platform === 'string' && PLATFORMS.includes(body.platform as GeneratedPostPlatform)
      ? (body.platform as GeneratedPostPlatform)
      : 'instagram';
    const clothesReceived = body.clothesReceived === true;

    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: { strategyGenerations: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque introuvable' }, { status: 404 });
    }

    const latestStrategy = brand.strategyGenerations[0];
    const strategyText = latestStrategy?.strategyText?.trim();
    if (!strategyText) {
      return NextResponse.json(
        { error: 'Aucune stratégie enregistrée. Complétez la phase Stratégie marketing pour générer un post par IA.' },
        { status: 400 }
      );
    }

    if (!isClaudeConfigured()) {
      return NextResponse.json({ error: 'Génération IA non configurée' }, { status: 503 });
    }

    const content = await generateStructuredPostFromStrategy(strategyText, brand.name, platform, clothesReceived);
    return NextResponse.json(content);
  } catch (e) {
    console.error('POST /api/launch-map/generate-structured-post', e);
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 });
  }
}
