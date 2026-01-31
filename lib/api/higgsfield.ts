/**
 * Client API Higgsfield
 * - Génération d'images à partir de texte (modèle soul/standard)
 * - API asynchrone : soumission puis polling du statut jusqu'à completion
 * @see https://docs.higgsfield.ai/
 */

const HIGGSFIELD_BASE_URL =
  process.env.HIGGSFIELD_API_URL || 'https://platform.higgsfield.ai';
const HIGGSFIELD_API_KEY = process.env.HIGGSFIELD_API_KEY;
const HIGGSFIELD_API_SECRET = process.env.HIGGSFIELD_API_SECRET;

function getAuthHeader(): string {
  if (!HIGGSFIELD_API_KEY) {
    throw new Error('HIGGSFIELD_API_KEY non configurée');
  }
  // Format Higgsfield : "Key api_key:api_secret"
  // Soit HIGGSFIELD_API_KEY="key:secret", soit HIGGSFIELD_API_KEY + HIGGSFIELD_API_SECRET
  const authValue = HIGGSFIELD_API_SECRET
    ? `${HIGGSFIELD_API_KEY}:${HIGGSFIELD_API_SECRET}`
    : HIGGSFIELD_API_KEY;
  return `Key ${authValue}`;
}

export function isHiggsfieldConfigured(): boolean {
  return !!HIGGSFIELD_API_KEY;
}

/** Réponse soumission (queued) */
interface HiggsfieldQueuedResponse {
  status: string;
  request_id: string;
  status_url: string;
  cancel_url?: string;
}

/** Réponse statut (completed) */
interface HiggsfieldStatusResponse {
  status: string;
  request_id?: string;
  status_url?: string;
  images?: Array<{ url: string }>;
  video?: { url: string };
}

/**
 * Génère une image produit à partir d'un prompt texte (API Higgsfield asynchrone).
 * Utilise le modèle higgsfield-ai/soul/standard.
 * @param prompt - Prompt en anglais (idéalement généré par GPT)
 * @param options - aspect_ratio (défaut 1:1), resolution (défaut 720p)
 * @returns URL de l'image générée
 */
export async function generateProductImage(
  prompt: string,
  options?: { aspect_ratio?: string; resolution?: string }
): Promise<string> {
  const auth = getAuthHeader();
  const modelId = 'higgsfield-ai/soul/standard';
  const url = `${HIGGSFIELD_BASE_URL}/${modelId}`;

  const body = {
    prompt,
    aspect_ratio: options?.aspect_ratio ?? '1:1',
    resolution: options?.resolution ?? '720p',
  };

  const submitRes = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text();
    throw new Error(`Higgsfield API (submit): ${submitRes.status} ${errText}`);
  }

  const queued = (await submitRes.json()) as HiggsfieldQueuedResponse;
  if (queued.status !== 'queued' || !queued.status_url) {
    throw new Error(`Higgsfield: réponse inattendue ${JSON.stringify(queued)}`);
  }

  const statusUrl = queued.status_url.startsWith('http')
    ? queued.status_url
    : `${HIGGSFIELD_BASE_URL}${queued.status_url.startsWith('/') ? '' : '/'}${queued.status_url}`;

  const maxAttempts = 60;
  const pollIntervalMs = 3000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, pollIntervalMs));

    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: auth, Accept: 'application/json' },
    });
    if (!statusRes.ok) {
      throw new Error(`Higgsfield API (status): ${statusRes.status}`);
    }

    const statusData = (await statusRes.json()) as HiggsfieldStatusResponse;

    if (statusData.status === 'completed') {
      const imageUrl = statusData.images?.[0]?.url;
      if (!imageUrl) throw new Error('Higgsfield: aucune image dans la réponse');
      return imageUrl;
    }

    if (statusData.status === 'failed' || statusData.status === 'nsfw') {
      throw new Error(`Higgsfield: génération ${statusData.status}`);
    }
  }

  throw new Error('Higgsfield: timeout (génération trop longue)');
}

export async function generateFlatSketch(prompt: string): Promise<string> {
  const fullPrompt = `Technical fashion flat sketch, ${prompt}, black and white, front and back view, professional, detailed`;
  return generateProductImage(fullPrompt, { aspect_ratio: '1:1' });
}

export async function generateVirtualTryOn(
  designUrl: string,
  garmentType: string,
  style?: string
): Promise<string> {
  const auth = getAuthHeader();
  const url = `${HIGGSFIELD_BASE_URL}/v1/images/virtual-tryon`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      designUrl,
      garmentType,
      style: style || 'realistic',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Higgsfield API error: ${(error as { message?: string }).message || response.statusText}`);
  }

  const data = (await response.json()) as { imageUrl?: string; url?: string };
  return data.imageUrl || data.url || '';
}

export async function generateVideo(
  script: string,
  avatarId?: string,
  designUrl?: string
): Promise<string> {
  const auth = getAuthHeader();
  const url = `${HIGGSFIELD_BASE_URL}/v1/videos/generate`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script,
      avatarId: avatarId || 'default-fashion-avatar',
      designUrl,
      duration: 15,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Higgsfield API error: ${(error as { message?: string }).message || response.statusText}`);
  }

  const data = (await response.json()) as { videoUrl?: string; url?: string };
  return data.videoUrl || data.url || '';
}
