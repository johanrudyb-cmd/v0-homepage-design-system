import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth/signup';

async function testSignupFlow() {
    const testEmail = `test-johan-${Math.floor(Math.random() * 10000)}@resend.dev`;

    console.log('🚀 Démarrage du test d\'inscription...');
    console.log(`📧 Email de test : ${testEmail}`);

    try {
        const response = await axios.post(API_URL, {
            name: 'Johan Test',
            email: testEmail,
            password: 'Password123!'
        });

        console.log('✅ Inscription réussie !');
        console.log('📦 Réponse API:', response.data);
        console.log('\n--- PROCHAINES ÉTAPES ---');
        console.log('1. Allez sur votre dashboard n8n : http://localhost:5678');
        console.log('2. Vérifiez l\'onglet "Executions" du workflow "Emails Onboarding".');
        console.log('3. Allez sur Resend : https://resend.com/emails pour voir le mail partir.');

    } catch (error: any) {
        console.error('❌ Erreur lors du test :');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
    }
}

testSignupFlow();
