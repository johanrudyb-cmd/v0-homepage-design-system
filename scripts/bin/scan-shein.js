
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { PrismaClient } = require('@prisma/client');

puppeteer.use(StealthPlugin());
const prisma = new PrismaClient();

const TARGET_URL = 'https://fr.shein.com/Men-Clothing-sc-00212351.html?sort=7';

async function run() {
    console.log('🚀 DÉMARRAGE SHEIN JS-POWER (V3)...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

        console.log('🌐 Voyage vers Shein...');
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 90000 });

        console.log('📜 Scroll long...');
        await page.evaluate(async () => {
            for (let i = 0; i < 10; i++) {
                window.scrollBy(0, 1000);
                await new Promise(r => setTimeout(r, 1500));
            }
        });

        const products = await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('.product-list__item, .S-product-item__wrapper').forEach(card => {
                const titleEl = card.querySelector('a[href*="-p-"]');
                const name = titleEl?.textContent?.trim() || "";
                const priceMatch = card.innerText.match(/[\d,.]+/);
                const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;
                const img = card.querySelector('img')?.src || "";
                const url = card.querySelector('a')?.href || "";
                if (name && price > 0) items.push({ name, price, imageUrl: img, sourceUrl: url });
            });
            return items;
        });

        console.log(`✅ ${products.length} articles Shein capturés !`);

        for (const p of products) {
            await prisma.trendProduct.upsert({
                where: { sourceUrl: p.sourceUrl },
                update: { averagePrice: p.price, updatedAt: new Date() },
                create: {
                    name: p.name,
                    category: 'AUTRE',
                    style: 'Emergent',
                    material: 'Inconnu',
                    averagePrice: p.price,
                    trendScore: 50,
                    trendScoreVisual: 50,
                    saturability: 0,
                    imageUrl: p.imageUrl,
                    sourceUrl: p.sourceUrl,
                    productBrand: 'SHEIN',
                    sourceBrand: 'SHEIN',
                    marketZone: 'GLOBAL'
                }
            });
        }
    } finally {
        await browser.close();
        await prisma.$disconnect();
    }
}
run();
