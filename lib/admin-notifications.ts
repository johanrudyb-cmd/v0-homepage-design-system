/**
 * Système de Notifications Admin
 * 
 * Centralise l'envoi d'alertes critiques et d'événements business vers l'administrateur
 * via un Webhook n8n (qui se chargera ensuite de la distribution sur WhatsApp/Telegram/Slack).
 * 
 * Usage:
 * await notifyAdmin({
 *   type: 'signup',
 *   title: 'Nouvel Utilisateur',
 *   message: 'Jean Dupont (jean@exemple.com) vient de s\'inscrire.',
 *   emoji: '👋',
 *   data: { email: 'jean@exemple.com', plan: 'free' }
 * });
 */

import { sanitizeErrorMessage } from '@/lib/utils';

// URL du Webhook de Production (à définir dans .env.local) ou localhost par défaut
const ADMIN_WEBHOOK_URL = process.env.ADMIN_NOTIFY_WEBHOOK_URL || 'http://localhost:5678/webhook/admin-notifications';

export type AdminNotificationType =
    | 'signup'      // Nouvel inscrit
    | 'subscription' // Nouvel abonnement payant
    | 'payment_fail' // Échec paiement
    | 'scrape_success' // Succès scraping
    | 'scrape_error'   // Erreur scraping
    | 'quota_warning'  // Quota IA faible
    | 'billing'        // Action manuelle facturation
    | 'system_error';  // Bug critique

export interface AdminNotificationPayload {
    type: AdminNotificationType;
    title: string;
    message: string;
    emoji?: string; // Emoji optionnel pour le titre
    data?: Record<string, any>; // Métadonnées techniques (JSON)
    priority?: 'low' | 'normal' | 'high' | 'critical';
}

/**
 * Envoie une notification à l'admin via n8n.
 * Ne bloque jamais l'exécution du code principal (fire & forget).
 */
export async function notifyAdmin(payload: AdminNotificationPayload): Promise<void> {
    // En local dev sans configuration, on log juste dans la console
    if (!process.env.ADMIN_NOTIFY_WEBHOOK_URL && process.env.NODE_ENV === 'development') {
        console.log(`[Admin Notify Mock] ${payload.emoji || '📢'} ${payload.title}: ${payload.message}`, payload.data);
        return;
    }

    try {
        // On nettoie le message pour éviter de fuiter des clés API ou raw errors
        const safeMessage = sanitizeErrorMessage(payload.message);

        // Envoi asynchrone (retourne la promesse pour permettre l'await si nécessaire)
        const fetchPromise = fetch(ADMIN_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-source': 'nextjs-backend',
                'x-env': process.env.NODE_ENV || 'development',
            },
            body: JSON.stringify({
                ...payload,
                message: safeMessage,
                timestamp: new Date().toISOString(),
            }),
        }).catch(err => {
            console.warn('[Admin Notify] Failed to send webhook:', err.message);
        });

        // Sauvegarde additionnelle en Base de Données (AdminLog)
        const dbPromise = (async () => {
            try {
                const { prisma } = await import('./prisma');
                await prisma.adminLog.create({
                    data: {
                        type: payload.type,
                        title: payload.title,
                        message: safeMessage,
                        level: payload.priority === 'critical' || payload.priority === 'high' ? 'error' : 'info',
                        metadata: (payload.data as any) || {},
                    }
                });
            } catch (dbErr) {
                console.warn('[Admin Notify] Failed to save to DB:', dbErr);
            }
        })();

        await Promise.allSettled([fetchPromise, dbPromise]);
    } catch (e) {
        console.warn('[Admin Notify] Unexpected error:', e);
    }
}
