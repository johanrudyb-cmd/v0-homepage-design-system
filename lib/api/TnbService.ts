/**
 * Client API The New Black – génération de visuels mode & try-on.
 * @see https://thenewblack.ai/clothing_fashion_api_integrations
 *
 * IMPORTANT :
 * - Ne jamais exposer la clé API au frontend.
 * - Utiliser uniquement côté serveur (routes API / actions server).
 */

import FormDataNode from 'form-data';
import { Readable } from 'stream';

const TNB_BASE_URL = 'https://thenewblack.ai/api/1.1/wf';

function getApiKey(): string {
  const key = process.env.NEWBLACK_API_KEY ?? process.env.TNB_API_KEY ?? process.env.THE_NEW_BLACK_API_KEY;
  if (!key) {
    throw new Error('Clé API The New Black manquante (NEWBLACK_API_KEY, TNB_API_KEY ou THE_NEW_BLACK_API_KEY).');
  }
  return key;
}

/** Paramètres pour la génération de vêtement / outfit. */
export interface GenerateClothingParams {
  /** Description complète de la tenue / vêtement. */
  outfit: string;
  /** 'man' ou 'woman' (valeurs attendues par l’API). */
  gender: 'man' | 'woman';
  /** Pays (ex. 'Italy') – influence le type de modèle. */
  country: string;
  /** Âge du modèle (nombre, ≥ 20). */
  age: number;
  /** Type de corps optionnel (ex. 'plus'). */
  body_type?: string;
  /** Ratio d’image : '1:1', '9:16', '16:9', '2:3', '3:2'. */
  ratio: '1:1' | '9:16' | '16:9' | '2:3' | '3:2';
  /** Description du fond (ex. 'NYC street'). */
  background?: string;
  /** Négatif prompt : ce qu’on NE veut PAS dans l’image. */
  negative?: string;
}

/**
 * Appelle l’endpoint /clothing de The New Black pour générer un visuel à partir d’un prompt.
 * Retourne l’URL de l’image générée (telle que renvoyée par l’API).
 */
export async function generateClothing(params: GenerateClothingParams): Promise<string> {
  const apiKey = getApiKey();
  const url = `${TNB_BASE_URL}/clothing?api_key=${encodeURIComponent(apiKey)}`;

  // Utiliser form-data comme dans la documentation officielle (curl --form)
  const form = new FormDataNode();
  
  // Nettoyer et ajouter les champs requis (tous en string pour form-data)
  form.append('outfit', String(params.outfit || '').trim());
  form.append('gender', String(params.gender || 'woman').trim());
  form.append('country', String(params.country || 'France').trim());
  form.append('age', String(params.age || 25));
  form.append('ratio', String(params.ratio || '1:1').trim());
  
  // Ajouter les champs optionnels seulement s'ils sont définis et non vides
  if (params.body_type && String(params.body_type).trim()) {
    form.append('body_type', String(params.body_type).trim());
  }
  if (params.background && String(params.background).trim()) {
    form.append('background', String(params.background).trim());
  }
  if (params.negative && String(params.negative).trim()) {
    form.append('negative', String(params.negative).trim());
  }

  // Convertir le FormData en Buffer (plus fiable que stream pour fetch)
  const headers = form.getHeaders();
  
  console.log('[TnbService] Envoi requête form-data à:', url.replace(/api_key=[^&]+/, 'api_key=[REDACTED]'));
  console.log('[TnbService] Content-Type:', headers['content-type']);

  // Lire tout le stream dans un Buffer
  const formBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    form.on('data', (chunk: Buffer | string) => {
      // form-data peut envoyer des strings ou des Buffers
      const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, 'utf8');
      chunks.push(bufferChunk);
    });
    
    form.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    
    form.on('error', reject);
    
    // Important: appeler resume() pour démarrer le stream
    form.resume();
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: formBuffer,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // Log pour debug (sans exposer la clé API)
    console.error('[TnbService] Erreur API The New Black:', {
      status: res.status,
      statusText: res.statusText,
      errorBody: text.substring(0, 500), // Limiter la taille du log
      paramsSummary: {
        outfitLength: params.outfit.length,
        gender: params.gender,
        country: params.country,
        age: params.age,
        ratio: params.ratio,
        hasBackground: !!params.background,
        hasNegative: !!params.negative,
      },
    });
    throw new Error(`The New Black /clothing error ${res.status}: ${text || res.statusText}`);
  }

  // L’API renvoie typiquement une URL brute (string).
  const resultText = (await res.text()).trim();
  if (!resultText) {
    throw new Error('The New Black /clothing: réponse vide.');
  }
  return resultText;
}

/** Paramètres pour le try-on virtuel. */
export interface VirtualTryOnParams {
  /** URL publique de la photo du vêtement. */
  clothing_photo: string;
  /** URL publique de la photo du modèle. */
  model_photo: string;
}

/**
 * Appelle l’endpoint /vto_stream de The New Black pour un virtual try-on.
 * Retourne la réponse brute (souvent une URL ou un token de stream).
 */
export async function virtualTryOn(params: VirtualTryOnParams): Promise<string> {
  const apiKey = getApiKey();
  const url = `${TNB_BASE_URL}/vto_stream?api_key=${encodeURIComponent(apiKey)}`;

  const form = new FormData();
  form.append('clothing_photo', params.clothing_photo);
  form.append('model_photo', params.model_photo);

  const res = await fetch(url, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`The New Black /vto_stream error ${res.status}: ${text || res.statusText}`);
  }

  const resultText = (await res.text()).trim();
  if (!resultText) {
    throw new Error('The New Black /vto_stream: réponse vide.');
  }
  return resultText;
}

/** Vérifie simplement si la clé API TNB est configurée. */
export function isTnbConfigured(): boolean {
  return !!(process.env.NEWBLACK_API_KEY || process.env.TNB_API_KEY || process.env.THE_NEW_BLACK_API_KEY);
}

