/**
 * Génération de design vêtement par IA (Ideogram).
 * Si Claude est configuré (et pas de cadre logo), Claude génère le prompt à partir du contexte
 * (identité, inspiration utilisateur, etc.), puis Ideogram génère l'image.
 */

import { generateDesignImage } from '@/lib/api/ideogram';
import {
  isClaudeConfigured,
  generateGarmentDesignPrompt,
  type GarmentDesignPromptContext,
} from '@/lib/api/claude';
import { getTechnicalStyleKeywords } from '@/lib/brand-style-keywords';

export interface GenerateGarmentDesignInput {
  /** Nom de la marque */
  brand_name: string;
  /** Marque d'inspiration (ex. template de stratégie) */
  inspiration_brand?: string;
  /** Cible (ex. 18-25 ans, urbain) */
  target_audience?: string;
  /** Positionnement / style de positionnement */
  positioning_style?: string;
  /** Style visuel (streetwear, premium, etc.) */
  preferred_style?: string;
  /** Couleurs (hex) et typo pour respecter l'identité */
  visual_identity?: {
    colorPalette?: { primary?: string; secondary?: string; accent?: string };
    typography?: { heading?: string; body?: string };
  };
  /** Texte à afficher par emplacement — l'IA ne doit utiliser QUE ce texte, jamais en inventer */
  text_by_placement: Record<string, string>;
  /** Liste des emplacements (ex. ["Poitrine (centre)", "Dos"]) */
  placement_list: string[];
  /** Couleur du vêtement (hex) pour le contraste */
  garment_color_hex?: string;
  /** Mots-clés de style demandés par l'utilisateur */
  design_style_keywords?: string;
  /** Éléments à éviter dans le design */
  design_avoid?: string;
  /** Inspiration / "ce que j'aimerais" — utilisé par Claude pour enrichir le prompt Ideogram */
  design_inspiration?: string;
  /** Générer un cadre pour logo (sans texte dans l'image) */
  use_logo_frame?: boolean;
  /** Description du cadre (si use_logo_frame) */
  frame_description?: string;
}

export interface GenerateGarmentDesignResultSingle {
  imageUrl: string;
  prompt: string;
  rationale?: string;
}

export interface GenerateGarmentDesignResultMultiple {
  designs: Array<{ placement: string; imageUrl: string; rationale: string; prompt: string }>;
  imageUrl: string;
}

export type GenerateGarmentDesignResult =
  | GenerateGarmentDesignResultSingle
  | GenerateGarmentDesignResultMultiple;

export function isGenerateGarmentDesignResultMultiple(
  r: GenerateGarmentDesignResult
): r is GenerateGarmentDesignResultMultiple {
  return 'designs' in r && Array.isArray((r as GenerateGarmentDesignResultMultiple).designs);
}

function garmentColorDescription(hex: string): string {
  const h = hex.replace(/^#/, '').toLowerCase();
  if (h === 'ffffff' || h === 'fff') return 'white';
  if (h === '000000' || h === '000' || h === '1a1a1a' || h === '2d2d2d') return 'black or dark';
  if (['f5f5f5', 'e5e5e5', 'e7e5e4', 'd6d3d1'].includes(h)) return 'light grey';
  if (['6b7280', '374151', '44403c'].includes(h)) return 'grey';
  if (['1e3a5f', '2563eb'].includes(h)) return 'blue';
  if (['14532d', '166534'].includes(h)) return 'green';
  if (['7c3aed', '6d28d9'].includes(h)) return 'purple';
  if (['b91c1c', 'dc2626'].includes(h)) return 'red';
  if (['c2410c', 'ea580c'].includes(h)) return 'orange';
  if (['78350f', 'c19a6b'].includes(h)) return 'brown';
  if (['be185d'].includes(h)) return 'pink';
  return 'garment color';
}

function isLightColor(hex: string): boolean {
  const h = hex.replace(/^#/, '').trim();
  if (h.length === 3) {
    const r = parseInt(h[0]! + h[0], 16),
      g = parseInt(h[1]! + h[1], 16),
      b = parseInt(h[2]! + h[2], 16);
    return (r + g + b) / 3 >= 200;
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16),
      g = parseInt(h.slice(2, 4), 16),
      b = parseInt(h.slice(4, 6), 16);
    return (r + g + b) / 3 >= 200;
  }
  return false;
}

function placementToPromptTerm(p: string): string {
  const lower = p.toLowerCase();
  if (lower.includes('dos') && lower.includes('complet')) return 'full back';
  if (lower.includes('dos')) return 'back';
  if (lower.includes('manche')) return 'sleeve';
  if (lower.includes('poitrine') || lower.includes('face')) return 'front chest';
  if (lower.includes('capuche')) return 'hood';
  if (lower.includes('poche')) return 'pocket';
  if (lower.includes('épaule')) return 'shoulder';
  if (lower.includes('col')) return 'collar';
  if (lower.includes('ceinture')) return 'waistband';
  if (lower.includes('cuisse') || lower.includes('jambe')) return 'leg';
  if (lower.includes('bas')) return 'hem area';
  return 'garment';
}

/**
 * Indications style × emplacement : adapter le design au style enregistré (ex. streetwear = dos souvent illustratif).
 * Le texte reste strictement celui fourni ; seul le rendu visuel s’adapte.
 */
function getStylePlacementHint(placement: string, preferredStyle: string): string {
  const style = (preferredStyle || '').toLowerCase();
  const placementLower = placement.toLowerCase();
  const isBack = placementLower.includes('dos');
  const isChest = placementLower.includes('poitrine') || placementLower.includes('face');
  const isSleeve = placementLower.includes('manche');

  if (isBack && (style.includes('streetwear') || style.includes('street wear') || style.includes('urban'))) {
    return 'STYLE: Large back print. Use ONLY the exact quoted text below — one single text block, bold typography, high impact. No second line. No block of small text. No decorative text. No gibberish. Professional garment print only.';
  }
  if (isBack && (style.includes('premium') || style.includes('luxe') || style.includes('minimal'))) {
    return 'STYLE: Back print, clean and typographic. Same exact quoted text only, one block, elegant and readable. No extra text or decoration.';
  }
  if (isChest && style.includes('streetwear')) {
    return 'STYLE: Streetwear chest — only the exact quoted text, bold typography. No extra words.';
  }
  if (isSleeve && style.includes('streetwear')) {
    return 'STYLE: Sleeve print — same exact quoted text only, compact and bold. No extra text.';
  }
  return '';
}

/** Pour l’emplacement Dos : un seul bloc de texte, pas de gibberish ni 2e ligne. */
function getOneBlockOnlyRule(placement: string): string {
  const placementLower = placement.toLowerCase();
  if (placementLower.includes('dos')) {
    return 'CRITICAL: The image must show exactly ONE text block — the quoted text only. No second line. No block of small text. No jumbled letters. No gibberish. No paragraph. Professional, clean print like the chest design.';
  }
  return '';
}

const NEGATIVE_PROMPT_TEXT =
  'lorem ipsum, placeholder, gibberish, fake text, slogan, tagline, watermark, subtitle, caption, text above, text below, text around, text beside, secondary line, extra line, second line, small text, block of text, block of small text, decorative text, paragraph, jumbled text, random letters, nonsensical text, invented text, misspelling, typo, wrong letters, wrong accents, spelling mistake, extra word, additional text, any word or letter not in the user-provided text';

/** Pour forcer un style illustration/design : pas de photo de vêtement ni rendu réaliste (les visages/figures en illustration restent autorisés). */
const NEGATIVE_PROMPT_NO_GARMENT =
  'photorealistic clothing, photograph of garment, real garment, clothing mockup, realistic fabric, photographic, hyperrealistic, photo of person wearing clothes, 3D render of clothing, worn garment';

/**
 * Construit le bloc stratégie pour le prompt Ideogram.
 * Force l'isolation du design (fond transparent, pas de mockup) et l'usage strict du texte saisi.
 */
function buildBrandStrategyBlock(input: GenerateGarmentDesignInput): string {
  const {
    brand_name,
    inspiration_brand,
    target_audience,
    positioning_style,
    preferred_style = 'streetwear',
    visual_identity,
    garment_color_hex,
    design_style_keywords,
    design_avoid,
  } = input;

  const identityTypography =
    visual_identity?.typography?.heading || visual_identity?.typography?.body
      ? `Typography: ${[visual_identity.typography?.heading, visual_identity.typography?.body].filter(Boolean).join(', ')}. Use this font style only.`
      : '';
  const palette = visual_identity?.colorPalette;
  const identityColors =
    palette && (palette.primary || palette.secondary || palette.accent)
      ? `Colors (use ONLY these hex for text and graphics): ${[palette.primary, palette.secondary, palette.accent].filter(Boolean).join(', ')}.`
      : '';
  const identityBlock = [identityTypography, identityColors].filter(Boolean).join(' ');

  let garmentColorPrompt = '';
  if (garment_color_hex) {
    const desc = garmentColorDescription(garment_color_hex);
    const isLight = isLightColor(garment_color_hex);
    const contrastRule = isLight
      ? ' CRITICAL: The garment is white or light. The design MUST be in black, dark grey, or bold dark colors — NEVER white or same as the garment.'
      : ' CRITICAL: The garment is dark. The design MUST be in white, light, or bright contrasting colors.';
    garmentColorPrompt = `Garment color: ${desc} (hex ${garment_color_hex}). Design must have strong contrast.${contrastRule}`;
  }

  const positioningLabel = positioning_style?.trim() || preferred_style;
  const targetLabel = target_audience?.trim() || 'the brand audience';
  const styleRule =
    `CRITICAL — DESIGN STYLE: The style of the design MUST automatically be the one of the brand's positioning for its target. Positioning: ${positioningLabel}. Target audience: ${targetLabel}. The visual (typography, composition, mood, references) must reflect this positioning and speak to this target — not a generic or unrelated style.`;
  const parts = [
    '--- BRAND & STRATEGY (use ONLY these, do not invent anything) ---',
    `Brand name: ${brand_name}.`,
    inspiration_brand ? `Inspiration brand: ${inspiration_brand}.` : '',
    positioning_style ? `Positioning: ${positioning_style}.` : '',
    target_audience ? `Target audience: ${target_audience}.` : '',
    styleRule,
    'Creative, gallery-quality merchandise design. Adapt to placement. The only words in the design must be the user\'s text — exact spelling and characters; you may add graphic or illustrative elements that support the text.',
    identityBlock ? `Visual identity: ${identityBlock}` : '',
    garmentColorPrompt,
    design_style_keywords ? `Style requested by user (apply strictly): ${design_style_keywords}.` : '',
    design_avoid ? `AVOID in the design (forbidden): ${design_avoid}.` : '',
    '--- END BRAND & STRATEGY ---',
  ].filter(Boolean);

  return parts.join(' ');
}

/**
 * Qualité créative type galerie Ideogram : designs merchandise pro, typo stylisée, composition bold.
 * Les seuls mots affichés restent le texte fourni ; le rendu peut être créatif (typo custom, éléments graphiques autour du texte).
 */
const CREATIVE_QUALITY_HINT =
  'Create a professional, creative merchandise graphic like high-quality t-shirt designs (Ideogram gallery style). The quoted text must be transcribed in the visual — it must appear as readable text (or stylized lettering) in the design. Stylized typography, custom lettering, bold composition. You may add graphic or illustrative elements that frame or support the text — but the text must be legibly present in the image. No other words. Distinctive, memorable, not generic.';

/**
 * Règles de prompt : isolation du design + le texte doit être retranscrit dans le visuel + aucun mot inventé.
 */
const ISOLATION_AND_TEXT_RULES = [
  'Transparent background, PNG with alpha channel. No white or colored background fill.',
  'CRITICAL: The image must NEVER show the garment, the body, the placement zone, or any mockup. Only the flat sticker/graphic on an empty or transparent background.',
  'CRITICAL — TEXT IN VISUAL: The quoted text MUST be transcribed and visible in the image. It must appear as readable text (or stylized lettering) in the design — do not replace it with an illustration or omit it. The only words in the image must be the exact text given in quotes, copied CHARACTER FOR CHARACTER. Do NOT add any other word. You may use stylized typography and graphic elements that support the text — but the text must be legibly present in the visual.',
  'The image must be print-ready artwork. No garment, t-shirt, mannequin, or product. Bold, high contrast, professional merchandise quality.',
].join(' ');

function getTextForPlacement(
  placement: string,
  textByPlacement: Record<string, string>,
  fallback: string
): string {
  const t = textByPlacement[placement]?.trim();
  return t || fallback;
}

/** Construit le contexte pour Claude (un emplacement). */
function buildClaudeContext(
  input: GenerateGarmentDesignInput,
  placement: string,
  textForPlacement: string
): GarmentDesignPromptContext {
  const technical_style_keywords = getTechnicalStyleKeywords(input.inspiration_brand);
  return {
    brand_name: input.brand_name,
    inspiration_brand: input.inspiration_brand,
    technical_style_keywords,
    target_audience: input.target_audience,
    positioning_style: input.positioning_style,
    preferred_style: input.preferred_style,
    visual_identity: input.visual_identity,
    placement,
    text_for_this_placement: textForPlacement,
    garment_color_hex: input.garment_color_hex,
    design_style_keywords: input.design_style_keywords,
    design_avoid: input.design_avoid,
    design_inspiration: input.design_inspiration,
  };
}

/**
 * Génère un ou plusieurs designs vêtement via Ideogram.
 * - Récupère les données stratégie (brand_name, inspiration_brand, target_audience, positioning_style).
 * - Les mappe dans un template de prompt Ideogram.
 * - Force l'isolation du design (fond transparent, pas de mockup).
 * - Règle stricte : l'IA n'utilise QUE le texte saisi dans "Texte pour [Emplacement]", jamais de mots inventés.
 */
export async function generateGarmentDesign(
  input: GenerateGarmentDesignInput
): Promise<GenerateGarmentDesignResult> {
  const brandStrategyBlock = buildBrandStrategyBlock(input);
  const placementList = input.placement_list.length ? input.placement_list : ['Poitrine (centre)'];
  const fallbackText = input.brand_name;
  const onlyTheDrawing = ISOLATION_AND_TEXT_RULES;
  const transparentInstruction =
    'Transparent background, PNG with alpha channel. No white or colored background fill.';

  const useClaudePrompt = !input.use_logo_frame && isClaudeConfigured();

  /** Un prompt par emplacement : chaque image est générée avec un prompt dédié à cet emplacement uniquement (pas de "Part X of Y" ni référence aux autres). */
  if (placementList.length > 1) {
    const designs: Array<{ placement: string; imageUrl: string; rationale: string; prompt: string }> = [];
    const preferredStyle = input.preferred_style ?? 'streetwear';
    for (let i = 0; i < placementList.length; i++) {
      const placement = placementList[i]!;
      const textForPlacement = getTextForPlacement(
        placement,
        input.text_by_placement,
        fallbackText
      );

      let prompt: string;
      let transparent = true;
      let aspectRatio = '1:1';
      if (input.use_logo_frame) {
        const frameDesc = input.frame_description?.trim() || 'Geometric or abstract border.';
        prompt = `${brandStrategyBlock} Create a single minimalist decorative frame or border graphic with an empty center for a logo (for garment print). Flat graphic only, no garment. ${onlyTheDrawing} No text in the image. Square 1:1. ${transparentInstruction} Decorative elements: ${frameDesc}`;
      } else if (useClaudePrompt) {
        const context = buildClaudeContext(input, placement, textForPlacement);
        const claudeResult = await generateGarmentDesignPrompt(context);
        // Enrichir le prompt Claude avec instruction de fond transparent pour stickers
        prompt = `${claudeResult.prompt} ${transparentInstruction}`;
        // Toujours transparent pour les stickers (même si Claude mentionne "solid white" comme référence)
        transparent = true;
        aspectRatio = '1:1';
      } else {
        prompt = `${brandStrategyBlock} ${CREATIVE_QUALITY_HINT} OUTPUT — This text must be transcribed in the visual: "${textForPlacement}". It must appear as readable text in the image (stylized typography allowed). Do not replace it with an illustration or omit it. Copy character for character; no other words. One coherent text block. Flat graphic illustration only, no garment. Style must reflect brand positioning and target audience. ${onlyTheDrawing} Square 1:1. ${transparentInstruction} REMINDER: The text "${textForPlacement}" must be visible and legible in the design.`;
      }

      const imageUrl = await generateDesignImage(prompt, {
        aspect_ratio: aspectRatio,
        transparent,
        negative_prompt: input.use_logo_frame ? undefined : `${NEGATIVE_PROMPT_TEXT} ${NEGATIVE_PROMPT_NO_GARMENT}`,
      });

      const positioning = input.positioning_style || '—';
      const target = input.target_audience || '—';
      const rationale = `Design aligné avec votre stratégie (positionnement: ${positioning}, cible: ${target}).`;

      designs.push({ placement, imageUrl, rationale, prompt });
    }

    return {
      designs,
      imageUrl: designs[0]!.imageUrl,
    };
  }

  const placement = placementList[0] ?? 'Poitrine (centre)';
  const preferredStyle = input.preferred_style ?? 'streetwear';
  const textSingle = getTextForPlacement(placement, input.text_by_placement, fallbackText);

  let prompt: string;
  let transparent = true;
  let aspectRatio = '1:1';
  if (input.use_logo_frame) {
    const frameDesc = input.frame_description?.trim() || 'Geometric or abstract border only.';
    prompt = `${brandStrategyBlock} Create a single minimalist decorative frame or border graphic with an empty center for a logo (for garment print). Flat graphic only, no garment. ${onlyTheDrawing} No text in the image. Square 1:1, clean vector style. ${transparentInstruction} Decorative elements: ${frameDesc}`;
  } else if (useClaudePrompt) {
    const context = buildClaudeContext(input, placement, textSingle);
    const claudeResult = await generateGarmentDesignPrompt(context);
    // Enrichir le prompt Claude avec instruction de fond transparent pour stickers
    prompt = `${claudeResult.prompt} ${transparentInstruction}`;
    // Toujours transparent pour les stickers (même si Claude mentionne "solid white" comme référence)
    transparent = true;
    aspectRatio = '1:1';
  } else {
    prompt = `${brandStrategyBlock} ${CREATIVE_QUALITY_HINT} OUTPUT — This text must be transcribed in the visual: "${textSingle}". It must appear as readable text in the image (stylized typography allowed). Do not replace it with an illustration or omit it. Copy character for character; no other words. One coherent text block. Flat graphic illustration only, no garment. Style must reflect brand positioning and target audience. ${onlyTheDrawing} Square 1:1. ${transparentInstruction} REMINDER: The text "${textSingle}" must be visible and legible in the design.`;
  }

  const imageUrl = await generateDesignImage(prompt, {
    aspect_ratio: aspectRatio,
    transparent,
    negative_prompt: input.use_logo_frame ? undefined : `${NEGATIVE_PROMPT_TEXT} ${NEGATIVE_PROMPT_NO_GARMENT}`,
  });

  const positioning = input.positioning_style || '—';
  const target = input.target_audience || '—';
  const rationale = `Design aligné avec votre stratégie (positionnement: ${positioning}, cible: ${target}).`;

  return { imageUrl, prompt, rationale };
}
