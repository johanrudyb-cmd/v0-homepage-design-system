/**
 * Script de test pour le scraper Shopify (ES Modules)
 * Permet de tester le scraping sans passer par l'API et les limites
 * 
 * Usage: node scripts/test-scraper.mjs <URL>
 * Exemple: node scripts/test-scraper.mjs https://exemple.myshopify.com
 */

import puppeteer from 'puppeteer';

function normalizeShopifyUrl(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('myshopify.com')) {
      return urlObj.toString();
    }
    return urlObj.toString();
  } catch {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }
}

async function scrapeShopifyStore(url) {
  let browser = null;

  try {
    const normalizedUrl = normalizeShopifyUrl(url);
    
    console.log('🚀 Lancement de Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    console.log('📡 Chargement de la page...');
    await page.goto(normalizedUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    console.log('🔍 Vérification Shopify...');
    const isShopify = await page.evaluate(() => {
      const hasShopifyScript = Array.from(document.querySelectorAll('script[src]')).some(
        (script) => script.src.includes('shopify')
      );
      const hasShopifyClass = document.body.className.includes('shopify') || 
                              document.documentElement.className.includes('shopify');
      const hasShopifyMeta = document.querySelector('meta[name="shopify-checkout-api-token"]') !== null ||
                            document.querySelector('meta[property="og:type"][content="product"]') !== null;
      const hasShopifyInHTML = document.documentElement.outerHTML.toLowerCase().includes('shopify');
      
      return hasShopifyScript || hasShopifyClass || hasShopifyMeta || hasShopifyInHTML;
    });

    if (!isShopify) {
      throw new Error('Cette URL ne semble pas être une boutique Shopify. Veuillez vérifier l\'URL.');
    }

    console.log('✅ Boutique Shopify détectée!');
    console.log('📊 Extraction des données...');
    
    await page.waitForTimeout(2000);

    const storeData = await page.evaluate(() => {
      const extractCSSVariable = (varName) => {
        const root = document.documentElement;
        const value = getComputedStyle(root).getPropertyValue(varName).trim();
        return value || null;
      };

      const extractFont = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const fontFamily = getComputedStyle(element).fontFamily;
        return fontFamily.split(',')[0].replace(/['"]/g, '').trim() || null;
      };

      const storeName = document.querySelector('title')?.textContent || 
                       document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
                       'Boutique Shopify';

      const logoSelectors = [
        'img[alt*="logo" i]',
        '.logo img',
        'header img[alt*="logo" i]',
        '[class*="logo"] img',
        'nav img',
      ];
      let logo = null;
      for (const selector of logoSelectors) {
        const logoEl = document.querySelector(selector);
        if (logoEl) {
          logo = logoEl.src;
          break;
        }
      }

      const themeInfo = {
        name: null,
        version: null,
      };

      const htmlContent = document.documentElement.outerHTML;
      const themeComment = htmlContent.match(/<!--\s*Theme:\s*(.+?)\s*-->/i);
      if (themeComment) {
        themeInfo.name = themeComment[1].trim();
      }

      const themeFiles = Array.from(document.querySelectorAll('link[href*="/themes/"], script[src*="/themes/"]'));
      if (themeFiles.length > 0) {
        const href = themeFiles[0].href || themeFiles[0].src;
        const themeMatch = href.match(/\/themes\/([^\/]+)\//);
        if (themeMatch && !themeInfo.name) {
          themeInfo.name = themeMatch[1];
        }
      }

      if (!themeInfo.name) {
        const bodyClasses = document.body.className;
        const themeClasses = {
          'dawn': bodyClasses.includes('theme-dawn') || htmlContent.includes('theme-dawn'),
          'brooklyn': bodyClasses.includes('theme-brooklyn') || htmlContent.includes('theme-brooklyn'),
          'debut': bodyClasses.includes('theme-debut') || htmlContent.includes('theme-debut'),
          'venture': bodyClasses.includes('theme-venture') || htmlContent.includes('theme-venture'),
        };
        for (const [name, found] of Object.entries(themeClasses)) {
          if (found) {
            themeInfo.name = name;
            break;
          }
        }
      }

      const versionMatch = htmlContent.match(/theme_version["']:\s*["']([^"']+)["']/i);
      if (versionMatch) {
        themeInfo.version = versionMatch[1];
      }

      const colors = {
        primary: extractCSSVariable('--color-primary') || 
                 extractCSSVariable('--primary-color') ||
                 extractCSSVariable('--color-base') ||
                 null,
        secondary: extractCSSVariable('--color-secondary') ||
                  extractCSSVariable('--secondary-color') ||
                  null,
        accent: extractCSSVariable('--color-accent') ||
               extractCSSVariable('--accent-color') ||
               null,
      };

      function rgbToHex(rgb) {
        const match = rgb.match(/\d+/g);
        if (!match || match.length < 3) return rgb;
        const r = parseInt(match[0]);
        const g = parseInt(match[1]);
        const b = parseInt(match[2]);
        return '#' + [r, g, b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('');
      }

      if (!colors.primary) {
        const header = document.querySelector('header');
        if (header) {
          const bgColor = getComputedStyle(header).backgroundColor;
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            colors.primary = rgbToHex(bgColor);
          }
        }
      }

      const fonts = {
        heading: extractFont('h1, h2, h3, .heading') || 
                extractFont('[class*="heading"]') ||
                null,
        body: extractFont('body, p, .body') ||
             extractFont('[class*="body"]') ||
             null,
      };

      const navigation = [];
      const navSelectors = ['nav a', 'header nav a', '[role="navigation"] a'];
      const navLinks = new Set();

      navSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((link) => {
          const text = link.textContent?.trim();
          const href = link.href;
          if (text && href && !navLinks.has(href)) {
            navLinks.add(href);
            navigation.push({ text, href });
          }
        });
      });

      const apps = [];
      const appPatterns = {
        'klaviyo': /klaviyo\.com|data-klaviyo|klaviyo/i,
        'loox': /loox\.io|loox-rating|loox/i,
        'yotpo': /yotpo\.com|yotpo-widget|yotpo/i,
        'recharge': /rechargeapps\.com|recharge/i,
        'gorgias': /gorgias\.com|gorgias/i,
        'judge': /judge\.me|judge/i,
        'stamped': /stamped\.io|stamped/i,
        'okendo': /okendo\.io|okendo/i,
        'reviews': /reviews\.io|reviews/i,
        'trustpilot': /trustpilot\.com|trustpilot/i,
      };

      const htmlContentLower = htmlContent.toLowerCase();
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      scripts.forEach(script => {
        const src = script.src.toLowerCase();
        for (const [appName, pattern] of Object.entries(appPatterns)) {
          if (pattern.test(src) || pattern.test(htmlContentLower)) {
            if (!apps.includes(appName)) {
              apps.push(appName);
            }
          }
        }
      });

      const products = [];
      const productSelectors = [
        '.product-card',
        '[class*="product"]',
        '.grid-product',
        '.product-item',
      ];

      productSelectors.forEach(selector => {
        document.querySelectorAll(selector).slice(0, 6).forEach((card) => {
          const titleEl = card.querySelector('a[href*="/products/"], .product-title, h3, h4');
          const priceEl = card.querySelector('.price, [class*="price"], .money');
          const imageEl = card.querySelector('img');

          if (titleEl) {
            products.push({
              title: titleEl.textContent?.trim() || '',
              price: priceEl?.textContent?.trim() || '',
              image: imageEl?.src || null,
            });
          }
        });
      });

      return {
        storeName,
        logo,
        theme: themeInfo,
        colors,
        fonts,
        navigation: navigation.slice(0, 10),
        apps,
        products: products.slice(0, 6),
      };
    });

    return storeData;
  } catch (error) {
    throw new Error(`Erreur lors de l'analyse de la boutique: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function testScraper() {
  const url = process.argv[2];

  if (!url) {
    console.error('❌ Veuillez fournir une URL Shopify');
    console.log('Usage: node scripts/test-scraper.mjs <URL>');
    console.log('Exemple: node scripts/test-scraper.mjs https://exemple.myshopify.com');
    process.exit(1);
  }

  console.log('🔍 Test du scraper Shopify...\n');
  console.log(`📦 URL: ${url}\n`);
  console.log('⏳ Scraping en cours (cela peut prendre 10-15 secondes)...\n');

  try {
    const startTime = Date.now();
    const data = await scrapeShopifyStore(url);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('✅ Scraping réussi!\n');
    console.log('📊 Données extraites:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🏪 Nom de la boutique: ${data.storeName}`);
    console.log(`🎨 Thème: ${data.theme.name || 'Non détecté'} ${data.theme.version ? `v${data.theme.version}` : ''}`);
    console.log(`\n🎨 Couleurs:`);
    console.log(`   - Primaire: ${data.colors.primary || 'Non détectée'}`);
    console.log(`   - Secondaire: ${data.colors.secondary || 'Non détectée'}`);
    console.log(`   - Accent: ${data.colors.accent || 'Non détectée'}`);
    console.log(`\n📝 Polices:`);
    console.log(`   - Heading: ${data.fonts.heading || 'Non détectée'}`);
    console.log(`   - Body: ${data.fonts.body || 'Non détectée'}`);
    console.log(`\n📱 Apps détectées (${data.apps.length}):`);
    if (data.apps.length > 0) {
      data.apps.forEach(app => console.log(`   - ${app}`));
    } else {
      console.log('   Aucune app détectée');
    }
    console.log(`\n🧭 Navigation (${data.navigation.length} liens):`);
    if (data.navigation.length > 0) {
      data.navigation.slice(0, 5).forEach(link => {
        console.log(`   - ${link.text} → ${link.href}`);
      });
      if (data.navigation.length > 5) {
        console.log(`   ... et ${data.navigation.length - 5} autres`);
      }
    } else {
      console.log('   Aucun lien de navigation détecté');
    }
    console.log(`\n🛍️ Produits détectés (${data.products.length}):`);
    if (data.products.length > 0) {
      data.products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.title} - ${product.price || 'Prix non disponible'}`);
      });
    } else {
      console.log('   Aucun produit détecté');
    }
    if (data.logo) {
      console.log(`\n🖼️ Logo: ${data.logo}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n⏱️ Temps d'exécution: ${duration}s`);
    console.log('\n✅ Test terminé avec succès!');
  } catch (error) {
    console.error('\n❌ Erreur lors du scraping:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testScraper();
