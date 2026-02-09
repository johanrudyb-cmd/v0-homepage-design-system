/**
 * Types pour le questionnaire de création de mannequin (cible de la marque).
 * Structure : 1. Identité (sexe, âge, origine) — partie verrouillée depuis la stratégie
 *             2. Caractéristiques physiques (cheveux, yeux, morphologie)
 *             3. Vibe & expression (expression faciale, type de peau, style)
 *             4. Méthode : photo de référence OU génération IA
 */

/** Valeurs possibles récupérées de la stratégie (affichées en lecture seule / verrouillées) */
export interface MannequinStrategyContext {
  /** Cible stratégie ex. "Femmes 25-34", "Hommes", "Unisexe" */
  targetAudience?: string | null;
  /** Positionnement ex. "Streetwear", "Quiet Luxury" */
  positioning?: string | null;
}

export type MannequinGender = 'femme' | 'homme' | 'unisexe';
export type MannequinAgeRange = '18-24' | '25-34' | '35-50';
export type MannequinOrigin = 'europeen' | 'africain' | 'asiatique' | 'latino' | 'metisse' | 'non_specifie';
export type MannequinBodyType = 'mince' | 'athletique' | 'plus_size' | 'muscle' | 'regular' | 'svelte';
export type MannequinFacialExpression = 'serieux' | 'souriant' | 'neutre' | 'hautain' | 'determine';
export type MannequinCreationMethod = 'ai_generate' | 'reference_photo';

export interface MannequinQuestionnaireAnswers {
  // —— 1. Identité (certains verrouillés depuis la stratégie) ——
  /** Sexe du mannequin */
  gender: MannequinGender;
  /** Âge apparent (segments) */
  ageRange: MannequinAgeRange;
  /** Origine / ethnie (marketing ciblé) */
  origin: MannequinOrigin;

  // —— 2. Caractéristiques physiques (Look) ——
  /** Couleur et type de cheveux (ex: Brun court, Blond bouclé, Rasé) */
  hairDescription: string;
  /** Couleur des yeux */
  eyeColor: string;
  /** Morphologie (tombé des vêtements) */
  bodyType: MannequinBodyType;

  // —— 3. Vibe & expression (Storytelling) ——
  /** Expression faciale par défaut */
  facialExpression: MannequinFacialExpression;
  /** Type de peau (teint mat, taches de rousseur, etc.) */
  skinType: string;
  /** Style / catégorie (Gorpcore, Quiet Luxury, etc.) — peut venir du positionnement */
  styleVibe: string;

  // —— 4. Méthode de création ——
  /** Génération IA à partir des réponses OU photo de référence */
  creationMethod: MannequinCreationMethod;
  /** URL de la photo de référence (si creationMethod === 'reference_photo') */
  referencePhotoUrl?: string;

  notes?: string;
}

export const DEFAULT_MANNEQUIN_ANSWERS: MannequinQuestionnaireAnswers = {
  gender: 'femme',
  ageRange: '25-34',
  origin: 'non_specifie',
  hairDescription: '',
  eyeColor: '',
  bodyType: 'regular',
  facialExpression: 'neutre',
  skinType: '',
  styleVibe: '',
  creationMethod: 'ai_generate',
};

/**
 * Construit le prompt (anglais) pour la génération d'image : mannequin / modèle de référence.
 */
export function buildMannequinPrompt(answers: MannequinQuestionnaireAnswers): string {
  const parts: string[] = [
    'Professional fashion model reference photo',
    answers.gender === 'femme' ? 'woman' : answers.gender === 'homme' ? 'man' : 'androgynous model',
    answers.ageRange === '18-24' ? 'young adult 18-24' : answers.ageRange === '25-34' ? 'adult 25-34' : 'adult 35-50',
  ];

  if (answers.origin !== 'non_specifie') {
    const originMap: Record<MannequinOrigin, string> = {
      europeen: 'European ethnicity',
      africain: 'African ethnicity',
      asiatique: 'Asian ethnicity',
      latino: 'Latino ethnicity',
      metisse: 'mixed ethnicity',
      non_specifie: '',
    };
    if (originMap[answers.origin]) parts.push(originMap[answers.origin]);
  }

  if (answers.bodyType === 'mince') parts.push('slim build');
  else if (answers.bodyType === 'athletique') parts.push('athletic build');
  else if (answers.bodyType === 'plus_size') parts.push('plus-size build');
  else if (answers.bodyType === 'muscle') parts.push('muscular build');
  else if (answers.bodyType === 'svelte') parts.push('svelte figure');
  else parts.push('regular build');

  if (answers.hairDescription?.trim()) parts.push(answers.hairDescription.trim(), 'hair');
  if (answers.eyeColor?.trim()) parts.push(answers.eyeColor.trim(), 'eyes');

  if (answers.facialExpression === 'serieux') parts.push('serious expression', 'determined look');
  else if (answers.facialExpression === 'souriant') parts.push('smiling', 'welcoming');
  else if (answers.facialExpression === 'neutre') parts.push('neutral expression');
  else if (answers.facialExpression === 'hautain') parts.push('haughty', 'luxury expression');
  else if (answers.facialExpression === 'determine') parts.push('determined', 'focused expression');

  if (answers.skinType?.trim()) parts.push(answers.skinType.trim());
  if (answers.styleVibe?.trim()) parts.push(answers.styleVibe.trim(), 'style');

  parts.push('studio lighting', 'clean background', 'full body or three-quarter view', 'model reference for virtual try-on');
  parts.push('high quality', '8k', 'fashion photography', 'realistic');
  if (answers.notes?.trim()) parts.push(answers.notes.trim());

  return parts.filter(Boolean).join(', ') + '.';
}

/**
 * Mappe la cible stratégie (texte) vers genre pour pré-remplissage.
 */
export function mapTargetAudienceToGender(targetAudience: string | null | undefined): MannequinGender | null {
  if (!targetAudience?.trim()) return null;
  const t = targetAudience.toLowerCase();
  if (t.includes('femme') || t.includes('woman') || t.includes('female')) return 'femme';
  if (t.includes('homme') || t.includes('man') || t.includes('male')) return 'homme';
  if (t.includes('unisexe') || t.includes('unisex')) return 'unisexe';
  return null;
}

/**
 * Mappe la cible stratégie vers tranche d'âge si présente.
 */
export function mapTargetAudienceToAgeRange(targetAudience: string | null | undefined): MannequinAgeRange | null {
  if (!targetAudience?.trim()) return null;
  const t = targetAudience.toLowerCase();
  if (/\b18-24\b|\b18\/24\b/.test(t)) return '18-24';
  if (/\b25-34\b|\b25\/34\b/.test(t)) return '25-34';
  if (/\b35-50\b|\b35\/50\b|\b35-44\b/.test(t)) return '35-50';
  return null;
}
