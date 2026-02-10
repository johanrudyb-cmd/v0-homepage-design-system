/**
 * Client n8n pour déclencher des workflows depuis votre app
 */

const N8N_API_URL = process.env.N8N_API_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

interface TriggerWorkflowOptions {
  workflowId: string;
  data: Record<string, unknown>;
}

/**
 * Déclencher un workflow n8n via API
 */
export async function triggerN8nWorkflow({ workflowId, data }: TriggerWorkflowOptions) {
  if (!N8N_API_URL || !N8N_API_KEY) {
    console.warn('[n8n] API URL ou Key non configurée');
    return null;
  }

  try {
    const response = await fetch(`${N8N_API_URL}/api/v1/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY,
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[n8n] Erreur lors du déclenchement du workflow:', error);
    return null;
  }
}

/**
 * Déclencher un workflow via webhook (plus simple et recommandé)
 * 
 * @param webhookPath - Le chemin du webhook (ex: "stripe-purchase", "new-user")
 * @param data - Les données à envoyer au workflow
 * @returns La réponse du workflow ou null en cas d'erreur
 * 
 * @example
 * ```typescript
 * await triggerN8nWebhook('stripe-purchase', {
 *   userId: 'user_123',
 *   amount: 2999,
 *   plan: 'pro'
 * });
 * ```
 */
export async function triggerN8nWebhook(webhookPath: string, data: Record<string, unknown>) {
  if (!N8N_WEBHOOK_URL) {
    console.warn('[n8n] Webhook URL non configurée. Ajoutez N8N_WEBHOOK_URL dans vos variables d\'environnement.');
    return null;
  }

  try {
    const url = `${N8N_WEBHOOK_URL}/${webhookPath}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n webhook error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[n8n] Erreur webhook:', error);
    return null;
  }
}

/**
 * Vérifier si n8n est configuré
 */
export function isN8nConfigured(): boolean {
  return !!(N8N_WEBHOOK_URL || (N8N_API_URL && N8N_API_KEY));
}
