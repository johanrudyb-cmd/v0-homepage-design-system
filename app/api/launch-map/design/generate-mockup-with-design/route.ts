/**
 * Génère un mockup par emplacement via un moteur IA (côté serveur).
 * POST /api/launch-map/design/generate-mockup-with-design
 * Body: { brandId, questionnaire, designsByPlacement: { placement, imageUrl }[] }
 *
 * Note: Les noms de fournisseurs ne doivent pas apparaître côté UI.
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { rateLimitByUser } from '@/lib/rate-limit';
import {
  getViewAngleForPlacement,
  PLACEMENT_LABEL_EN,
  type MockupQuestionnaireAnswers,
} from '@/lib/mockup-and-techpack-types';
import { generateClothing, isTnbConfigured } from '@/lib/api/TnbService';

export const runtime = 'nodejs';
export const maxDuration = 120;

function ensureQuestionnaire(q: Partial<MockupQuestionnaireAnswers>): MockupQuestionnaireAnswers {
  return {
    productType: q.productType || 'T-shirt',
    cut: q.cut || 'Regular',
    material: q.material || 'Coton',
    colorMain: q.colorMain || 'Blanc',
    neckline: q.neckline || 'Crew (col rond)',
    sleeves: q.sleeves || 'Courtes',
    designType: q.designType ?? 'illustration',
    designPlacement: q.designPlacement,
    designTechnique: q.designTechnique,
    colorSpecifics: q.colorSpecifics,
    seams: q.seams,
    weight: q.weight,
    length: q.length,
    hem: q.hem,
    fit: q.fit,
    targetGender: q.targetGender,
    viewAngle: q.viewAngle,
    brandName: q.brandName,
    inspiration: q.inspiration,
    notes: q.notes,
    backgroundStyle: q.backgroundStyle || 'white',
    photoStyle: q.photoStyle || 'ecommerce',
  };
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const rateLimitResult = await rateLimitByUser(user.id, 'launch-map:generate-mockup-with-design', {
      maxRequests: 4,
      windowMs: 120 * 1000,
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez dans 2 minutes.' },
        { status: 429 }
      );
    }

    if (!isTnbConfigured()) {
      return NextResponse.json(
        { error: 'Génération mockup non configurée (configurer la clé du moteur IA).' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      brandId,
      questionnaire: questionnairePartial,
      designsByPlacement,
      modificationRequest,
    } = body as {
      brandId: string;
      questionnaire: Partial<MockupQuestionnaireAnswers>;
      designsByPlacement: Array<{ placement: string; imageUrl: string }>;
      modificationRequest?: string;
    };

    if (!brandId || !questionnairePartial?.productType || !Array.isArray(designsByPlacement) || designsByPlacement.length === 0) {
      return NextResponse.json(
        { error: 'brandId, questionnaire (productType) et designsByPlacement (non vide) requis.' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque non trouvée' }, { status: 404 });
    }

    const questionnaire = ensureQuestionnaire(questionnairePartial);
    const brandName = (brand.name || questionnaire.brandName || 'Brand').trim();

    const imagesByPlacement: Array<{ placement: string; url: string }> = [];
    const modificationSuffix = modificationRequest?.trim()
      ? ` IMPORTANT - User requested: ${modificationRequest.trim()}`
      : '';

    for (const { placement, imageUrl } of designsByPlacement) {
      if (!placement || typeof placement !== 'string') continue;
      const view = getViewAngleForPlacement(placement); // 'front' | 'back'
      const placementLabelEn = PLACEMENT_LABEL_EN[placement] || placement.toLowerCase();
      const technique = questionnaire.designTechnique ? `${questionnaire.designTechnique}` : 'print';

      // Prompt renforcé : packshot e-commerce strict, vêtement seul, logo décrit textuellement.
      // IMPORTANT : Les informations sur le vêtement (couleur, coupe, matériau, etc.) sont pour aider à créer le meilleur vêtement possible.
      // Mais sur le vêtement final, il ne doit y avoir QUE le logo - aucun autre texte, graphique ou élément décoratif.
      const outfit = [
        'Product photography',
        'flat lay',
        'garment only',
        'no human',
        'no body',
        'no mannequin',
        'ghost mannequin style',
        'white background',
        // Informations sur le vêtement (pour aider à créer le meilleur vêtement possible) :
        questionnaire.productType,
        `${questionnaire.cut} cut`,
        questionnaire.material,
        `color: ${questionnaire.colorMain}`,
        `${questionnaire.neckline} neckline`,
        `${questionnaire.sleeves} sleeves`,
        questionnaire.weight ? `fabric weight: ${questionnaire.weight}` : '',
        questionnaire.fit ? `fit: ${questionnaire.fit}` : '',
        questionnaire.hem ? `hem: ${questionnaire.hem}` : '',
        questionnaire.seams ? `construction: ${questionnaire.seams}` : '',
        view === 'back' ? 'back view, rear view, no front visible' : 'front view, chest visible',
        // IMPORTANT : Sur le vêtement, il ne doit y avoir QUE le logo :
        `ONLY the brand logo "${brandName}" printed on the ${placementLabelEn}`,
        `application method: ${technique}`,
        'logo is visible, centered, professional',
        'NO other text on the garment',
        'NO other graphics on the garment',
        'NO other decorative elements on the garment',
        'ONLY the logo, nothing else',
        questionnaire.colorSpecifics ? `logo print colors: ${questionnaire.colorSpecifics}` : '',
        modificationSuffix,
      ]
        .filter(Boolean)
        .join(', ') + '.';

      const url = await generateClothing({
        outfit,
        gender: 'woman',
        country: 'France',
        age: 25,
        body_type: undefined,
        ratio: '1:1',
        background: 'white background, no shadows, no objects',
        negative:
          'mannequin, model, person, human, face, head, hands, arms, legs, body, mannequin body, dummy, display stand, man wearing, woman wearing, person wearing, busy background, text watermark, extra logos, extra text, extra graphics, decorative elements, patterns, prints, illustrations, shadows of people, shadows of body, any text other than the logo, any graphics other than the logo',
      });

      imagesByPlacement.push({ placement, url });
    }

    return NextResponse.json({ imagesByPlacement, questionnaire });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération du mockup';
    console.error('[launch-map/design/generate-mockup-with-design]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
