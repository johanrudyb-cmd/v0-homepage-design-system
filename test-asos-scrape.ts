
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function main() {
    const url = 'https://www.asos.com/fr/femme/ctas/mode-en-ligne-etats-unis-13/cat/?cid=16661';
    console.log('Testing ASOS scrape on:', url);

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });

        await new Promise(r => setTimeout(r, 4000));
        await page.screenshot({ path: 'asos-test.png' });

        const diag = await page.evaluate(() => {
            const articles = document.querySelectorAll('article, li[class*="productTile"], section[class*="productTile"]');
            const tags = Array.from(document.querySelectorAll('article, section, li, div[class*="product"]')).map(e => e.className).slice(0, 20);
            return {
                count: articles.length,
                bodyLength: document.body.innerHTML.length,
                tags: tags
            };
        });
        console.log('Diagnosis:', diag);

        if (diag.count > 0) {
            const items = await page.evaluate(() => {
                const els = Array.from(document.querySelectorAll('article, li[class*="productTile"], section[class*="productTile"]'));
                return els.slice(0, 5).map((el: any) => ({
                    text: el.innerText,
                    brand: el.querySelector('[class*="Brand"]')?.textContent,
                    title: el.querySelector('[class*="Title"]')?.textContent,
                    desc: el.querySelector('[class*="Description"]')?.textContent,
                    linkTitle: el.querySelector('a')?.getAttribute('title')
                }));
            });
            console.log('Result:', JSON.stringify(items, null, 2));
        }

        await browser.close();
    } catch (err) {
        console.error(err);
    }
}

main();
