import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { generateUGCScripts } from '@/lib/api/chatgpt';
import { prisma } from '@/lib/prisma';

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

    const { brandId, brandName, productDescription, count } = await request.json();

    // Vérifier que la marque appartient à l'utilisateur
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    // Vérifier les limites selon le plan (Free: 10 scripts, Pro: illimité)
    const scriptCount = await prisma.uGCContent.count({
      where: { brandId, type: 'script' },
    });

    const requestedCount = Math.min(count || 5, 10);
    if (user.plan === 'free' && scriptCount + requestedCount > 10) {
      return NextResponse.json(
        { error: 'Limite atteinte. Passez au plan Pro pour générer plus de scripts.' },
        { status: 403 }
      );
    }

    // Générer les scripts avec ChatGPT
    const scripts = await generateUGCScripts(
      brandName,
      productDescription,
      requestedCount
    );

    // Sauvegarder dans la base de données
    await Promise.all(
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

    // Vérifier si au moins 5 scripts ont été générés pour valider Phase 4
    const totalScripts = await prisma.uGCContent.count({
      where: { brandId, type: 'script' },
    });

    if (totalScripts >= 5) {
      // Marquer la Phase 4 comme complétée
      await prisma.launchMap.updateMany({
        where: { brandId },
        data: { phase4: true },
      });
    }

    return NextResponse.json({ scripts });
  } catch (error: any) {
    console.error('Erreur lors de la génération de scripts:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la génération' },
      { status: 500 }
    );
  }
}
