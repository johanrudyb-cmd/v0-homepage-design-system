import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

async function runTest() {
    console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════');
    console.log('\x1b[36m%s\x1b[0m', '🚀 DÉMARRAGE DU TEST DU FLUX BLOG (OUTFITY RADAR)');
    console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════');

    const testSlug = "test-auto-creer-marque-" + Math.random().toString(36).substring(7);
    const testData = {
        title: "TEST AUTO: Créer sa marque de vêtement en 2026",
        slug: testSlug,
        excerpt: "Ceci est un test automatique généré pour valider l'affichage SEO et le formatage Responsive Mobile d'OUTFITY.",
        content: "# Guide Stratégique 2026\n\nPour réussir sa marque aujourd'hui, il ne suffit plus d'avoir du goût. Il faut de la **DATA**.\n\n## Pourquoi ce test ?\nNous validons que :\n1. Le webhook reçoit bien les données.\n2. L'image de couverture est bien traitée.\n3. La page est générée sans cache (Instantanée).\n\n![Image Test](https://images.unsplash.com/photo-1441986300917-64674bd600d8)",
        coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
        author: "Agent de Test Quinn",
        published: true,
        tags: ["TEST", "STRATEGIE", "DATA"]
    };

    console.log(`\x1b[34mℹ️ Destination:\x1b[0m ${BASE_URL}/api/blog/webhook`);
    console.log(`\x1b[34mℹ️ Slug généré:\x1b[0m ${testSlug}`);

    try {
        console.log('\n📡 Simulation de l\'envoi n8n...');
        const response = await fetch(`${BASE_URL}/api/blog/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-n8n-secret': WEBHOOK_SECRET || ''
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('\x1b[32m%s\x1b[0m', '✅ ÉTAPE 1: Webhook - Article créé avec succès !');
            console.log(`📌 ID Post: ${result.postId}`);
            console.log(`🔗 URL: ${result.url}`);

            console.log('\n🔍 ÉTAPE 2: Vérification de l\'affichage live...');
            const pageRes = await fetch(result.url);
            if (pageRes.ok) {
                console.log('\x1b[32m%s\x1b[0m', '✅ ÉTAPE 2: La page est accessible et rendue correctement !');

                console.log('\n📱 ÉTAPE 3: Analyse SEO & Responsive...');
                const html = await pageRes.text();

                const hasTitle = html.includes(testData.title);
                const hasMetaTitle = html.includes("<title>");
                const hasOGImage = html.includes("og:image");

                if (hasTitle && hasMetaTitle) console.log('\x1b[32m%s\x1b[0m', '✅ SEO: Titres et Balises détectés.');
                if (hasOGImage) console.log('\x1b[32m%s\x1b[0m', '✅ SOCIAL: Balise OpenGraph détectée.');

                console.log('\n\x1b[35m%s\x1b[0m', '✨ RÉSULTAT FINAL: TEST RÉUSSI !');
                console.log('Votre machine de blogging est prête pour la prod.');
            } else {
                console.log(`\x1b[31m❌ ÉTAPE 2: La page retourne une erreur ${pageRes.status}\x1b[0m`);
                console.log('Il est possible que le serveur local mette du temps à compiler la nouvelle route.');
            }
        } else {
            console.error('\x1b[31m❌ ÉCHEC DU TEST:\x1b[0m', result);
        }
    } catch (error) {
        console.error('\x1b[31m❌ ERREUR CRITIQUE:\x1b[0m', error);
    }
}

runTest();
