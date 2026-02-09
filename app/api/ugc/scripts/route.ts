import { NextResponse } from 'next/server';
import { sanitizeErrorMessage } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { generateUGCScripts } from '@/lib/api/chatgpt';
import { prisma } from '@/lib/prisma';
import { NotificationHelpers } from '@/lib/notifications';
import { withAIUsageLimit } from '@/lib/ai-usage';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    if (!brandId) {
      return NextResponse.json({ error: 'brandId requis' }, { status: 400 });
    }

    // Vérifier que la marque appartient à l'utilisateur
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    // Compter les scripts
    const count = await prisma.uGCContent.count({
      where: { brandId, type: 'script' },
    });

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des scripts:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
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

    const { brandId, brandName, productDescription, count, tone } = await request.json();

    // Vérifier que la marque appartient à l'utilisateur et récupérer l'identité
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      select: {
        id: true,
        name: true,
        colorPalette: true,
        typography: true,
        styleGuide: true,
      },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const requestedCount = Math.min(count || 5, 10);

    // Générer les scripts avec ChatGPT (avec identité de marque) — vérification quota IA / jetons
    const scripts = await withAIUsageLimit(
      user.id,
      user.plan,
      'ugc_scripts',
      () =>
        generateUGCScripts(
          brand.name || brandName,
          productDescription,
          requestedCount,
          tone || 'décontracté',
          {
            colorPalette: brand.colorPalette,
            typography: brand.typography,
            styleGuide: brand.styleGuide,
          }
        ),
      { brandId }
    );

    // Sauvegarder dans la base de données avec IDs pour permettre l'édition
    const savedScripts = await Promise.all(
      scripts.map((script) =>
        prisma.uGCContent.create({
          data: {
            brandId,
            type: 'script',
            content: script,
          },
        })
      )
    );

    // Retourner les scripts avec leurs IDs
    const scriptsWithIds = savedScripts.map((saved) => ({
      id: saved.id,
      content: saved.content,
    }));

    // Créer une notification pour les scripts générés
    await NotificationHelpers.ugcGenerated(user.id, 'script', brandId);

    // Vérifier si au moins 5 scripts ont été générés pour valider Phase 4
    const totalScripts = await prisma.uGCContent.count({
      where: { brandId, type: 'script' },
    });

    if (totalScripts >= 5) {
      // Marquer la Phase 5 (Go-to-Market) comme complétée
      await prisma.launchMap.updateMany({
        where: { brandId },
        data: { phase5: true },
      });
      // Notification pour phase complétée
      await NotificationHelpers.phaseCompleted(user.id, 5, 'Génération de scripts marketing');
    }

    return NextResponse.json({ scripts: scriptsWithIds });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Une erreur est survenue lors de la génération';
    console.error('Erreur lors de la génération de scripts:', error);
    const isQuota = typeof message === 'string' && (message.includes('limité') || message.includes('Quota') || message.includes('épuisé'));
    return NextResponse.json(
      { error: sanitizeErrorMessage(message) },
      { status: isQuota ? 403 : 500 }
    );
  }
}
