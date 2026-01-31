/**
 * Ouvre une page Zalando trend-details et compte les liens produits / structure.
 * Usage: npx tsx scripts/dump-zalando-trend-details.ts
 */

import puppeteer from 'puppeteer';

const TREND_DETAILS_URL = 'https://www.zalando.fr/trend-spotter/trend-details/deer_print?tsfrom=default';

type TrendDetailsInfo = {
  articleCount: number;
  withPriceCount: number;
  samples: Array<{ textSample: string; href: string; hasLink: boolean }>;
  firstArticleWithPriceHtml: string | null;
};

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');

  await page.goto(TREND_DETAILS_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 8000));

  const info = await page.evaluate(`
    (function() {
      var articles = document.querySelectorAll('article');
      var withProductText = [];
      for (var i = 0; i < Math.min(articles.length, 20); i++) {
        var el = articles[i];
        var text = (el.textContent || '').trim();
        var hasPrice = /\\d{1,3}[,.]\\d{2}\\s*€/.test(text);
        var link = el.querySelector('a[href*="zalando.fr"]');
        var href = link ? link.href : '';
        if (hasPrice && text.length > 20) {
          withProductText.push({ textSample: text.slice(0, 200), href: href.slice(0, 120), hasLink: !!link });
        }
      }
      var firstArticleWithPrice = null;
      for (var j = 0; j < articles.length; j++) {
        if (/\\d{1,3}[,.]\\d{2}\\s*€/.test(articles[j].textContent || '')) {
          var a = articles[j].querySelector('a[href*="zalando"]');
          if (a && a.href && a.href.indexOf('faq') === -1 && a.href.indexOf('corporate') === -1 && a.href.indexOf('apps.') === -1) {
            firstArticleWithPrice = articles[j].outerHTML;
            break;
          }
        }
      }
      return {
        articleCount: articles.length,
        withPriceCount: withProductText.length,
        samples: withProductText.slice(0, 3),
        firstArticleWithPriceHtml: firstArticleWithPrice || null
      };
    })()
  `) as TrendDetailsInfo;

  await browser.close();
  console.log(JSON.stringify(info, null, 2));
  if (info.firstArticleWithPriceHtml) {
    const fs = await import('fs');
    const path = await import('path');
    const out = path.join(process.cwd(), 'screenshots-debug', 'zalando-trend-details-article.html');
    fs.writeFileSync(out, info.firstArticleWithPriceHtml, 'utf8');
    console.log('Article HTML (trunc) saved to', out);
  }
}

main().catch(console.error);
