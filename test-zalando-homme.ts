import { getAllSources } from './lib/hybrid-radar-sources';
import { scrapeHybridSource } from './lib/hybrid-radar-scraper';

async function testZalandoHomme() {
    const allSources = getAllSources();
    const source = allSources.find(s => s.id === 'zalando-trend-homme-paris');

    if (!source) {
        console.error('Source not found');
        return;
    }

    console.log('Testing Zalando Homme Scrape for:', source.id);
    try {
        const results = await scrapeHybridSource(source);
        console.log(`Scraped ${results.length} items.`);
        if (results.length > 0) {
            console.log('Sample item:', JSON.stringify(results[0], null, 2));
        } else {
            console.log('No items found. Check selectors or wait time.');
        }
    } catch (error) {
        console.error('Scrape error:', error);
    }
}

testZalandoHomme();
