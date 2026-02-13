
import fetch from 'node-fetch';

async function testAsosImages() {
    // Une URL produit ASOS typique (T-shirt Nike par exemple)
    // On va essayer d'accéder à l'image comme le ferait le proxy

    const testImageUrl = 'https://images.asos-media.com/products/nike-club-unisex-t-shirt-in-white/202462660-1-white';
    // Ajoutons des paramètres typiques
    const fullUrl = `${testImageUrl}?$n_640w$&wid=513&fit=constrain`;

    console.log('Testing ASOS Image URL:', fullUrl);

    const headersVariants = [
        {
            name: 'No Headers',
            headers: {}
        },
        {
            name: 'Simulated Browser (Chrome)',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        },
        {
            name: 'Simulated Proxy (Current Fix)',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.asos.com/',
                'Accept': 'image/*'
            }
        },
        {
            name: 'Simulated Proxy (Old - Media Origin)',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://images.asos-media.com/',
                'Origin': 'https://images.asos-media.com'
            }
        }
    ];

    for (const variant of headersVariants) {
        try {
            console.log(`\n--- Testing: ${variant.name} ---`);
            const start = Date.now();
            const res = await fetch(fullUrl, { headers: variant.headers });
            const duration = Date.now() - start;

            console.log(`Status: ${res.status} ${res.statusText}`);
            console.log(`Content-Type: ${res.headers.get('content-type')}`);
            console.log(`Content-Length: ${res.headers.get('content-length')}`);
            console.log(`Duration: ${duration}ms`);

            if (!res.ok) {
                console.error('FAILED!');
            } else {
                console.log('SUCCESS!');
            }
        } catch (e) {
            console.error(`ERROR: ${e.message}`);
        }
    }
}

testAsosImages();
