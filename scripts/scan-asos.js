
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { PrismaClient } = require('@prisma/client');

puppeteer.use(StealthPlugin());
const prisma = new PrismaClient();

const TARGET_URL = 'https://www.asos.com/fr/homme/nouveautes/cat/?cid=27110&sort=freshness';

async function run() {
    console.log('🚀 Scan ASOS (JS Mode)...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

        await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log('🌐 Page chargée.');

        // Scroll
        await page.evaluate(async () => {
            for (let i = 0; i < 10; i++) {
                window.scrollBy(0, 800);
                await new Promise(r => setTimeout(r, 1000));
            }
        });

        const products = await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('article').forEach(node => {
                const name = node.querySelector('p')?.innerText || "";
                const priceText = node.innerText.match(/[\d,.]+/)?.[0] || "0";
                const img = node.querySelector('img')?.src || "";
                const link = node.querySelector('a')?.href || "";
                if (name && link) items.push({ name, price: parseFloat(priceText.replace(',', '.')), imageUrl: img, sourceUrl: link });
            });
            return items;
        });

        console.log(`✅ ${products.length} articles trouvés.`);

        for (const p of products) {
            await prisma.trendProduct.upsert({
                where: { sourceUrl: p.sourceUrl },
                update: { averagePrice: p.price },
                create: {
                    name: p.name,
                    category: 'AUTRE',
                    segment: 'homme',
                    sourceUrl: p.sourceUrl,
                    imageUrl: p.imageUrl,
                    averagePrice: p.price,
                    brand: 'ASOS',
                    marketZone: 'EU',
                    style: 'BASIQUE',
                    material: 'Inconnu',
                    saturability: 0,
                    ageRange: '18-24',
                    trendScore: 80,
                    trendScoreVisual: 80
                }
            });
        }
        console.log('💾 DB mise à jour.');
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
        await prisma.$disconnect();
    }
}
run();
