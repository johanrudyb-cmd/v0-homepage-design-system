
// ============================================================================
//               SCRAPER HYBRIDE V2 (SIMPLE & ROBUSTE)
// ============================================================================
// Objectif : Scraper uniquement les données critiques (Image, Nom, Prix, Lien)
// Cibles : ASOS, ZARA
// Tech : Puppeteer Stealth + Attente explicite
// ============================================================================

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import type { HybridRadarSource } from './hybrid-radar-sources';

/** Mots-clés pour exclure chaussures / baskets / chaussettes (vêtements uniquement). */
const EXCLUDE_SHOES_KEYWORDS = [
    'basket', 'baskets', 'chaussure', 'chaussures', 'sneaker', 'sneakers',
    'shoe', 'shoes', 'bottine', 'bottines', 'sandale', 'sandales', 'botte', 'bottes',
    'bottes de neige', 'botte de neige', 'escarpin', 'escarpins', 'running', 'trainer', 'trainers', 'footwear',
    'boot', 'boots', 'loafer', 'loafers', 'mule', 'mules', 'slip-on', 'tuff terra', 'snow boot',
    'chaussons', 'chausson', 'chaussette', 'chaussettes', 'sock', 'socks',
    'derby', 'derbies', 'ballerine', 'ballerines', 'mocassin', 'mocassins', 'bottillon', 'bottillons', 'richelieu', 'sabot', 'sabots',
    'talons', 'heels', 'clog', 'clogs', 'tennis', 'pantoufle', 'slippers',
    'cuissarde', 'cuissardes', 'thigh high', 'over the knee',
];

/** Sous-vêtements et maillots de bain à exclure. */
const EXCLUDE_UNDERWEAR_KEYWORDS = [
    'sous-vêtement', 'sous-vetement', 'slip homme', 'slip femme', ' slip ', 'slip ',
    'boxer short', 'boxers short', 'boxeur', 'boxeurs', 'boxer ',
    'lot de boxer', 'lot boxer', 'lots de boxer', 'lots boxer', 'lot boxers',
    'caleçon', 'calecon', 'caleçons', 'calecons',
    'culotte homme', 'culotte femme', ' culotte', 'culotte ',
    'string homme', ' string ', 'string ',
    'brief ', 'underwear',
    'maillot de bain', 'maillot de bains', 'maillot bain', 'maillots de bain',
    'bikini', 'bikinis',
    'soutien-gorge', 'soutien gorge', 'brassière', 'brassiere', 'pyjama ', 'nuisette',
];

/** Sacs à exclure (pas "bag" seul : exclurait "baggy"). */
const EXCLUDE_BAG_KEYWORDS = [
    'sac à main', 'sac a main', 'sac à dos', 'sac a dos', 'sac bandoulière', 'sac bandouliere',
    'tote bag', 'backpack', 'portefeuille', 'porte-monnaie', 'porte monnaie',
    'cabas', 'sac cabas', 'shopping bag', 'sac shopping',
    ' sac ', 'sac à ', 'sac a ', 'sac main', 'sac ', ' sac',
    'bag ', ' bag ', ' bag', 'bags', 'handbag', 'handbags', 'clutch',
    'sacoche', 'shoulder bag', 'messenger bag', 'satchel', 'crossbody', 'waist bag', 'fanny pack', 'banane', 'bum bag',
    'pochette', 'wallet', 'purse', 'trousse', 'case',
];

/** Parfums à exclure. */
const EXCLUDE_PERFUME_KEYWORDS = [
    'parfum', 'parfums', 'perfume', 'perfumes', 'eau de toilette', 'eau de parfum',
    'fragrance', 'fragrances', 'flacon', 'spray', 'scent', 'cologne', 'mist', 'brume',
    ' edp', ' edt', 'edp ', 'edt ', ' eau ',
];

/** Accessoires à exclure (on garde vêtements uniquement). */
const EXCLUDE_ACCESSORIES_KEYWORDS = [
    'lunettes', 'lunette de soleil', 'montre', 'montres', 'ceinture', 'ceintures',
    'bijou', 'bijoux', 'accessoire', 'accessoires', 'accessories', 'necklace',
    'bracelet', 'bracelets', 'belt', 'watch', 'glasses', 'casquette', 'chapeau',
    'cap ', ' hat ', 'écharpe', 'echarpe', 'scarf', 'gants', 'gant ', ' gant ', 'gloves', 'glove', 'collier',
    'moufle', 'moufles', 'mitten', 'mittens',
    'bag bandoulière', 'sac bandoulière', 'autres accessoires', 'maroquinerie',
    'petite maroquinerie', 'cache-oreilles', 'cache oreilles',
    'sunglasses', 'eyewear', 'beanie', 'bonnet', 'tie', 'cravate', 'umbrella', 'parapluie',
    'casquettes', 'caps', 'hats', 'chapeaux', 'beret', 'bob ', 'bucket hat',
    'lunette', 'glasses', 'sunglasses', 'eyewear', 'monture', 'montures', 'lunetier',
    'masque', 'mask', 'masques',
];

/** Bijoux et non-vêtements à exclure (vêtements uniquement). */
const EXCLUDE_JEWELRY_KEYWORDS = [
    'boucle d\'oreille', 'boucles d\'oreille', 'boucles d’oreilles', 'earring', 'earrings',
    'bague', 'bagues', 'ring ', 'rings ', 'pendentif', 'pendentifs', 'pendant',
    'broche', 'broches', 'pin ', 'jewelry', 'jewellery', 'parure', 'parures',
    'collier', 'necklace', 'bracelet', 'bracelets', 'anklet', 'chevillère', 'bijoux',
];

/** Lots / Packs à exclure (on veut des articles unitaires). */
const EXCLUDE_LOTS_KEYWORDS = [
    ' lot ', 'lot de ', 'lots de ', ' lot', 'lot ', ' pack ', 'pack de ', ' pack', 'pack ',
    'set de ', ' set ', 'kit ', ' x2', ' x3', ' x4', ' x5', ' x6', ' x10',
];

/** Pulls / sweats rouges à exclure (demande utilisateur). */
const EXCLUDE_RED_PULL_KEYWORDS = [
    'pull rouge', 'pull red', 'sweat rouge', 'sweat red', 'pullover rouge', 'pullover red',
    'rouge pull', 'red pull', 'rouge sweat', 'red sweat',
];

/** Électroménager / aspirateurs / équipements à exclure (vêtements uniquement). */
const EXCLUDE_EQUIPMENT_KEYWORDS = [
    'dyson', 'aspirateur', 'vacuum', 'équipement', 'equipment', 'gear', 'matériel',
    'électronique', 'electronic', 'gadget', 'device', 'appliance', 'mousse', 'foam',
    'yoga mat', 'tapis de yoga', 'dumbbells', 'haltères', 'poids',
];

/** Produits pour cheveux / capillaires à exclure (vêtements uniquement). */
const EXCLUDE_HAIR_KEYWORDS = [
    'produit pour cheveux', 'produit cheveux', 'produit capillaire', 'produits capillaires',
    'soin pour cheveux', 'soins pour cheveux', 'soin capillaire', 'soins capillaires', 'soin cheveux', 'soins cheveux',
    'hair product', 'hair care', 'hair mask', 'hair oil', 'hair serum', 'hair treatment',
    'shampoo', 'shampoing', 'conditioner', 'après-shampooing', 'apres-shampooing', 'after shampoo',
    'leave-in', 'leave in', 'masque cheveux', 'masque pour les cheveux', 'huile capillaire',
    'sérum capillaire', 'serum capillaire', 'coloration capillaire', 'teinture capillaire',
    'k18', 'brosse à cheveux', 'brosse cheveux', 'brush cheveux',
    'peigne', 'peigne à cheveux', 'peigne a cheveux', 'peigne cheveux', 'comb', 'hair comb',
    'set de cheveux', 'sets de cheveux', 'set cheveux', 'sets cheveux',
    'extension de cheveux', 'extensions de cheveux', 'extension cheveux', 'extensions cheveux',
    'perruque', 'perruques', 'wig', 'wigs', 'postiche', 'postiches',
    'hair set', 'hair piece', 'hair pieces', 'hair extension', 'hair extensions',
    'mèche ', 'mèches ', 'meche ', 'meches ', 'closure',
];

/** Pochettes (porte-cartes, portefeuilles plats) à exclure (vêtements uniquement). */
const EXCLUDE_POCHETTE_KEYWORDS = [
    'pochette', 'pochettes', 'porte-cartes', 'porte cartes', 'portecartes',
    'card holder', 'cardholder', 'card case',
];

/** Marques non-vêtement à exclure (cosmétiques, beauté, soins) ou marques à retirer (ex. ASOS Design). */
const EXCLUDE_BRAND_KEYWORDS = [
    'asos design',
    'yope', 'nuxe', 'tangle teezer',
    'shiseido', 'i heart revolution', 'revolution beauty', 'korres',
    'maybelline', 'l\'oréal', 'loreal', 'estee lauder', 'estée lauder', 'clinique',
    'mac cosmetics', 'nyx', 'kiko', 'the ordinary', 'cerave', 'la roche-posay',
    'eucerin', 'bioderma', 'vichy', 'avène', 'caudalie', 'clarins', 'lancôme', 'lancome',
    'junglück',
];

/** Cosmétiques / produits de beauté / savon / crème / brosse à exclure (vêtements uniquement). */
const EXCLUDE_COSMETICS_KEYWORDS = [
    'rouge à lèvres', 'rouge a levres', 'rouge à lèvre', 'rouge a levre',
    'lipstick', 'lip stick', 'gloss', 'lip gloss', 'gloss à lèvres', 'gloss a levres',
    'eyeshadow', 'fard', 'maquillage', 'mascara',
    'nail', 'vernis', 'crème', 'creme', 'cream', 'brush', 'brosse',
    'brosse à cheveux', 'brosse a cheveux', 'brosse cheveux', 'hair brush',
    'peigne', 'peigne à cheveux', 'peigne a cheveux', 'peigne cheveux', 'comb', 'hair comb',
    'lips', 'blush', 'highlighter', 'concealer', 'foundation', 'hydration mask',
    'repair mask', 'masque réparation',
    'savon', 'soap', 'savonnette', 'savons', 'bar soap', 'liquid soap',
    'produit de beauté', 'produits de beauté', 'beauté', 'beauty', 'cosmétique', 'cosmetic', 'cosmetics',
    'soin visage', 'soin corps', 'skincare', 'skin care', 'make-up', 'makeup', 'soin ', 'soins ',
    'sérum', 'serum', 'huile ', 'oil ', 'démaquillant', 'cleanser', 'tonique', 'moisturizer',
    'gel douche', 'shower gel', 'body wash', 'crayon à lèvres', 'crayon a levres', 'lip liner',
    'crayon yeux', 'eyeliner', 'correcteur', 'concealer', 'face mask', 'masque visage',
    'dentifrice', 'toothpaste', 'déodorant', 'deodorant', 'antiperspirant',
    'mousse à raser', 'shaving foam', 'gel', 'lait corps', 'body lotion',
    'peeling', 'peel', 'mit', 'peeling mit',
];

export function isExcludedProduct(name: string, extraExcludeKeywords: string[] = []): boolean {
    const text = (name || '').toLowerCase();
    const all = [
        ...EXCLUDE_SHOES_KEYWORDS,
        ...EXCLUDE_UNDERWEAR_KEYWORDS,
        ...EXCLUDE_BAG_KEYWORDS,
        ...EXCLUDE_PERFUME_KEYWORDS,
        ...EXCLUDE_ACCESSORIES_KEYWORDS,
        ...EXCLUDE_JEWELRY_KEYWORDS,
        ...EXCLUDE_LOTS_KEYWORDS,
        ...EXCLUDE_EQUIPMENT_KEYWORDS,
        ...EXCLUDE_HAIR_KEYWORDS,
        ...EXCLUDE_POCHETTE_KEYWORDS,
        ...EXCLUDE_BRAND_KEYWORDS,
        ...EXCLUDE_COSMETICS_KEYWORDS,
        ...EXCLUDE_RED_PULL_KEYWORDS,
        ...extraExcludeKeywords,
    ];
    return all.some((kw) => text.includes(kw));
}

// Initialisation du mode furtif
puppeteer.use(StealthPlugin());

export interface HybridScrapedItem {
    name: string;
    price: number;
    imageUrl: string | null;
    sourceUrl: string;
    brand: string;
    marketZone: 'FR' | 'EU' | 'US' | 'ASIA';
    segment?: 'homme' | 'femme' | 'garcon' | 'fille';
    productBrand?: string | null;
    trendGrowthPercent?: number | null;
    trendLabel?: string | null;
    composition?: string | null;
    careInstructions?: string | null;
    color?: string | null;
    sizes?: string | null;
    countryOfOrigin?: string | null;
    articleNumber?: string | null;
    originalPrice?: number | null;
    markdownPercent?: number | null;
    stockOutRisk?: string | null;
}

/**
 * Lance le navigateur en mode furtif
 */
async function launchStealthBrowser(): Promise<Browser> {
    console.log('🚀 [Scraper V2] Démarrage du navigateur...');
    return await puppeteer.launch({
        headless: false, // On voit le navigateur pour débugger au début
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
            '--window-size=1280,800',
        ],
        defaultViewport: null,
    });
}

/**
 * Scrolle la page pour charger le lazy loading
 */
async function autoScroll(page: Page, maxScrolls: number = 10) {
    console.log(`📜 [Scraper V2] Scroll de la page (${maxScrolls} steps)...`);
    await page.evaluate(async (maxSteps) => {
        await new Promise<void>((resolve) => {
            let totalHeight = 0;
            let distance = 400;
            let steps = 0;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                steps++;

                if (totalHeight >= scrollHeight || steps >= maxSteps) {
                    clearInterval(timer);
                    resolve();
                }
            }, 500); // Scroll toutes les 500ms
        });
    }, maxScrolls);
    // Attente finale pour le chargement des images
    await new Promise((r) => setTimeout(r, 2000));
}

/**
 * Fonction Principale : Scrape une source
 */
export async function scrapeHybridSource(source: HybridRadarSource): Promise<HybridScrapedItem[]> {
    console.log(`Starting scrape for ${source.id} (${source.brand})...`);
    let browser: Browser | null = null;
    const products: HybridScrapedItem[] = [];

    try {
        browser = await launchStealthBrowser();
        const page = await browser.newPage();

        // Configuration Anti-Bot basique
        await page.setViewport({ width: 1366, height: 768 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Navigation
        const targetUrl = source.baseUrl + source.newInPath;
        console.log(`🌐 [Scraper V2] Navigation vers : ${targetUrl}`);

        await page.goto(targetUrl, {
            waitUntil: 'networkidle2', // Attendre que le réseau soit calme
            timeout: 60000,
        });

        // Gestion des Cookies (ZARA / ASOS)
        try {
            // Sélecteurs génériques pour les bannières cookies
            const cookieSelectors = [
                '#onetrust-accept-btn-handler', // OneTrust (Zara, Asos)
                'button[data-testid="cookie-banner-accept-all"]', // Asos Old
                'button.cookie-banner__accept',
                '#reject-all-cookies', // Parfois rejeter est plus simple
                '#accept-all-cookies'
            ];

            for (const sel of cookieSelectors) {
                const btn = await page.$(sel);
                if (btn) {
                    console.log(`🍪 [Scraper V2] Bannière cookies détectée (${sel}), clic...`);
                    await btn.click();
                    await new Promise((r) => setTimeout(r, 1000));
                    break; // Un seul clic suffit souvent
                }
            }
        } catch (e) {
            console.log('⚠️ [Scraper V2] Erreur mineure cookie (ignoré).');
        }

        // Scroll pour charger les produits
        await autoScroll(page, 15); // Environ 3-4 pages de produits

        // Extraction des données
        console.log(`⛏️ [Scraper V2] Extraction des données via sélecteurs...`);

        const extractedData = await page.evaluate((sourceSelectors, brandName) => {
            const items: any[] = [];

            // Détection des conteneurs produits
            // Pour ASOS : li[class*="productTile"] (Validé)
            // Pour ZARA : .product-grid-product (Validé)
            // Fallback générique : article, .product-card
            const productElements = document.querySelectorAll(sourceSelectors.products || 'article, li[data-testid="productTile"], .product-grid-product');

            console.log(`[Browser Logic] ${productElements.length} éléments trouvés.`);

            productElements.forEach((el) => {
                try {
                    // Nom
                    let name = '';
                    const nameEl = el.querySelector(sourceSelectors.name);
                    if (nameEl) name = nameEl.textContent?.trim() || '';
                    // Fallback image alt si nom vide
                    const imgEl = el.querySelector(sourceSelectors.image);
                    if (!name && imgEl) name = imgEl.getAttribute('alt')?.trim() || '';

                    // Prix
                    let price = 0;
                    const priceEl = el.querySelector(sourceSelectors.price);
                    if (priceEl) {
                        const priceText = priceEl.textContent?.trim() || '';
                        // Nettoyage prix : "19,99 €" -> 19.99
                        const cleanPrice = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
                        price = parseFloat(cleanPrice);
                    }

                    // Image URL
                    let imageUrl = null;
                    if (imgEl) {
                        // Gestion srcset (Zalando/Asos)
                        const srcset = imgEl.getAttribute('srcset');
                        if (srcset) {
                            // Prendre la plus grande image du srcset
                            const sources = srcset.split(',').map(s => s.trim().split(' '));
                            if (sources.length > 0) imageUrl = sources[sources.length - 1][0];
                        }

                        if (!imageUrl) imageUrl = imgEl.getAttribute('src');
                        if (!imageUrl) imageUrl = imgEl.getAttribute('data-src');
                    }

                    // Source URL
                    let sourceUrl = '';
                    const linkEl = el.querySelector('a');
                    if (linkEl) sourceUrl = linkEl.href;
                    // Si lien relatif, ajouter la base (géré par browser automatiquement via .href mais bon safety check)

                    // Marque Produit (Si disponible dans le dom, sinon 'brandName' par défaut)
                    // Sur ASOS, parfois la marque est dans le nom ou un attribut data
                    let productBrand = null;

                    if (name && price > 0 && imageUrl && sourceUrl) {
                        items.push({
                            name,
                            price,
                            imageUrl,
                            sourceUrl,
                            brand: brandName,
                            marketZone: 'EU', // Par défaut
                            productBrand // Sera enrichi post-traitement si possible
                        });
                    }
                } catch (err) {
                    // Élément ignoré
                }
            });

            return items;
        }, source.selectors, source.brand);

        console.log(`✅ [Scraper V2] ${extractedData.length} produits extraits.`);

        // Post-processing et mapping
        extractedData.forEach((item: any) => {
            products.push({
                ...item,
                marketZone: source.marketZone,
                segment: source.segment,
            });
        });

    } catch (error) {
        console.error(`❌ [Scraper V2] Erreur critique sur ${source.id}:`, error);
    } finally {
        if (browser) await browser.close();
    }

    return products;
}
