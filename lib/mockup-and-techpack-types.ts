/**
 * Types pour le flux : Questionnaire mockup → master prompt → photo produit → tech pack ultra détaillé.
 * @see docs/spec-mockup-questionnaire-et-techpack-visuel.md
 */

/** Réponses au questionnaire mockup (maximum de questions pour un master prompt fidèle à l'idée) */
export interface MockupQuestionnaireAnswers {
  productType: string;
  cut: string;
  length?: string;
  material: string;
  weight?: string;
  colorMain: string;
  colorsSecondary?: string[];
  neckline: string;
  sleeves: string;
  hem?: string;
  pockets?: string;
  closure?: string;
  designType: 'none' | 'logo' | 'text' | 'illustration' | 'photo' | 'mixed';
  designPlacement?: string;
  designTechnique?: string;
  designColors?: string[];
  designDescription?: string; // Texte libre : message, nom de marque, idée du visuel
  /** Spécificités couleurs (ex. Pantone, nombre de couleurs, références) */
  colorSpecifics?: string;
  /** Coutures et finitions (ex. surpiqures, overlock, coutures visibles) */
  seams?: string;
  backgroundStyle: 'white' | 'light_gray' | 'floating_void' | 'shadow';
  photoStyle: 'ecommerce' | 'lookbook' | 'minimal';
  viewAngle?: 'front' | 'three_quarter' | 'back';
  brandName?: string;
  inspiration?: string; // Références, mood, style en une phrase
  fit?: string; // Regular, relaxed, fitted, etc.
  season?: string; // SS24, FW24, etc.
  targetGender?: string; // homme, femme, unisexe, enfant
  notes?: string;
}

/** Construit le master prompt (anglais) pour la photo produit à partir de toutes les réponses */
export function buildProductPhotoPrompt(answers: MockupQuestionnaireAnswers): string {
  const parts: string[] = [
    'Professional product photography',
    answers.productType,
    `${answers.cut} cut`,
    answers.material,
    answers.colorMain,
    `${answers.neckline} neckline`,
    `${answers.sleeves} sleeves`,
  ];

  if (answers.weight) parts.push(answers.weight);
  if (answers.length) parts.push(answers.length);
  if (answers.fit) parts.push(answers.fit, 'fit');
  if (answers.hem) parts.push(answers.hem, 'hem');
  if (answers.pockets && answers.pockets !== 'Aucune') parts.push(answers.pockets, 'pockets');
  if (answers.closure) parts.push(answers.closure);

  if (answers.designPlacement) parts.push(`print/logo placement: ${answers.designPlacement}`);
  if (answers.designTechnique) parts.push(`print technique: ${answers.designTechnique}`);
  if (answers.designType !== 'none') {
    if (answers.designColors?.length) parts.push(answers.designColors.join(', '));
    if (answers.designDescription) parts.push(answers.designDescription);
  }
  if (answers.colorSpecifics) parts.push(`color specs: ${answers.colorSpecifics}`);
  if (answers.seams) parts.push(`seams and construction: ${answers.seams}`);

  if (answers.inspiration) parts.push(answers.inspiration);
  if (answers.targetGender) parts.push(answers.targetGender);

  // Style simple, fond blanc, photo produit (pas de fond créatif)
  parts.push('simple product photography', 'white background', 'clean minimal');
  parts.push(answers.viewAngle || 'front', 'view');
  if (answers.notes) parts.push(answers.notes);
  parts.push('8k', 'square crop');

  return parts.filter(Boolean).join(', ') + '.';
}

/** Emplacements qui correspondent à une vue dos du vêtement (pour cohérence des mockups). */
const BACK_VIEW_PLACEMENTS = new Set([
  'Dos',
  'Dos complet',
  'Capuche (dos)',
  'Bas (dos)',
  'Poche arrière',
]);

/**
 * Retourne la vue à utiliser pour un emplacement donné (front = face, back = dos).
 * Pour des mockups cohérents : poitrine → face, dos → dos.
 */
export function getViewAngleForPlacement(placement: string): 'front' | 'back' {
  return BACK_VIEW_PLACEMENTS.has(placement) ? 'back' : 'front';
}

/**
 * Prompt pour générer un vêtement uni (sans logo ni impression).
 * Utilisé pour la base du mockup : on génère le vêtement seul, puis on compose le logo dessus.
 * Vue "back" = dos du vêtement visible (rear view). Technique (ex. Broderie) transmise pour cohérence.
 */
export function buildPlainGarmentPrompt(
  answers: MockupQuestionnaireAnswers,
  viewAngle: 'front' | 'back'
): string {
  const colorDesc = describeColorForPrompt(answers.colorMain);
  const parts: string[] = [
    'Professional product photography',
    'single garment',
    'one same product',
    answers.productType,
    `${answers.cut} cut`,
    answers.material,
    `main color: ${colorDesc}`,
    `${answers.neckline} neckline`,
    `${answers.sleeves} sleeves`,
  ];
  if (answers.weight) parts.push(answers.weight, 'fabric weight');
  if (answers.length) parts.push(answers.length);
  if (answers.fit) parts.push(answers.fit, 'fit');
  if (answers.hem) parts.push(answers.hem, 'hem');
  if (answers.pockets && answers.pockets !== 'Aucune') parts.push(answers.pockets, 'pockets');
  if (answers.closure) parts.push(answers.closure);
  if (answers.seams) parts.push(`seams and construction: ${answers.seams}`);

  parts.push(
    'no logo',
    'no print',
    'no graphic',
    'plain solid color garment',
    'blank garment',
    'same fabric same color for front and back'
  );
  if (answers.designTechnique) {
    parts.push(`applied design will be ${answers.designTechnique}`);
  }
  if (answers.targetGender) parts.push(`target: ${answers.targetGender}`);
  if (answers.inspiration) parts.push(answers.inspiration);
  if (answers.notes) parts.push(answers.notes);

  if (viewAngle === 'back') {
    parts.push(
      'back view of the same garment',
      'rear view',
      'same t-shirt seen from behind',
      'back of the garment visible',
      'no front chest visible'
    );
  } else {
    parts.push(
      'front view of the garment',
      'chest visible',
      'same t-shirt front'
    );
  }

  parts.push(
    'garment only',
    'no mannequin',
    'no model',
    'no person',
    'no human',
    'flat lay or on hanger',
    'white background',
    'clean minimal',
    'lifesize proportion',
    'realistic garment scale',
    '8k',
    'square crop'
  );

  return parts.filter(Boolean).join(', ') + '.';
}

/** Décrit la couleur pour le prompt (nom + hex). Blanc/white/ffffff → pure white pour éviter beige. */
function describeColorForPrompt(colorMain: string): string {
  const raw = (colorMain || '').trim().toLowerCase();
  if (raw === 'blanc' || raw === 'white') {
    return 'pure white, bright white, #ffffff, no beige no cream';
  }
  const hex = colorMain.replace(/^\s*#?/, '').trim();
  if (/^[0-9A-Fa-f]{3}$/.test(hex) || /^[0-9A-Fa-f]{6}$/.test(hex)) {
    const fullHex = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
    const h = fullHex.toLowerCase();
    const names: Record<string, string> = {
      ffffff: 'pure white, bright white, #ffffff, no beige no cream',
      '000000': 'black',
      '1a1a1a': 'black',
      '2d2d2d': 'dark grey',
      '6b7280': 'grey',
      '1e3a5f': 'navy blue',
      '2563eb': 'blue',
      b91c1c: 'red',
      '14532d': 'dark green',
      d6d3c4: 'beige',
      c19a6b: 'tan',
      '78350f': 'brown',
      ca8a04: 'gold',
      c2410c: 'orange',
      be185d: 'pink',
      '7c3aed': 'purple',
    };
    const name = names[h];
    return name ? name : `color #${fullHex}`;
  }
  return colorMain;
}

/**
 * Construit le prompt pour la génération mockup (Higgsfield) : vêtement avec le design intégré à l’emplacement donné.
 * Toutes les infos du formulaire sont reprises. Pas de mannequin, vêtement seul.
 */
export function buildMockupWithDesignPrompt(
  answers: MockupQuestionnaireAnswers,
  placement: string,
  placementLabelEn: string
): string {
  const viewAngle = getViewAngleForPlacement(placement);
  const parts: string[] = [
    'Professional product photography',
    answers.productType,
    `${answers.cut} cut`,
    answers.material,
    `main color: ${describeColorForPrompt(answers.colorMain)}`,
    `${answers.neckline} neckline`,
    `${answers.sleeves} sleeves`,
  ];
  if (answers.weight) parts.push(answers.weight, 'fabric weight');
  if (answers.length) parts.push(answers.length);
  if (answers.fit) parts.push(answers.fit, 'fit');
  if (answers.hem) parts.push(answers.hem, 'hem');
  if (answers.pockets && answers.pockets !== 'Aucune') parts.push(answers.pockets, 'pockets');
  if (answers.closure) parts.push(answers.closure);

  if (answers.seams) parts.push(`seams and construction: ${answers.seams}`);
  if (answers.designTechnique) parts.push(`print technique: ${answers.designTechnique}`);
  if (answers.colorSpecifics) parts.push(`print color specs: ${answers.colorSpecifics}`);

  parts.push(`with the validated logo/design from the previous step printed on the ${placementLabelEn}`, 'exact same graphic as provided');
  if (answers.targetGender) parts.push(`target: ${answers.targetGender}`);
  if (answers.inspiration) parts.push(answers.inspiration);
  if (answers.notes) parts.push(answers.notes);

  parts.push(
    'garment only',
    'no mannequin',
    'no model',
    'no person',
    'no human',
    'flat lay or on hanger',
    'white background',
    'clean minimal',
    `${viewAngle} view`,
    '8k',
    'square crop'
  );

  return parts.filter(Boolean).join(', ') + '.';
}

/** Libellés anglais des emplacements pour le prompt (court). */
export const PLACEMENT_LABEL_EN: Record<string, string> = {
  'Poitrine (centre)': 'center chest',
  'Poitrine (gauche)': 'left chest',
  'Dos': 'back',
  'Dos complet': 'full back',
  'Manche gauche': 'left sleeve',
  'Manche droite': 'right sleeve',
  'Épaule': 'shoulder',
  'Bas (devant)': 'front bottom',
  'Bas (dos)': 'back bottom',
  'Capuche (dos)': 'hood back',
  'Poche kangourou': 'kangaroo pocket',
  'Col': 'collar',
  'Poche poitrine': 'chest pocket',
  'Cuisse (côté)': 'thigh side',
  'Bas de jambe': 'lower leg',
  'Poche arrière': 'back pocket',
  'Ceinture': 'waistband',
  'Devant (bas)': 'front lower',
  'Étiquette de cou': 'neck tag',
  'Étiquette de col': 'neck tag',
  "Étiquette d'ourlet": 'hem label',
  'Ourlet': 'hem',
};

/** Une annotation (étiquette/logo) sur le vêtement : lettre A, B, C... avec image et dimensions */
export interface TechPackLabelAnnotation {
  letter: string;
  imageUrl?: string | null;
  widthIn: number;
  heightIn: number;
  placement: string;
  type: string;
  /** Si true, affiché dans le panneau NECK TAG en haut à droite */
  isNeckTag?: boolean;
  /** Position sur la vue (0-100 %), pour tracer la ligne vers la lettre */
  positionFront?: { x: number; y: number };
  positionBack?: { x: number; y: number };
}

/** Échantillon de couleur avec code HEX */
export interface TechPackColorSwatch {
  hex: string;
  label?: string;
}

/** Modèle tech pack type SPEED DEMON : grille avec SPECIFICATION, Tailles, THUMBNAIL, LOGOS (A devant, B dos, C...), DESIGNER, MANUFACTURER, COLOR SWATCHES */
export interface TechPackSpeedDemon {
  designName: string;
  fabric: string;
  category: string;
  issueNo: string;
  inDate: string;
  outDate: string;
  /** Type de mockup (T-shirt, Hoodie, etc.) pour les placements et dimensions */
  mockupType?: string;
  /** Saison (ex. SS25, FW24) */
  season?: string;
  /** Tailles souhaitées (S, M, L, XL, etc.) - affichées avec tableau dimensions */
  sizes?: string[];
  /** Dimensions par taille (tableau complet : longueur, tourPoitrine, etc.) */
  dimensionsBySize?: Record<string, Record<string, number>>;
  /** Type de produit pour les libellés de dimensions (tshirt, hoodie, pantalon, etc.) */
  productTypeKey?: string;
  /** Type d'impression (sérigraphie, broderie, etc.) */
  printType?: string;
  mainLogoUrl?: string | null;
  frontDesignUrl?: string | null;
  frontDesignWidthIn: number;
  frontDesignHeightIn: number;
  /** Logos/designs : A=devant, B=dos, C...=supplémentaires. Chaque un a placement + dimensions. */
  labels: TechPackLabelAnnotation[];
  designerLogoUrl?: string | null;
  designerName?: string | null;
  manufacturer?: string | null;
  colorSwatches: TechPackColorSwatch[];
}

/** Tech pack visuel : structure hyper détaillée pour fournisseurs */
export interface TechPackVisual {
  productImageUrl?: string;
  flatSketchFrontUrl?: string;
  flatSketchBackUrl?: string;
  measurementsTable?: { size: string; measurements: Record<string, number> }[];
  materials: { name: string; composition?: string; weight?: string; ref?: string }[];
  trims?: { name: string; ref?: string; placement?: string }[];
  constructionNotes?: string;
  printSpec?: {
    placement: string;
    width: number;
    height: number;
    technique: string;
    colors: string[];
  };
  labeling?: string;
  packaging?: string;
  compliance?: string;
  /** Modèle SPEED DEMON (fiche grille avec annotations A/B) */
  speedDemon?: TechPackSpeedDemon;
}
