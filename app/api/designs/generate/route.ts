import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { enhancePrompt, generateTechPack } from '@/lib/api/chatgpt';
import { generateFlatSketch } from '@/lib/api/higgsfield';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { brandId, type, cut, material, details, customPrompt } = await request.json();

    // Vérifier que la marque appartient à l'utilisateur
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    // Vérifier les limites selon le plan (Free: 3, Pro: illimité)
    const designCount = await prisma.design.count({
      where: { brandId },
    });

    if (user.plan === 'free' && designCount >= 3) {
      return NextResponse.json(
        { error: 'Limite atteinte. Passez au plan Pro pour générer plus de designs.' },
        { status: 403 }
      );
    }

    // Créer le design en attente
    const design = await prisma.design.create({
      data: {
        brandId,
        type,
        cut,
        material,
        status: 'processing',
      },
    });

    try {
      // Construire le prompt de base
      const basePrompt = `${type}, ${cut} cut, ${material}`;
      const detailsList = Object.entries(details)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ');

      const fullPrompt = customPrompt
        ? `${basePrompt}, ${detailsList ? detailsList + ', ' : ''}${customPrompt}`
        : `${basePrompt}${detailsList ? ', ' + detailsList : ''}`;

      // Améliorer le prompt avec ChatGPT
      const enhancedPrompt = await enhancePrompt(fullPrompt, {
        type,
        style: 'professional',
      });

      // Générer le flat sketch avec Higgsfield
      const flatSketchUrl = await generateFlatSketch(enhancedPrompt);

      // Générer le tech pack avec ChatGPT
      const techPack = await generateTechPack({
        type,
        cut,
        details,
        material,
      });

      // Mettre à jour le design
      const updatedDesign = await prisma.design.update({
        where: { id: design.id },
        data: {
          flatSketchUrl,
          techPack,
          prompt: enhancedPrompt,
          status: 'completed',
        },
      });

      return NextResponse.json({ design: updatedDesign });
    } catch (error: any) {
      // Marquer le design comme échoué
      await prisma.design.update({
        where: { id: design.id },
        data: { status: 'failed' },
      });

      console.error('Erreur lors de la génération:', error);
      return NextResponse.json(
        { error: error.message || 'Erreur lors de la génération du design' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Erreur dans /api/designs/generate:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
