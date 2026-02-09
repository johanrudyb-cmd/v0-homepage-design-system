import type { Brand, LaunchMap } from '@prisma/client';

interface GenerateRecommendationsParams {
  brandName: string;
  styleGuide?: unknown;
  launchMap?: LaunchMap | null;
  strategy?: unknown;
}

export async function generateGarmentRecommendations(
  params: GenerateRecommendationsParams
): Promise<string[]> {
  const { brandName, styleGuide, launchMap, strategy } = params;

  // Extraire les informations pertinentes
  const sg = styleGuide && typeof styleGuide === 'object' ? styleGuide as Record<string, unknown> : null;
  const targetAudience = (sg?.targetAudience as string) || 'Unisexe';
  const preferredStyle = (sg?.preferredStyle as string) || 'Casual';
  const productType = (launchMap?.phase1Data as Record<string, unknown> | null)?.productType as string || 'tshirt';

  // Recommandations basiques (à remplacer par un appel IA si nécessaire)
  const recommendations: string[] = [];

  // Recommandations basées sur le type de produit
  if (productType === 'tshirt') {
    recommendations.push(
      `Pour votre ${brandName}, privilégiez un T-shirt avec une coupe ${targetAudience === 'Femme' ? 'fitted' : 'regular'} pour un look moderne.`,
      `Optez pour un grammage de 180-200g/m² pour un rendu premium tout en restant confortable.`,
      `Considérez un col rond classique ou un col V pour un style plus décontracté.`
    );
  } else if (productType === 'hoodie') {
    recommendations.push(
      `Pour votre hoodie ${brandName}, choisissez une capuche avec cordons ajustables pour un look streetwear authentique.`,
      `Un grammage de 280-320g/m² offrira une bonne tenue et de la chaleur.`,
      `Privilégiez une poche kangourou pour un style casual et pratique.`
    );
  }

  // Recommandations basées sur le style préféré
  if (preferredStyle === 'Streetwear' || preferredStyle === 'Casual') {
    recommendations.push(
      `Pour un style ${preferredStyle.toLowerCase()}, optez pour des couleurs neutres (noir, blanc, gris) avec des accents de couleur pour votre logo.`,
      `Considérez des finitions contrastées (surpiqures visibles) pour un look plus urbain.`
    );
  } else if (preferredStyle === 'Premium' || preferredStyle === 'Luxe') {
    recommendations.push(
      `Pour un positionnement ${preferredStyle.toLowerCase()}, privilégiez des matières premium (coton bio, modal) et des finitions soignées.`,
      `Optez pour des couleurs sobres et élégantes qui reflètent votre identité de marque.`
    );
  }

  // Recommandations basées sur la cible
  if (targetAudience === 'Femme') {
    recommendations.push(
      `Pour votre cible féminine, proposez des coupes plus ajustées et des tailles inclusives (XS à XXL).`,
      `Considérez des couleurs pastel ou des tons neutres selon votre identité visuelle.`
    );
  } else if (targetAudience === 'Homme') {
    recommendations.push(
      `Pour votre cible masculine, privilégiez des coupes regular ou oversized selon le style ${preferredStyle.toLowerCase()}.`,
      `Les couleurs sombres (noir, navy, charcoal) fonctionnent bien pour un public masculin.`
    );
  }

  // Recommandations générales
  recommendations.push(
    `Assurez-vous que votre design soit lisible et impactant, même sur de petites tailles.`,
    `Testez votre design sur différents fonds (clair et foncé) pour garantir la visibilité.`,
    `Considérez la position de votre logo : poitrine (centre) pour un look classique, ou dos pour un style plus streetwear.`
  );

  // Limiter à 8 recommandations maximum
  return recommendations.slice(0, 8);
}
