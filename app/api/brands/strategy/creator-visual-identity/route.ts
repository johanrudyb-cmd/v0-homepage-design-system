/**
 * Identité visuelle recommandée pour le créateur : inspirée de la marque de référence (même style) mais couleurs et polices différentes, + recommandation logo.
 * POST body: { templateBrandName, templateVisualIdentity, creatorBrandName, referenceLogoUrl?, strategyText? }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { sanitizeErrorMessage } from '@/lib/utils';
import { generateCreatorVisualIdentityFromTemplate, isClaudeConfigured } from '@/lib/api/claude';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!isClaudeConfigured()) {
      return NextResponse.json(
        { error: 'Service IA non configuré pour générer l\'identité visuelle.' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const templateBrandName = typeof body.templateBrandName === 'string' ? body.templateBrandName.trim() : '';
    const templateVisualIdentity = body.templateVisualIdentity && typeof body.templateVisualIdentity === 'object' ? body.templateVisualIdentity : null;
    const creatorBrandName = typeof body.creatorBrandName === 'string' ? body.creatorBrandName.trim() : '';
    const referenceLogoUrl = typeof body.referenceLogoUrl === 'string' ? body.referenceLogoUrl.trim() || undefined : undefined;
    const strategyText = typeof body.strategyText === 'string' ? body.strategyText : undefined;

    if (!templateBrandName || !creatorBrandName || !templateVisualIdentity) {
      return NextResponse.json(
        { error: 'templateBrandName, templateVisualIdentity et creatorBrandName requis' },
        { status: 400 }
      );
    }

    const visualIdentity = await generateCreatorVisualIdentityFromTemplate(
      templateBrandName,
      templateVisualIdentity,
      creatorBrandName,
      { referenceLogoUrl, strategyText }
    );

    return NextResponse.json({ visualIdentity });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[Creator Visual Identity]', e);
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'identité visuelle", detail: process.env.NODE_ENV === 'development' ? sanitizeErrorMessage(message) : undefined },
      { status: 500 }
    );
  }
}
