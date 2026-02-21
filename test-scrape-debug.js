
const { refreshAllTrends } = require('./lib/refresh-all-trends');
const { prisma } = require('./lib/prisma');

async function testScrape() {
    console.log('Starting Test Scrape (Turbo Mode)...');
    try {
        const result = await refreshAllTrends(2, 5);
        console.log('Scrape Result:', JSON.stringify(result, null, 2));

        const count = await prisma.trendProduct.count();
        console.log('Total products in DB now:', count);
    } catch (error) {
        console.error('Test Scrape Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testScrape();
