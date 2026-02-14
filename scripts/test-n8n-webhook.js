const http = require('http');

const payload = {
    title: "L'intelligence artificielle au service de la création",
    slug: "ia-creation-mode-2024",
    excerpt: "Comment les nouveaux outils génératifs redéfinissent le métier de designer.",
    content: "L'IA n'est plus une fiction dans la mode. De la génération de motifs à l'optimisation des silhouettes, elle devient un outil standard. ### Un nouveau membre dans l'équipe créative. Les studios utilisent désormais des modèles personnalisés pour explorer des milliers de variations en quelques secondes. > L'IA ne crée pas l'âme d'une collection, elle en accélère la naissance.",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
    tags: ["IA", "Création", "Futur"],
    author: "OUTFITY Intelligence"
};

const body = JSON.stringify(payload);
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/blog/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-n8n-secret': 'bmad_n8n_secret_2024_ultra_secure'
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
        console.log('--- Test Webhook n8n (Réussi) ---');
        console.log('Status:', res.statusCode);
        console.log('Body:', responseBody);
    });
});

req.on('error', (e) => console.error(e));
req.write(body);
req.end();
