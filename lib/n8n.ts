/**
 * Client n8n étendu pour OUTFITY
 * Permet de déclencher des workflows via Webhooks
 */

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';

interface N8nWebhookPayload {
  [key: string]: unknown;
}

interface N8nTriggerResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Déclenche un workflow n8n via webhook
 * Le call est fire-and-forget par défaut (ne bloque pas la response Next.js)
 */
export async function triggerN8nWorkflow(
  webhookPath: string,
  payload: N8nWebhookPayload,
  options: { waitForResponse?: boolean; timeout?: number } = {}
): Promise<N8nTriggerResult> {
  const { waitForResponse = false, timeout = 5000 } = options;
  // Gérer le cas où webhookPath contient déjà le préfixe ou l'URL complète
  let url = webhookPath.startsWith('http')
    ? webhookPath
    : `${N8N_BASE_URL}/${webhookPath.replace(/^\//, '')}`;

  try {
    if (waitForResponse) {
      // Mode synchrone : attend la réponse de n8n
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeout),
      });

      if (!response.ok) {
        throw new Error(`n8n webhook returned ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } else {
      // Mode fire-and-forget : n'attend pas la réponse
      // On ne met pas de await ici volontairement
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeout),
      }).catch((err) => {
        console.warn(`[n8n Trigger] Webhook ${webhookPath} fire-and-forget error:`, err.message);
      });

      return { success: true };
    }
  } catch (error: any) {
    console.error(`[n8n Trigger] Erreur webhook ${webhookPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Déclenche la séquence d'onboarding pour un nouvel utilisateur
 * Workflow: 02-email-onboarding.json
 */
export async function triggerOnboarding(user: {
  userId: string;
  email: string;
  name?: string;
  plan?: string;
}) {
  return triggerN8nWorkflow('outfity-onboarding', {
    userId: user.userId,
    email: user.email,
    name: user.name || 'Créateur',
    plan: user.plan || 'free',
  });
}

/**
 * Envoie une notification multi-canal via n8n
 * Workflow: 04-notifications-multicanal.json
 */
export async function triggerNotification(params: {
  userId: string;
  email: string;
  name?: string;
  eventType: 'trend_alert' | 'design_ready' | 'factory_match' | 'payment_success' | 'weekly_report';
  data?: Record<string, unknown>;
}) {
  return triggerN8nWorkflow('outfity-notify', {
    userId: params.userId,
    email: params.email,
    name: params.name || 'Créateur',
    eventType: params.eventType,
    data: params.data || {},
  });
}

/**
 * Synchro Stripe : transmet un événement Stripe à n8n
 * Workflow: 05-sync-stripe.json
 */
export async function triggerStripeSync(event: {
  type: string;
  data: { object: Record<string, unknown> };
}) {
  return triggerN8nWorkflow('outfity-stripe-webhook', {
    type: event.type,
    eventType: event.type,
    data: event.data,
  });
}

/**
 * Alias pour compatibilité existante
 */
export const triggerN8nWebhook = async (webhookPath: string, data: Record<string, unknown>) => {
  const result = await triggerN8nWorkflow(webhookPath, data, { waitForResponse: true });
  return result.success ? result.data : null;
};

export function isN8nConfigured(): boolean {
  return !!process.env.N8N_WEBHOOK_URL;
}
