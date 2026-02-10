import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generateGarmentRecommendations } from '@/lib/garment-recommendations';

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

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: {
        launchMap: true,
      },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    // Générer les recommandations basées sur la stratégie et l'identité
    const recommendations = await generateGarmentRecommendations({
      brandName: brand.name,
      styleGuide: brand.styleGuide,
      launchMap: brand.launchMap,
      strategy: brand.launchMap?.phase1Data,
    });

    return NextResponse.json({ recommendations });
  } catch (error: unknown) {
    console.error('[launch-map/mockup/recommendations]', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la génération des recommandations' },
      { status: 500 }
    );
  }
}
