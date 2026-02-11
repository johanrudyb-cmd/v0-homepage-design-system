// Script de test pour déboguer l'authentification
const testAuth = async () => {
    const baseUrl = 'http://localhost:3000';

    console.log('🔍 DÉBOGAGE DE L\'AUTHENTIFICATION\n');
    console.log('='.repeat(60));

    // Test 1: Créer un utilisateur de test
    console.log('\n📝 Test 1: Création d\'un utilisateur de test');
    console.log('-'.repeat(60));

    const signupData = {
        name: 'Test Debug User',
        email: 'debug@test.com',
        password: 'TestDebug123!'
    };

    try {
        const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signupData)
        });

        const signupResult = await signupResponse.json();
        console.log('Status:', signupResponse.status);
        console.log('Réponse:', JSON.stringify(signupResult, null, 2));

        if (signupResponse.status === 400 && signupResult.error?.includes('déjà utilisé')) {
            console.log('✅ Utilisateur existe déjà, on continue avec la connexion');
        } else if (signupResponse.status === 201) {
            console.log('✅ Utilisateur créé avec succès');
        } else {
            console.log('❌ Erreur lors de la création');
        }
    } catch (error) {
        console.log('❌ Erreur réseau:', error.message);
    }

    // Test 2: Tester la connexion avec NextAuth
    console.log('\n🔐 Test 2: Connexion avec NextAuth');
    console.log('-'.repeat(60));

    try {
        const signinResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                email: signupData.email,
                password: signupData.password,
                callbackUrl: `${baseUrl}/dashboard`,
                json: 'true'
            }),
            redirect: 'manual'
        });

        console.log('Status:', signinResponse.status);
        console.log('Headers:', Object.fromEntries(signinResponse.headers.entries()));

        const responseText = await signinResponse.text();
        console.log('Réponse brute:', responseText);

        if (signinResponse.status === 200 || signinResponse.status === 302) {
            console.log('✅ Connexion réussie !');
            const cookies = signinResponse.headers.get('set-cookie');
            if (cookies) {
                console.log('🍪 Cookies reçus:', cookies.substring(0, 100) + '...');
            }
        } else {
            console.log('❌ Échec de la connexion');
            try {
                const errorData = JSON.parse(responseText);
                console.log('Détails erreur:', errorData);
            } catch (e) {
                console.log('Réponse non-JSON');
            }
        }
    } catch (error) {
        console.log('❌ Erreur réseau:', error.message);
    }

    // Test 3: Vérifier directement avec bcrypt
    console.log('\n🔬 Test 3: Vérification directe du hash bcrypt');
    console.log('-'.repeat(60));

    const bcrypt = require('bcryptjs');
    const testPassword = 'TestDebug123!';
    const hash = await bcrypt.hash(testPassword, 10);
    const isValid = await bcrypt.compare(testPassword, hash);

    console.log('Mot de passe:', testPassword);
    console.log('Hash généré:', hash);
    console.log('Vérification:', isValid ? '✅ OK' : '❌ ERREUR');

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RÉSUMÉ');
    console.log('Email de test:', signupData.email);
    console.log('Mot de passe:', signupData.password);
    console.log('\n💡 Vérifiez les logs du serveur pour voir les messages [Auth]');
};

// Exécuter le test
testAuth().catch(console.error);
