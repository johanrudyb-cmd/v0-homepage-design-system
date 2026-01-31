import OpenAI from 'openai';

if (!process.env.CHATGPT_API_KEY) {
  console.warn('CHATGPT_API_KEY not configured. ChatGPT features will be disabled.');
}

const openai = process.env.CHATGPT_API_KEY
  ? new OpenAI({
      apiKey: process.env.CHATGPT_API_KEY,
    })
  : null;

export async function generateUGCScripts(
  brandName: string,
  productDescription: string,
  count: number = 5,
  tone: string = 'décontracté',
  brandIdentity?: {
    colorPalette?: any;
    typography?: any;
    styleGuide?: any;
  }
): Promise<string[]> {
  if (!openai) {
    throw new Error('ChatGPT API key not configured');
  }

  const scripts: string[] = [];

  // Construire le prompt avec identité de marque
  let identityContext = '';
  if (brandIdentity) {
    if (brandIdentity.colorPalette) {
      const colors = typeof brandIdentity.colorPalette === 'object'
        ? Object.entries(brandIdentity.colorPalette).map(([key, value]) => `${key}: ${value}`).join(', ')
        : '';
      if (colors) {
        identityContext += `Couleurs de la marque : ${colors}. `;
      }
    }
    if (brandIdentity.styleGuide) {
      identityContext += `Style guide : ${JSON.stringify(brandIdentity.styleGuide)}. `;
    }
  }

  const toneInstructions: Record<string, string> = {
    décontracté: 'Ton décontracté, authentique, proche des jeunes',
    professionnel: 'Ton professionnel et élégant',
    streetwear: 'Ton streetwear, urbain, cool',
    luxe: 'Ton luxe, premium, sophistiqué',
    fun: 'Ton fun, énergique, positif',
  };

  for (let i = 0; i < count; i++) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en création de scripts UGC viraux pour marques de mode. 
          Crée des scripts de 15 secondes suivant la structure : 
          Problème → Solution → Preuve → CTA.
          Les scripts doivent être engageants, authentiques et adaptés à TikTok/Instagram.
          ${toneInstructions[tone] || toneInstructions.décontracté}.`,
        },
        {
          role: 'user',
          content: `Génère un script UGC viral pour la marque ${brandName}. 
          ${identityContext}
          Produit : ${productDescription}.
          Le script doit être en français, captivant et suivre les hooks viraux du moment.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    const script = completion.choices[0]?.message?.content;
    if (script) {
      scripts.push(script);
    }
  }

  return scripts;
}

export async function generateTechPack(designData: {
  type: string;
  cut: string;
  details: object;
  material: string;
}): Promise<object> {
  if (!openai) {
    throw new Error('ChatGPT API key not configured');
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Tu es un expert en tech packs de mode. 
        Génère un tech pack professionnel au format JSON avec tous les composants nécessaires.`,
      },
      {
        role: 'user',
        content: `Génère un tech pack pour :
        - Type : ${designData.type}
        - Coupe : ${designData.cut}
        - Détails : ${JSON.stringify(designData.details)}
        - Matière : ${designData.material}
        
        Format JSON avec : tissuPrincipal, bordCote, etiquettes, boutons, fermetures, etc.`,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to generate tech pack');
  }

  return JSON.parse(content);
}

export async function enhancePrompt(
  userInput: string,
  context: { type: string; style: string }
): Promise<string> {
  if (!openai) {
    throw new Error('ChatGPT API key not configured');
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Tu es un assistant pour créer des prompts optimaux pour génération d'images de mode. 
        Améliore les prompts utilisateurs pour obtenir de meilleurs résultats.`,
      },
      {
        role: 'user',
        content: `Améliore ce prompt pour génération d'image de mode :
        "${userInput}"
        
        Contexte : Type ${context.type}, Style ${context.style}.
        Le prompt doit être détaillé, précis et optimisé pour génération IA.`,
      },
    ],
    temperature: 0.5,
    max_tokens: 200,
  });

  return completion.choices[0]?.message?.content || userInput;
}

export interface TrendsAnalysisInput {
  byCountry: Array<{ country: string | null; count: number }>;
  byStyle: Array<{ style: string | null; count: number }>;
  byProductType: Array<{ productType: string; count: number }>;
  topTrends?: Array<{ productName: string; productType: string; style: string | null; country: string | null; confirmationScore: number }>;
}

/** Génère une analyse IA des tendances : prévisions pour la France, tendances à venir, recommandations. */
export async function generateTrendsAnalysis(data: TrendsAnalysisInput): Promise<string> {
  if (!openai) {
    throw new Error('ChatGPT API key not configured');
  }

  const summary = [
    'Statistiques par pays: ' + (data.byCountry?.map((s) => `${s.country || '—'}: ${s.count}`).join(', ') || 'aucune'),
    'Statistiques par style: ' + (data.byStyle?.map((s) => `${s.style || '—'}: ${s.count}`).join(', ') || 'aucune'),
    'Statistiques par type de produit: ' + (data.byProductType?.map((s) => `${s.productType}: ${s.count}`).join(', ') || 'aucune'),
  ].join('\n');

  const topTrendsText = data.topTrends?.length
    ? 'Tendances principales: ' + data.topTrends.slice(0, 15).map((t) => `${t.productName} (${t.productType}${t.style ? `, ${t.style}` : ''}${t.country ? `, ${t.country}` : ''}, score ${t.confirmationScore})`).join(' ; ')
    : '';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Tu es un expert en tendances mode et retail en France et en Europe.
Tu analyses des données de tendances (produits détectés chez plusieurs marques) et tu rédiges des analyses courtes, structurées et actionnables.
Réponds en français, avec des paragraphes clairs. Inclus notamment :
1. Les tendances à venir en France (ce qui monte, ce qui va cartonner).
2. Des prévisions à 6–12 mois sur les styles, coupes et catégories.
3. Des recommandations concrètes pour les marques et créateurs.`,
      },
      {
        role: 'user',
        content: `À partir des données suivantes, rédige une analyse approfondie des tendances (prévisions France, tendances à venir, recommandations).\n\n${summary}\n${topTrendsText ? '\n' + topTrendsText : ''}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 1200,
  });

  return completion.choices[0]?.message?.content || 'Aucune analyse générée.';
}

/** Entrée pour une analyse individuelle d’un produit / tendance */
export interface ProductTrendInput {
  productName: string;
  productType: string;
  cut?: string | null;
  material?: string | null;
  color?: string | null;
  style?: string | null;
  country?: string | null;
  brands: string[];
  averagePrice: number;
  confirmationScore: number;
}

/** Génère une analyse IA pour un seul produit : potentiel en France, positionnement, recommandations. */
export async function generateProductTrendAnalysis(product: ProductTrendInput): Promise<string> {
  if (!openai) {
    throw new Error('ChatGPT API key not configured');
  }

  const desc = [
    `Produit : ${product.productName}`,
    `Type : ${product.productType}`,
    product.cut ? `Coupe : ${product.cut}` : null,
    product.material ? `Matière : ${product.material}` : null,
    product.color ? `Couleur : ${product.color}` : null,
    product.style ? `Style : ${product.style}` : null,
    product.country ? `Pays : ${product.country}` : null,
    `Marques où il est présent : ${product.brands.join(', ')}`,
    `Prix moyen : ${product.averagePrice.toFixed(2)} €`,
    `Score de confirmation : ${product.confirmationScore}/5`,
  ]
    .filter(Boolean)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Tu es un expert en tendances mode et retail en France.
Tu analyses un produit (tendance détectée chez plusieurs marques) et tu rédiges une analyse courte et actionnable, en français.
Inclus : potentiel de ce produit en France, positionnement par rapport au marché, et 2–3 recommandations concrètes (création, prix, cible).`,
      },
      {
        role: 'user',
        content: `Analyse ce produit et donne une analyse individuelle (potentiel France, positionnement, recommandations).\n\n${desc}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 600,
  });

  return completion.choices[0]?.message?.content || 'Aucune analyse générée.';
}

/** Génère un prompt texte pour générer une image produit (à envoyer à Higgsfield). */
export async function generateProductImagePrompt(product: {
  productName: string;
  productType: string;
  cut?: string | null;
  material?: string | null;
  color?: string | null;
  style?: string | null;
}): Promise<string> {
  if (!openai) {
    throw new Error('ChatGPT API key not configured');
  }

  const desc = [
    product.productName,
    product.productType,
    product.cut ?? '',
    product.material ?? '',
    product.color ?? '',
    product.style ?? '',
  ]
    .filter(Boolean)
    .join(', ');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Tu es un expert en visuels mode. Tu génères un prompt court en anglais pour une IA de génération d'image (type FLUX / DALL-E).
Le prompt doit décrire UNE PHOTO DE PRODUIT MODE : vêtement ou accessoire, sur mannequin ou flat lay, fond neutre, lumière professionnelle, style e-commerce.
Réponds UNIQUEMENT par le prompt, sans phrase d'intro. 1 à 2 lignes max. Exemple: "Professional product photography of a [type] [cut] [material], [color], [style], on white background, studio lighting, 8k".`,
      },
      {
        role: 'user',
        content: `Génère un prompt pour une image produit : ${desc}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 150,
  });

  const prompt = completion.choices[0]?.message?.content?.trim();
  if (!prompt) throw new Error('Aucun prompt généré');
  return prompt;
}

/** Entrée pour l’analyse tendance + prompt image (après scrape) */
export interface TrendEnrichmentInput {
  productName: string;
  productType: string;
  cut?: string | null;
  material?: string | null;
  color?: string | null;
  style?: string | null;
  brands: string[];
  averagePrice: number;
  confirmationScore: number;
  country?: string | null;
}

/** Réponse structurée : conseils tendance, note 1-10, prompt pour image Higgsfield */
export interface TrendEnrichmentResult {
  advice: string;
  rating: number;
  imagePrompt: string;
}

/**
 * À partir des infos scrapées d’une tendance, GPT renvoie :
 * - conseils sur la tendance (bon ou pas, recommandations),
 * - une note 1-10 (potentiel),
 * - un prompt court en anglais pour générer l’image du vêtement (Higgsfield).
 */
export async function generateTrendAdviceAndImagePrompt(
  product: TrendEnrichmentInput
): Promise<TrendEnrichmentResult> {
  if (!openai) {
    throw new Error('ChatGPT API key not configured');
  }

  const desc = [
    `Produit : ${product.productName}`,
    `Type : ${product.productType}`,
    product.cut ? `Coupe : ${product.cut}` : null,
    product.material ? `Matière : ${product.material}` : null,
    product.color ? `Couleur : ${product.color}` : null,
    product.style ? `Style : ${product.style}` : null,
    `Présent chez ${product.brands.length} marques (score ${product.confirmationScore})`,
    `Prix moyen : ${product.averagePrice.toFixed(2)} €`,
    product.country ? `Marché : ${product.country}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Tu es un expert en tendances mode et retail en France.
À partir des infos d'un produit détecté chez plusieurs marques (données scrapées), tu dois répondre en JSON strict avec exactement 3 champs :
- "advice" : 2 à 4 phrases en français. Conseils sur la tendance : est-ce une bonne tendance à suivre ou à éviter, pourquoi, recommandations concrètes (cible, prix, positionnement).
- "rating" : un nombre entier entre 1 et 10 (10 = tendance très forte à suivre, 1 = à éviter).
- "imagePrompt" : une seule phrase en anglais pour générer une photo produit e-commerce (vêtement sur fond neutre, lumière pro, style catalogue). Exemple : "Professional product photography of a [type] [cut] [material], [color], on white background, studio lighting, 8k".

Réponds UNIQUEMENT par un objet JSON valide, sans markdown ni texte autour.`,
      },
      {
        role: 'user',
        content: `Analyse cette tendance et renvoie advice, rating et imagePrompt.\n\n${desc}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 400,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Réponse GPT vide');

  let parsed: { advice?: string; rating?: number; imagePrompt?: string };
  try {
    parsed = JSON.parse(raw) as { advice?: string; rating?: number; imagePrompt?: string };
  } catch {
    throw new Error('Réponse GPT invalide (JSON attendu)');
  }

  const advice = typeof parsed.advice === 'string' ? parsed.advice.trim() : '';
  const rating = typeof parsed.rating === 'number'
    ? Math.min(10, Math.max(1, Math.round(parsed.rating)))
    : 5;
  const imagePrompt = typeof parsed.imagePrompt === 'string' ? parsed.imagePrompt.trim() : '';

  if (!advice || !imagePrompt) {
    throw new Error('Réponse GPT incomplète (advice et imagePrompt requis)');
  }

  return { advice, rating, imagePrompt };
}

/** Résultat de l’analyse visuelle IA (Trend Radar Hybride - GPT-4o) */
export interface VisualTaggingResult {
  cut: string;
  attributes: {
    materialVisible?: string;
    collarType?: string;
    colorExact?: string;
    [key: string]: string | undefined;
  };
  trendScoreVisual: number;
  productSignature: string;
}

/**
 * Analyse visuelle d’un produit (image + titre) avec GPT-4o.
 * Identifie coupe, attributs clés (matière, col, couleur) et score de tendance.
 */
export async function analyzeProductImage(
  imageUrl: string,
  title: string
): Promise<VisualTaggingResult> {
  if (!openai) {
    throw new Error('ChatGPT API key not configured');
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Tu es un expert mode. Analyse cette image produit (e-commerce) et le titre suivant.

Titre: "${title}"

Réponds en JSON strict avec exactement ces champs:
- "cut": la coupe (ex: Boxy, Slim, Oversized, Regular, Wide Leg). Une seule valeur.
- "attributes": objet avec "materialVisible" (matière visible), "collarType" (type de col si visible), "colorExact" (couleur exacte).
- "trendScoreVisual": nombre entre 0 et 100, score de tendance basé sur la récurrence visuelle actuelle (100 = très tendance).
- "productSignature": une chaîne normalisée pour le matching multi-zones, ex: "veste-sans-manche_cargo" ou "hoodie_oversized_coton". Pas d'espaces, minuscules, tirets. Résume le type de vêtement + coupe + 1-2 attributs clés.

Réponds UNIQUEMENT par un objet JSON valide, sans markdown.`,
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
    max_tokens: 300,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Réponse GPT-4o vide');

  let parsed: {
    cut?: string;
    attributes?: Record<string, string>;
    trendScoreVisual?: number;
    productSignature?: string;
  };
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    throw new Error('Réponse GPT-4o invalide (JSON attendu)');
  }

  const cut = typeof parsed.cut === 'string' ? parsed.cut.trim() : 'Regular';
  const attributes = parsed.attributes && typeof parsed.attributes === 'object' ? parsed.attributes : {};
  const trendScoreVisual = typeof parsed.trendScoreVisual === 'number'
    ? Math.min(100, Math.max(0, Math.round(parsed.trendScoreVisual)))
    : 50;
  const productSignature = typeof parsed.productSignature === 'string'
    ? parsed.productSignature.replace(/\s+/g, '-').toLowerCase().slice(0, 120)
    : `${cut}-${Object.values(attributes).filter(Boolean).join('-')}`.replace(/\s+/g, '-').toLowerCase().slice(0, 120);

  return {
    cut,
    attributes,
    trendScoreVisual,
    productSignature: productSignature || 'unknown',
  };
}

/**
 * Génère une analyse business pour une tendance multi-zones (Trend Radar Hybride).
 * Ex: "Le marché US sature sur ce produit, opportunité de lancement immédiat sur le marché EU."
 */
export async function generateBusinessAnalysisForZones(
  productName: string,
  zones: string[],
  trendScoresByZone: Record<string, number>
): Promise<string> {
  if (!openai) {
    throw new Error('ChatGPT API key not configured');
  }

  const zonesList = zones.join(', ');
  const scoresText = Object.entries(trendScoresByZone)
    .map(([z, s]) => `${z}: ${s}/100`)
    .join(' ; ');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Tu es un expert retail mode mondial. En 1 à 3 phrases courtes, rédige une "Analyse Business" exploitable pour un décideur : saturation par zone, opportunité de lancement (ex: "Le marché US sature sur ce produit, opportunité de lancement immédiat sur le marché EU."). Réponds en français.`,
      },
      {
        role: 'user',
        content: `Produit : ${productName}. Zones où la tendance est présente : ${zonesList}. Scores tendance par zone : ${scoresText}. Génère l'analyse business.`,
      },
    ],
    max_tokens: 200,
    temperature: 0.5,
  });

  return completion.choices[0]?.message?.content?.trim() || 'Aucune analyse.';
}

export function isChatGptConfigured(): boolean {
  return !!process.env.CHATGPT_API_KEY;
}

/** Teste que la clé API GPT répond (appel minimal). */
export async function testGptConnection(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!openai) {
    return { ok: false, error: 'CHATGPT_API_KEY non configurée' };
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'user', content: 'Réponds uniquement par : OK' },
      ],
      max_tokens: 10,
      temperature: 0,
    });
    const text = completion.choices[0]?.message?.content?.trim() || '';
    return text ? { ok: true } : { ok: false, error: 'Réponse vide' };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}
