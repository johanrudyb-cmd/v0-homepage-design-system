
const http = require('https');

// Fonction pour récupérer le HTML d'ASOS et choper une image
function getRealAsosImage() {
    return new Promise((resolve, reject) => {
        http.get('https://www.asos.com/fr/homme/', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                // Chercher une image asos-media
                const match = data.match(/https:\/\/images\.asos-media\.com\/[^"'\s\?]+/);
                if (match) resolve(match[0]);
                else reject('No image found on ASOS homepage');
            });
        }).on('error', reject);
    });
}

async function testUrl(url, headers, name) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        console.log(`\n--- Testing ${name} ---`);
        const res = await fetch(url, {
            headers,
            signal: controller.signal
        });
        clearTimeout(timeout);

        console.log(`Status: ${res.status}`);
        console.log(`Type: ${res.headers.get('content-type')}`);

        if (res.ok) console.log('✅ OK');
        else console.log('❌ FAIL');
    } catch (e) {
        console.log(`❌ ERROR: ${e.message}`);
    }
}

async function run() {
    try {
        console.log('Finding a valid ASOS image...');
        const imageUrl = await getRealAsosImage();
        console.log('Found:', imageUrl);

        await testUrl(imageUrl, {}, 'No Headers');

        await testUrl(imageUrl, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.asos.com/'
        }, 'With Referer: asos.com');

        await testUrl(imageUrl, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://images.asos-media.com/'
        }, 'With Referer: images.asos-media.com');

    } catch (e) {
        console.error(e);
    }
}

run();
