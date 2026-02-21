
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function run() {
    console.log('🧪 TEST SCROLL VISUEL...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    try {
        await page.goto('https://www.asos.com/fr/homme/nouveautes/cat/?cid=27110', { waitUntil: 'networkidle2' });

        await page.screenshot({ path: 'scroll-step-0.png' });

        console.log('Scroll 1...');
        await page.keyboard.press('PageDown');
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'scroll-step-1.png' });

        console.log('Scroll 2...');
        await page.keyboard.press('PageDown');
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'scroll-step-2.png' });

        console.log('Screenshots créés. Comparez les.');
    } finally {
        await browser.close();
    }
}
run();
