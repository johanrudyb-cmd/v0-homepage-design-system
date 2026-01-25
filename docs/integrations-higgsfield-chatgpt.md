# Intégrations IA - ChatGPT & Higgsfield

*Document créé via BMAD-Method - Architect*

## Vue d'Ensemble

Ce document détaille l'intégration de **ChatGPT** et **Higgsfield** pour l'application SaaS.

---

## ChatGPT API

### Usage dans l'Application

**Fonctionnalités** :
- Génération scripts UGC (15 secondes)
- Génération noms de marques
- Génération descriptions produits
- Assistance prompts (Design Studio)

### Configuration

```typescript
// lib/api/chatgpt.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY, // Ou OPENAI_API_KEY
  // Optionnel : organisation
  // organization: process.env.OPENAI_ORG_ID,
});
```

### Fonctions Principales

#### 1. Génération Scripts UGC

```typescript
export async function generateUGCScripts(
  brandName: string,
  productDescription: string,
  count: number = 5
): Promise<string[]> {
  const scripts = [];
  
  for (let i = 0; i < count; i++) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // ou "gpt-4-turbo" pour meilleure performance
      messages: [
        {
          role: "system",
          content: `Tu es un expert en création de scripts UGC viraux pour marques de mode. 
          Crée des scripts de 15 secondes suivant la structure : 
          Problème → Solution → Preuve → CTA.
          Les scripts doivent être engageants, authentiques et adaptés à TikTok/Instagram.`
        },
        {
          role: "user",
          content: `Génère un script UGC viral pour la marque ${brandName}. 
          Produit : ${productDescription}.
          Le script doit être en français, captivant et suivre les hooks viraux du moment.`
        }
      ],
      temperature: 0.8, // Créativité
      max_tokens: 200,
    });
    
    scripts.push(completion.choices[0].message.content || '');
  }
  
  return scripts;
}
```

#### 2. Génération Noms de Marques

```typescript
export async function generateBrandNames(
  description: string,
  style: string,
  count: number = 5
): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Tu es un expert en naming de marques de mode. 
        Génère des noms créatifs, mémorables et disponibles.`
      },
      {
        role: "user",
        content: `Génère ${count} noms de marques pour : ${description}, style ${style}. 
        Les noms doivent être en français, courts (1-3 mots), mémorables.`
      }
    ],
    temperature: 0.9,
    max_tokens: 150,
  });
  
  // Parser les noms (séparés par virgules ou retours à la ligne)
  const names = completion.choices[0].message.content
    ?.split(/[,\n]/)
    .map(n => n.trim())
    .filter(n => n.length > 0)
    .slice(0, count) || [];
  
  return names;
}
```

#### 3. Génération Tech Pack (Composants)

```typescript
export async function generateTechPack(designData: {
  type: string;
  cut: string;
  details: object;
  material: string;
}): Promise<object> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Tu es un expert en tech packs de mode. 
        Génère un tech pack professionnel au format JSON avec tous les composants nécessaires.`
      },
      {
        role: "user",
        content: `Génère un tech pack pour :
        - Type : ${designData.type}
        - Coupe : ${designData.cut}
        - Détails : ${JSON.stringify(designData.details)}
        - Matière : ${designData.material}
        
        Format JSON avec : tissuPrincipal, bordCote, etiquettes, boutons, fermetures, etc.`
      }
    ],
    temperature: 0.3, // Plus précis pour tech packs
    response_format: { type: "json_object" }, // Force JSON
  });
  
  return JSON.parse(completion.choices[0].message.content || '{}');
}
```

#### 4. Assistance Prompts (Design Studio)

```typescript
export async function enhancePrompt(
  userInput: string,
  context: { type: string; style: string }
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Tu es un assistant pour créer des prompts optimaux pour génération d'images de mode. 
        Améliore les prompts utilisateurs pour obtenir de meilleurs résultats.`
      },
      {
        role: "user",
        content: `Améliore ce prompt pour génération d'image de mode :
        "${userInput}"
        
        Contexte : Type ${context.type}, Style ${context.style}.
        Le prompt doit être détaillé, précis et optimisé pour génération IA.`
      }
    ],
    temperature: 0.5,
    max_tokens: 200,
  });
  
  return completion.choices[0].message.content || userInput;
}
```

### Coûts Estimés

**ChatGPT API (GPT-4)** :
- Input : ~$0.03 / 1K tokens
- Output : ~$0.06 / 1K tokens

**Exemple** :
- Script UGC : ~200 tokens → ~$0.02 par script
- Nom marque : ~150 tokens → ~$0.015 par nom
- Tech Pack : ~500 tokens → ~$0.05 par tech pack

**Estimation mensuelle MVP** :
- 1000 scripts : ~$20
- 500 noms : ~$7.5
- 200 tech packs : ~$10
- **Total** : ~$40-50/mois (MVP)

---

## Higgsfield API

### Usage dans l'Application

**Fonctionnalités** :
- Génération Flat Sketch (designs techniques)
- Virtual Try-On (images mannequin)
- Vidéos IA (Phase 2)

### Configuration

```typescript
// lib/api/higgsfield.ts
// Note: Adapter selon la documentation officielle Higgsfield

const HIGGSFIELD_API_URL = process.env.HIGGSFIELD_API_URL || 'https://api.higgsfield.ai';
const HIGGSFIELD_API_KEY = process.env.HIGGSFIELD_API_KEY;

if (!HIGGSFIELD_API_KEY) {
  console.warn('Higgsfield API key not configured. Design features will be disabled.');
}
```

### Fonctions Principales

#### 1. Génération Flat Sketch

```typescript
export async function generateFlatSketch(prompt: string): Promise<string> {
  if (!HIGGSFIELD_API_KEY) {
    throw new Error('Higgsfield API key not configured');
  }

  // Adapter selon API Higgsfield réelle
  const response = await fetch(`${HIGGSFIELD_API_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HIGGSFIELD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `Technical fashion flat sketch, ${prompt}, black and white, front and back view, professional, detailed`,
      width: 1024,
      height: 1024,
      model: 'fashion-flat-sketch', // À adapter selon modèles disponibles
      negative_prompt: 'color, colored, illustration, cartoon',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Higgsfield API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.imageUrl || data.url; // Adapter selon format réponse
}
```

#### 2. Virtual Try-On

```typescript
export async function generateVirtualTryOn(
  designUrl: string,
  garmentType: string,
  style?: string
): Promise<string> {
  if (!HIGGSFIELD_API_KEY) {
    throw new Error('Higgsfield API key not configured');
  }

  const response = await fetch(`${HIGGSFIELD_API_URL}/v1/images/virtual-tryon`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HIGGSFIELD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      designUrl, // URL du design/logo à appliquer
      garmentType, // T-shirt, Hoodie, etc.
      style: style || 'realistic', // realistic, fashion, etc.
      model: 'virtual-tryon', // À adapter
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Higgsfield API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.imageUrl || data.url;
}
```

#### 3. Vidéos IA (Phase 2)

```typescript
export async function generateVideo(
  script: string,
  avatarId?: string,
  designUrl?: string
): Promise<string> {
  if (!HIGGSFIELD_API_KEY) {
    throw new Error('Higgsfield API key not configured');
  }

  const response = await fetch(`${HIGGSFIELD_API_URL}/v1/videos/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HIGGSFIELD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script,
      avatarId: avatarId || 'default-fashion-avatar',
      designUrl, // Optionnel : design à afficher dans la vidéo
      duration: 15, // secondes
      model: 'video-generation', // À adapter
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Higgsfield API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.videoUrl || data.url;
}
```

### Coûts Estimés

**Note** : Les coûts Higgsfield dépendent de leur pricing. À vérifier avec leur documentation.

**Estimation (à valider)** :
- Image (Flat Sketch) : ~$0.01-0.05 par image
- Virtual Try-On : ~$0.02-0.10 par image
- Vidéo (15s) : ~$0.50-2.00 par vidéo

**Estimation mensuelle MVP** :
- 500 Flat Sketches : ~$25
- 200 Virtual Try-On : ~$20
- **Total** : ~$45-50/mois (MVP)

---

## Intégration dans l'Application

### API Route Example

```typescript
// app/api/designs/generate/route.ts
import { generateFlatSketch } from '@/lib/api/higgsfield';
import { generateTechPack } from '@/lib/api/chatgpt';
import { queue } from '@/lib/queue';

export async function POST(request: Request) {
  const body = await request.json();
  const { brandId, type, cut, details, material } = body;
  
  // Validation
  // ...
  
  // Créer job dans queue
  const job = await queue.add('generate-design', {
    brandId,
    type,
    cut,
    details,
    material,
  });
  
  return Response.json({ jobId: job.id, status: 'queued' });
}

// Worker
// workers/design-generator.ts
import { generateFlatSketch } from '@/lib/api/higgsfield';
import { generateTechPack } from '@/lib/api/chatgpt';

export async function processDesignGeneration(job: Job) {
  const { brandId, type, cut, details, material } = job.data;
  
  // Générer prompt optimisé avec ChatGPT
  const prompt = await enhancePrompt(
    `${type}, ${cut}, ${JSON.stringify(details)}`,
    { type, style: 'professional' }
  );
  
  // Générer Flat Sketch avec Higgsfield
  const flatSketchUrl = await generateFlatSketch(prompt);
  
  // Générer Tech Pack avec ChatGPT
  const techPack = await generateTechPack({ type, cut, details, material });
  
  // Sauvegarder dans PostgreSQL
  await prisma.design.create({
    data: {
      brandId,
      type,
      flatSketchUrl,
      techPack,
      prompt,
      status: 'completed',
    },
  });
  
  // Notification client (WebSocket ou polling)
}
```

---

## Variables d'Environnement

```bash
# .env.example

# ChatGPT (OpenAI)
CHATGPT_API_KEY="sk-xxx" # Ou OPENAI_API_KEY
# Optionnel
OPENAI_ORG_ID="org-xxx"

# Higgsfield
HIGGSFIELD_API_KEY="xxx"
HIGGSFIELD_API_URL="https://api.higgsfield.ai" # À adapter selon URL réelle
```

---

## Documentation à Consulter

1. **ChatGPT API** : https://platform.openai.com/docs
2. **Higgsfield API** : Documentation officielle (à obtenir)

---

## Notes Importantes

⚠️ **Higgsfield** : 
- Documentation API à vérifier (URL, endpoints, format)
- Modèles disponibles à identifier
- Pricing à confirmer
- Rate limits à connaître

✅ **ChatGPT** :
- Documentation complète disponible
- Pricing connu
- Rate limits documentés

---

**Document créé par** : Architect (Alex) via BMAD-Method  
**Date** : 2025-01-23  
**Status** : À adapter selon documentation Higgsfield réelle
