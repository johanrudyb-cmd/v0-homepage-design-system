import axios from 'axios';

const TEST_WEBHOOK_URL = 'http://localhost:5678/webhook-test/outfity-onboarding';

async function triggerTestWebhook() {
    console.log('🧪 Envoi d\'un événement de test direct vers n8n...');
    console.log(`🔗 URL de test : ${TEST_WEBHOOK_URL}`);

    try {
        const response = await axios.post(TEST_WEBHOOK_URL, {
            userId: 'test-direct-id-' + Math.floor(Math.random() * 1000),
            email: 'johan-test-direct@resend.dev',
            name: 'Johan Live Test',
            plan: 'pro'
        });

        console.log('✅ Événement envoyé avec succès !');
        console.log('📦 Réponse de n8n:', response.data);
        console.log('\n🚀 Regardez votre écran n8n, les nœuds devraient s\'allumer !');

    } catch (error: any) {
        console.error('❌ Erreur lors de l\'envoi au webhook de test :');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            console.error('\n💡 ASTUCE : Assurez-vous d\'avoir cliqué sur "Listen for test event" dans n8n avant de lancer ce script.');
        } else {
            console.error('Message:', error.message);
        }
    }
}

triggerTestWebhook();
