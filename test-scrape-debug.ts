
import { refreshAllTrends } from './lib/refresh-all-trends';
import { prisma } from './lib/prisma';

async function testScrape() {
    console.log('--- [DEBUG] Starting Test Scrape (ASOS + ZARA) ---');
    try {
        // On force 2 sources (ASOS + ZARA) et 5 items
        const result = await refreshAllTrends(2, 5);
        console.log('--- [DEBUG] Scrape Result ---');
        console.log(JSON.stringify(result, null, 2));

        const count = await prisma.trendProduct.count();
        console.log(`--- [DEBUG] Total products in DB: ${count} ---`);

        if (count > 0) {
            const latest = await prisma.trendProduct.findFirst({ orderBy: { createdAt: 'desc' } });
            console.log('--- [DEBUG] Latest Product Added ---');
            console.log(JSON.stringify(latest, null, 2));
        }
    } catch (error) {
        console.error('--- [DEBUG] Test Scrape Failed ---');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testScrape();
