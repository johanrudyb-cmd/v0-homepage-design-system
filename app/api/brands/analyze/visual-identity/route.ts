/**
 * Génère ou met à jour l'identité visuelle d'une marque déjà analysée.
 * POST body: { brandName: string } → génère visualIdentity et met à jour BrandAnalysis.
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generateVisualIdentityFromBrand, isClaudeConfigured } from '@/lib/api/claude';

export const runtime = 'nodejs';

function getBrandKey(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!isClaudeConfigured()) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY requise pour générer l\'identité visuelle.' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const brandName = (body.brandName || body.brand || '').trim();
    if (!brandName || brandName.length < 2) {
      return NextResponse.json({ error: 'brandName requis' }, { status: 400 });
    }

    const brandKey = getBrandKey(brandName);
    const existing = await prisma.brandAnalysis.findUnique({
      where: { brandKey },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Aucune analyse pour cette marque. Lancez d\'abord l\'analyse.' },
        { status: 404 }
      );
    }

    const visualIdentity = await generateVisualIdentityFromBrand(brandName, existing.analysis);

    await prisma.brandAnalysis.update({
      where: { brandKey },
      data: { visualIdentity: visualIdentity as object },
    });

    return NextResponse.json({
      brandName: existing.brandName,
      visualIdentity,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur lors de la génération';
    console.error('[Analyze Visual Identity POST]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
