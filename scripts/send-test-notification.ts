
import { notifyAdmin } from '../lib/admin-notifications';

async function main() {
    console.log('🚀 Envoi d\'une notification de test...');

    try {
        await notifyAdmin({
            title: 'Test Manuel',
            message: 'Ceci est un test déclenché manuellement pour vérifier la liaison Telegram.',
            emoji: '🧪',
            type: 'system_error', // Using a type that exists
            priority: 'high',
            data: {
                timestamp: new Date().toISOString(),
                triggeredBy: 'Admin User'
            }
        });
        console.log('✅ Notification envoyée au système (Webhook appelé). Vérifiez Telegram !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi :', error);
    }
}

main();
