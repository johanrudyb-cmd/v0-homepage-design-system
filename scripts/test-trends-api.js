const http = require('http');

async function testTrendsData() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/blog/trends-data',
        method: 'GET',
        headers: {
            'x-n8n-secret': 'bmad_n8n_secret_2024_ultra_secure'
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log('--- Test API Données de Tendances pour n8n ---');
            console.log('Status:', res.statusCode);
            if (res.statusCode === 200) {
                const data = JSON.parse(body);
                console.log('Données reçues (Aperçu) :');
                console.log(JSON.stringify(data, null, 2));
            } else {
                console.log('Erreur :', body);
            }
        });
    });

    req.on('error', (e) => console.error(e));
    req.end();
}

testTrendsData();
