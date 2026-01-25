// Higgsfield API Client
// Note: Adapter selon la documentation officielle Higgsfield

const HIGGSFIELD_API_URL =
  process.env.HIGGSFIELD_API_URL || 'https://api.higgsfield.ai';
const HIGGSFIELD_API_KEY = process.env.HIGGSFIELD_API_KEY;

if (!HIGGSFIELD_API_KEY) {
  console.warn(
    'HIGGSFIELD_API_KEY not configured. Higgsfield features will be disabled.'
  );
}

export async function generateFlatSketch(prompt: string): Promise<string> {
  if (!HIGGSFIELD_API_KEY) {
    throw new Error('Higgsfield API key not configured');
  }

  // Adapter selon API Higgsfield réelle
  const response = await fetch(`${HIGGSFIELD_API_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HIGGSFIELD_API_KEY}`,
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
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Higgsfield API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.imageUrl || data.url; // Adapter selon format réponse
}

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
      Authorization: `Bearer ${HIGGSFIELD_API_KEY}`,
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
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Higgsfield API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.imageUrl || data.url;
}

export async function generateVideo(
  script: string,
  avatarId?: string,
  designUrl?: string
): Promise<string> {
  if (!HIGGSFIELD_API_KEY) {
    throw new Error('Higgsfield API key not configured');
  }

  // Phase 2 - Vidéos IA
  const response = await fetch(`${HIGGSFIELD_API_URL}/v1/videos/generate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HIGGSFIELD_API_KEY}`,
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
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Higgsfield API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.videoUrl || data.url;
}
