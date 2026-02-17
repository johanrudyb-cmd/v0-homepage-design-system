import { HYBRID_RADAR_SOURCES } from './lib/hybrid-radar-sources';
import { scrapeHybridSource } from './lib/hybrid-radar-scraper';

async function testScrapers() {
    console.log('--- TEST RUN: ZALANDO PARIS (WOMEN) ---');
    const zalandoParis = HYBRID_RADAR_SOURCES.find(s => s.id === 'zalando-trend-femme-paris');
    if (zalandoParis) {
        try {
            const results = await scrapeHybridSource(zalandoParis);
            console.log(`Zalando Result: Found ${results.length} items.`);
            if (results.length > 0) {
                console.log('Sample Item:', JSON.stringify(results[0], null, 2));
            }
        } catch (e) {
            console.error('Zalando Test Failed:', e);
        }
    }

    console.log('\n--- TEST RUN: ASOS 18-24 (WOMEN) ---');
    const asosUS = HYBRID_RADAR_SOURCES.find(s => s.id === 'asos-18-24-femme');
    if (asosUS) {
        try {
            const results = await scrapeHybridSource(asosUS);
            console.log(`ASOS Result: Found ${results.length} items.`);
            if (results.length > 0) {
                console.log('Sample Item:', JSON.stringify(results[0], null, 2));
            }
        } catch (e) {
            console.error('ASOS Test Failed:', e);
        }
    }
}

testScrapers().catch(console.error);
