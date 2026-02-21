
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function checkSelectors() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Navigating to ASOS Homme...');
    await page.goto('https://www.asos.com/fr/homme/nouveau/nouveau-vetements/cat/?cid=6993', { waitUntil: 'domcontentloaded' });

    await new Promise(r => setTimeout(r, 5000));
    try {
        const okButton = await page.$('#onetrust-accept-btn-handler');
        if (okButton) await okButton.click();
        await new Promise(r => setTimeout(r, 5000));
    } catch (e) { }

    await page.evaluate(() => window.scrollBy(0, 1000));
    await new Promise(r => setTimeout(r, 10000));

    const results = await page.evaluate(() => {
        const a = Array.from(document.querySelectorAll('a')).find(el => el.textContent?.includes('DC Shoes'));
        if (!a) return 'LINK NOT FOUND';

        const children = Array.from(a.querySelectorAll('*')).map(el => ({
            tag: el.tagName,
            className: el.className,
            text: el.textContent
        }));

        return {
            linkClass: a.className,
            children
        };
    });

    console.log('Results:', JSON.stringify(results, null, 2));

    await browser.close();
}

checkSelectors();
