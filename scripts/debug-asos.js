
// Simple script to test ASOS image accessibility using Node.js fetching
// No TS needed, use native fetch (Available in Node 18+)

// URL d'exemple (ASOS image)
const testImageUrl = 'https://images.asos-media.com/products/collusion-unisex-logo-t-shirt-in-white/204862464-1-white';
// Ajout params
const fullUrl = `${testImageUrl}?$n_640w$&wid=513&fit=constrain`;

console.log('Testing ASOS Image URL:', fullUrl);

async function runTests() {
    const variants = [
        {
            name: '1. No Headers (Direct)',
            headers: {}
        },
        {
            name: '2. Browser Simulation (Chrome)',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        },
        {
            name: '3. Proxy Fix (Referer: asos.com)',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.asos.com/',
                'Accept': 'image/*'
            }
        },
        {
            name: '4. Old Proxy (Referer: asos-media)',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://images.asos-media.com/',
                'Origin': 'https://images.asos-media.com'
            }
        }
    ];

    for (const variant of variants) {
        console.log(`\n--- Testing: ${variant.name} ---`);
        try {
            const start = Date.now();
            const res = await fetch(fullUrl, { headers: variant.headers });
            const duration = Date.now() - start;

            console.log(`Status: ${res.status} ${res.statusText}`);
            console.log(`Content-Type: ${res.headers.get('content-type')}`);
            console.log(`Duration: ${duration}ms`);

            if (res.ok) {
                console.log('✅ SUCCESS');
            } else {
                console.log('❌ FAILED');
            }
        } catch (e) {
            console.log('❌ ERROR:', e.message);
        }
    }
}

runTests();
