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
  count: number = 5
): Promise<string[]> {
  if (!openai) {
    throw new Error('ChatGPT API key not configured');
  }

  const scripts: string[] = [];

  for (let i = 0; i < count; i++) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en création de scripts UGC viraux pour marques de mode. 
          Crée des scripts de 15 secondes suivant la structure : 
          Problème → Solution → Preuve → CTA.
          Les scripts doivent être engageants, authentiques et adaptés à TikTok/Instagram.`,
        },
        {
          role: 'user',
          content: `Génère un script UGC viral pour la marque ${brandName}. 
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
