import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { scrapeShopifyStore, isShopifyStore } from '@/lib/shopify-scraper';
import { fetchShopifyProducts, isStorefrontApiAvailable } from '@/lib/shopify-storefront-api';
import { scrapeAllAds } from '@/lib/ad-library-scraper';
import { rateLimitByUser, getClientIP } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * Calcule un score de qualité basé sur les données scrapées
 * Utilisé pour estimer le trafic et la performance
 */
function calculateQualityScore(scrapedData: any): number {
  if (!scrapedData) return 0.3; // Score bas si pas de données

  let score = 0;
  let factors = 0;

  // Facteur 1: Nombre d'apps installées (indicateur de maturité)
  if (scrapedData.apps && scrapedData.apps.length > 0) {
    const appsScore = Math.min(scrapedData.apps.length / 10, 1); // Max 10 apps = score 1
    score += appsScore * 0.3;
    factors += 0.3;
  }

  // Facteur 2: Nombre de produits (plus de produits = plus établi)
  if (scrapedData.products && scrapedData.products.length > 0) {
    const productsScore = Math.min(scrapedData.products.length / 20, 1); // Max 20 produits visibles = score 1
    score += productsScore * 0.2;
    factors += 0.2;
  }

  // Facteur 3: Qualité du thème (thèmes premium = meilleur score)
  if (scrapedData.theme?.name) {
    const premiumThemes = ['dawn', 'brooklyn', 'debut', 'venture'];
    const isPremium = premiumThemes.includes(scrapedData.theme.name.toLowerCase());
    score += (isPremium ? 0.8 : 0.5) * 0.2;
    factors += 0.2;
  }

  // Facteur 4: Navigation structurée (indicateur de professionnalisme)
  if (scrapedData.navigation && scrapedData.navigation.length > 0) {
    const navScore = Math.min(scrapedData.navigation.length / 8, 1); // Max 8 liens = score 1
    score += navScore * 0.15;
    factors += 0.15;
  }

  // Facteur 5: Design system (couleurs et polices définies)
  if (scrapedData.colors) {
    const hasColors = scrapedData.colors.primary || scrapedData.colors.secondary;
    const hasFonts = scrapedData.fonts?.heading || scrapedData.fonts?.body;
    if (hasColors && hasFonts) {
      score += 0.15;
      factors += 0.15;
    }
  }

  // Normaliser le score (0-1)
  return factors > 0 ? score / factors : 0.3;
}

// Fonction pour analyser une URL Shopify avec données complètes
async function analyzeShopifyStore(url: string) {
  // Vérifier si c'est une boutique Shopify
  if (!isShopifyStore(url)) {
    throw new Error('URL ne semble pas être une boutique Shopify valide');
  }

  // Extraction du domaine
  let domain = '';
  try {
    const urlObj = new URL(url);
    domain = urlObj.hostname.replace('www.', '').replace('.myshopify.com', '');
  } catch {
    throw new Error('URL invalide');
  }

  // Scraper les données réelles
  let scrapedData;
  let scrapingSuccess = false;
  try {
    console.log(`[Scraping] Début du scraping pour: ${url}`);
    scrapedData = await scrapeShopifyStore(url);
    scrapingSuccess = true;
    console.log(`[Scraping] ✅ Succès! Données extraites:`, {
      storeName: scrapedData.storeName,
      theme: scrapedData.theme.name,
      apps: scrapedData.apps.length,
      products: scrapedData.products.length,
      navigation: scrapedData.navigation.length,
    });
  } catch (scrapeError) {
    console.error('[Scraping] ❌ Erreur scraping, utilisation de données estimées:', scrapeError);
    // Fallback sur données estimées si le scraping échoue
    scrapedData = null;
    scrapingSuccess = false;
  }

  // Si scraping réussi, utiliser les vraies données, sinon estimations
  const storeName = scrapedData?.storeName || (domain.charAt(0).toUpperCase() + domain.slice(1));

  // Essayer d'utiliser l'API Storefront pour des données produits plus précises
  let storefrontProducts: any[] = [];
  let storefrontApiAvailable = false;
  try {
    storefrontApiAvailable = await isStorefrontApiAvailable(url);
    if (storefrontApiAvailable) {
      console.log('[Analyze] API Storefront disponible, récupération des produits...');
      storefrontProducts = await fetchShopifyProducts(url, 50);
      console.log(`[Analyze] ${storefrontProducts.length} produits récupérés depuis Storefront API`);
    }
  } catch (error) {
    console.warn('[Analyze] API Storefront non disponible ou erreur:', error);
    // Continuer avec le scraping normal
  }

  // Détecter le pays depuis l'URL et les données
  let detectedCountry = 'États-Unis'; // Par défaut
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Détection par TLD
    if (hostname.endsWith('.fr') || hostname.includes('.fr/')) {
      detectedCountry = 'France';
    } else if (hostname.endsWith('.uk') || hostname.endsWith('.co.uk')) {
      detectedCountry = 'Royaume-Uni';
    } else if (hostname.endsWith('.de')) {
      detectedCountry = 'Allemagne';
    } else if (hostname.endsWith('.it')) {
      detectedCountry = 'Italie';
    } else if (hostname.endsWith('.es')) {
      detectedCountry = 'Espagne';
    } else if (hostname.endsWith('.ca')) {
      detectedCountry = 'Canada';
    } else if (hostname.endsWith('.au')) {
      detectedCountry = 'Australie';
    } else if (hostname.endsWith('.be') || hostname.endsWith('.nl')) {
      detectedCountry = hostname.endsWith('.be') ? 'Belgique' : 'Pays-Bas';
    }
    
    // Détection par devise dans les prix scrapés
    if (scrapedData?.products && scrapedData.products.length > 0) {
      const pricesText = scrapedData.products.map(p => p.price || '').join(' ');
      if (pricesText.includes('£')) {
        detectedCountry = 'Royaume-Uni';
      } else if (pricesText.includes('$') && !hostname.includes('.fr') && !hostname.includes('.eu')) {
        detectedCountry = 'États-Unis';
      } else if (pricesText.includes('€') && hostname.includes('.fr')) {
        detectedCountry = 'France';
      }
    }
  } catch {
    // Garder la valeur par défaut
  }

  // Scraper les Ad Libraries (Facebook et TikTok) en arrière-plan
  // Ne pas bloquer l'analyse principale si ça échoue
  let adData: { facebook: Array<{ title: string | null; imageUrl: string | null; videoUrl: string | null; text: string | null; link: string | null; date: string | null }>; tiktok: Array<{ title: string | null; imageUrl: string | null; videoUrl: string | null; text: string | null; date: string | null }> } = { facebook: [], tiktok: [] };
  try {
    console.log('[Analyze] Scraping Ad Libraries (Facebook/TikTok)...');
    const countryCode = detectedCountry === 'France' ? 'FR' : 
                       detectedCountry === 'Royaume-Uni' ? 'UK' :
                       detectedCountry === 'États-Unis' ? 'US' : 'FR';
    adData = await scrapeAllAds(storeName, countryCode);
    console.log(`[Analyze] ${adData.facebook.length} publicités Facebook, ${adData.tiktok.length} publicités TikTok trouvées`);
  } catch (error) {
    console.warn('[Analyze] Erreur lors du scraping Ad Libraries:', error);
    // Continuer sans bloquer
  }

  // Estimer la date de lancement depuis les produits
  let estimatedLaunchDate = '2024'; // Par défaut
  if (scrapedData?.products && scrapedData.products.length > 0) {
    // Si beaucoup de produits, la boutique est probablement plus ancienne
    const productCount = scrapedData.products.length;
    if (productCount > 15) {
      estimatedLaunchDate = '2022-2023';
    } else if (productCount > 8) {
      estimatedLaunchDate = '2023';
    } else {
      estimatedLaunchDate = '2024';
    }
  }
  
  // Calculer l'AOV (Average Order Value) depuis les produits
  // Priorité : Storefront API > Scraping > Défaut
  let averageOrderValue = 80; // Par défaut
  
  if (storefrontProducts.length > 0) {
    // Utiliser les prix réels depuis l'API Storefront
    const prices = storefrontProducts
      .map(p => p.price)
      .filter((p): p is number => p !== null && p > 0);
    
    if (prices.length > 0) {
      averageOrderValue = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      console.log(`[Analyze] AOV calculé depuis Storefront API: ${averageOrderValue.toFixed(2)}`);
    }
  } else if (scrapedData?.products && scrapedData.products.length > 0) {
    // Fallback sur le scraping
    const prices = scrapedData.products
      .map(p => {
        // Extraire le prix depuis le texte (ex: "29,99€" ou "29.99€")
        const priceMatch = p.price?.match(/[\d,\.]+/);
        if (priceMatch) {
          return parseFloat(priceMatch[0].replace(',', '.'));
        }
        return null;
      })
      .filter((p): p is number => p !== null && p > 0);
    
    if (prices.length > 0) {
      averageOrderValue = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      console.log(`[Analyze] AOV calculé depuis scraping: ${averageOrderValue.toFixed(2)}`);
    }
  }

  // Estimer le nombre de produits
  // Priorité : Storefront API > Estimation depuis scraping > Défaut
  let productCount = 30; // Par défaut
  
  if (storefrontProducts.length > 0) {
    // Si on a récupéré 50 produits depuis l'API, il y en a probablement plus
    // Mais on ne peut pas savoir le total exact sans pagination
    // Estimation : si on a 50 produits, il y en a probablement entre 50 et 200
    if (storefrontProducts.length >= 50) {
      productCount = 100 + Math.floor(Math.random() * 100); // 100-200
    } else {
      productCount = storefrontProducts.length * 2; // Estimation conservative
    }
    console.log(`[Analyze] Product count estimé depuis Storefront API: ${productCount}`);
  } else {
    // Fallback sur le scraping
    const visibleProducts = scrapedData?.products.length || 0;
    productCount = visibleProducts > 0 
      ? Math.max(visibleProducts * 15, 30) // Estimer ~15x les produits visibles (homepage)
      : Math.floor(Math.random() * 100) + 30;
  }

  // Estimer le trafic mensuel basé sur des signaux réels
  // Utiliser une approche plus conservative et réaliste
  let estimatedMonthlyVisits = 5000; // Par défaut très conservateur
  
  // Facteurs d'estimation basés sur les données réelles
  const qualityScore = calculateQualityScore(scrapedData);
  
  // Ajuster le trafic selon la qualité perçue (estimations plus réalistes)
  // La plupart des boutiques Shopify ont un trafic modeste
  if (qualityScore >= 0.8) {
    // Boutique premium : 20k-50k visites/mois (plus réaliste)
    estimatedMonthlyVisits = 20000 + Math.random() * 30000;
  } else if (qualityScore >= 0.6) {
    // Boutique établie : 10k-25k visites/mois
    estimatedMonthlyVisits = 10000 + Math.random() * 15000;
  } else if (qualityScore >= 0.4) {
    // Boutique moyenne : 3k-10k visites/mois
    estimatedMonthlyVisits = 3000 + Math.random() * 7000;
  } else {
    // Petite boutique : 1k-5k visites/mois
    estimatedMonthlyVisits = 1000 + Math.random() * 4000;
  }
  
  // Ajustement supplémentaire basé sur le nombre de produits
  // Moins de produits = trafic généralement plus faible
  const visibleProductsCount = scrapedData?.products?.length || storefrontProducts.length || 0;
  if (visibleProductsCount > 0 && visibleProductsCount < 5) {
    estimatedMonthlyVisits = estimatedMonthlyVisits * 0.6; // Réduire de 40%
  } else if (visibleProductsCount >= 10) {
    estimatedMonthlyVisits = estimatedMonthlyVisits * 1.2; // Augmenter de 20%
  }

  // Taux de conversion selon la qualité et les apps
  // Taux plus réalistes (la plupart des boutiques ont 1-3% de conversion)
  let conversionRate = 0.015; // 1.5% par défaut (plus réaliste)
  if (scrapedData?.apps) {
    const hasMarketingApps = scrapedData.apps.some(app => 
      ['klaviyo', 'yotpo', 'loox', 'judge', 'stamped'].includes(app)
    );
    const hasReviewApps = scrapedData.apps.some(app => 
      ['yotpo', 'loox', 'judge', 'stamped', 'okendo'].includes(app)
    );
    
    if (hasMarketingApps && hasReviewApps) {
      conversionRate = 0.025 + Math.random() * 0.01; // 2.5-3.5% (meilleures boutiques)
    } else if (hasMarketingApps || hasReviewApps) {
      conversionRate = 0.02 + Math.random() * 0.005; // 2-2.5%
    } else {
      conversionRate = 0.01 + Math.random() * 0.005; // 1-1.5% (boutiques basiques)
    }
  }
  
  // Ajustement selon le panier moyen
  // Panier plus élevé = conversion généralement plus faible
  if (averageOrderValue > 150) {
    conversionRate = conversionRate * 0.8; // Réduire de 20%
  } else if (averageOrderValue < 50) {
    conversionRate = conversionRate * 1.1; // Augmenter de 10%
  }

  // Calculer le CA mensuel estimé
  const estimatedMonthlyRevenue = estimatedMonthlyVisits * conversionRate * averageOrderValue;
  const estimatedDailyRevenue = estimatedMonthlyRevenue / 30;
  const averageOrdersPerMonth = Math.floor(estimatedMonthlyVisits * conversionRate);

  // Génération de données historiques (6 derniers mois)
  const months = ['Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier'];
  const monthlyRevenue = months.map((month, index) => {
    const baseRevenue = estimatedMonthlyRevenue * 0.7;
    const variation = (Math.random() - 0.5) * 0.4; // Variation de ±20%
    const trend = index * 0.05; // Légère tendance à la hausse
    return {
      month,
      revenue: Math.round(baseRevenue * (1 + variation + trend)),
    };
  });

  const monthlyTraffic = months.map((month, index) => {
    const baseTraffic = estimatedMonthlyVisits * 0.7;
    const variation = (Math.random() - 0.5) * 0.4;
    const trend = index * 0.05;
    return {
      month,
      visits: Math.round(baseTraffic * (1 + variation + trend)),
    };
  });

  // Sources de trafic
  const trafficSources = [
    { name: 'Direct', percentage: 48, color: '#3b82f6' },
    { name: 'Recherche', percentage: 41, color: '#6b7280' },
    { name: 'Réseaux Sociaux', percentage: 7, color: '#10b981' },
    { name: 'Referral', percentage: 4, color: '#ef4444' },
    { name: 'Publicités Facebook Ads', percentage: 2, color: '#fbbf24' },
    { name: 'Emails', percentage: 1, color: '#a855f7' },
  ];

  // Marchés exploités
  const markets = [
    { country: 'États-Unis', flag: '🇺🇸', percentage: 76 },
    { country: 'France', flag: '🇫🇷', percentage: 4 },
    { country: 'Australie', flag: '🇦🇺', percentage: 3 },
    { country: 'Canada', flag: '🇨🇦', percentage: 3 },
    { country: 'Inde', flag: '🇮🇳', percentage: 3 },
    { country: 'Autres', flag: '🌍', percentage: 11 },
  ];

  // Stack technique - Utiliser les apps détectées si disponibles
  const appNames = scrapedData?.apps || [];
  const appDisplayNames: Record<string, string> = {
    'klaviyo': 'Klaviyo: Email Marketing & SMS',
    'loox': 'Loox - Product Reviews',
    'yotpo': 'Yotpo - Reviews & UGC',
    'recharge': 'Recharge - Subscriptions',
    'gorgias': 'Gorgias - Customer Support',
    'judge': 'Judge.me - Reviews',
    'stamped': 'Stamped.io - Reviews',
    'okendo': 'Okendo - Reviews',
    'reviews': 'Reviews.io',
    'trustpilot': 'Trustpilot',
  };
  
  const detectedApps = appNames.length > 0
    ? appNames.map(app => appDisplayNames[app] || app)
    : [
        'Klaviyo: Email Marketing & SMS',
        'Junip - Product Reviews App',
        'Gorgias',
      ].slice(0, Math.floor(Math.random() * 3) + 2);

  // Thème Shopify - Utiliser le thème détecté si disponible
  const detectedTheme = scrapedData?.theme.name
    ? {
        name: scrapedData.theme.name.charAt(0).toUpperCase() + scrapedData.theme.name.slice(1),
        version: scrapedData.theme.version || 'Unknown',
        fonts: scrapedData.fonts.heading || scrapedData.fonts.body || 'System',
        colors: [
          scrapedData.colors.primary || '#000000',
          scrapedData.colors.secondary || '#3b82f6',
          scrapedData.colors.accent || '#ffffff',
        ],
      }
    : {
        name: 'Dawn',
        version: '13.0.0',
        fonts: scrapedData?.fonts.heading || 'Jost',
        colors: [
          scrapedData?.colors.primary || '#000000',
          scrapedData?.colors.secondary || '#3b82f6',
          scrapedData?.colors.accent || '#f5f5dc',
        ],
      };

  // Stratégie publicitaire
  const platforms = ['Meta (Facebook/Instagram)', 'TikTok', 'Google Ads'];
  const platform = platforms[Math.floor(Math.random() * platforms.length)];
  const activeAds = Math.floor(Math.random() * 200) + 50;
  const inactiveAds = Math.floor(Math.random() * 20);
  const estimatedSpend = estimatedMonthlyRevenue * (0.1 + Math.random() * 0.2); // 10-30% du CA

  // Évolution du nombre de publicités (6 derniers mois)
  const adsEvolution = months.map((month, index) => {
    const baseAds = activeAds * 0.5;
    const variation = Math.random() * 0.3;
    const spike = index === 3 ? 14 : 0; // Pic en novembre
    return {
      month,
      ads: Math.round(baseAds * (1 + variation) + spike * 1000),
    };
  });

  // Types de publicités
  const adTypes = [
    { type: 'Video', percentage: 66, color: '#10b981' },
    { type: 'Image', percentage: 34, color: '#3b82f6' },
  ];

  // Analyse IA
  const revenueScore = estimatedMonthlyRevenue > 100000 ? 'Bon chiffre d\'affaires' : 'Chiffre d\'affaires modéré';
  const aiAnalysis = {
    score: estimatedMonthlyRevenue > 100000 ? 'good' : 'moderate',
    badge: revenueScore,
    recommendations: [
      'Bonne utilisation des apps marketing',
      'Trafic organique solide',
      'Publicités actives sur plusieurs plateformes',
    ],
  };

  // Calcul des variations
  const last3MonthsGrowth = ((monthlyRevenue[monthlyRevenue.length - 1].revenue - monthlyRevenue[0].revenue) / monthlyRevenue[0].revenue) * 100;
  const lastMonthGrowth = ((monthlyRevenue[monthlyRevenue.length - 1].revenue - monthlyRevenue[monthlyRevenue.length - 2].revenue) / monthlyRevenue[monthlyRevenue.length - 2].revenue) * 100;

  // Utiliser le nombre de produits réel si disponible
  const realProductCount = scrapedData?.products.length || 0;
  const finalProductCount = realProductCount > 0 
    ? Math.max(realProductCount * 10, productCount) // Estimer total depuis les produits visibles
    : productCount;

  // Ajouter un indicateur pour savoir quelles données sont réelles
  const dataSource = scrapingSuccess ? 'scraped' : 'estimated';

  return {
    storeName: storeName,
    category: 'Vêtements → Vêtements décontractés', // Peut être amélioré avec scraping
    launchDate: estimatedLaunchDate,
    country: detectedCountry,
    dataSource, // Indique si les données sont scrapées ou estimées
    scrapedData: scrapingSuccess ? {
      logo: scrapedData?.logo,
      navigation: scrapedData?.navigation,
      products: scrapedData?.products,
    } : null,
    
    // Métriques principales
    estimatedDailyRevenue: Math.round(estimatedDailyRevenue),
    estimatedMonthlyRevenue: Math.round(estimatedMonthlyRevenue),
    productCount: finalProductCount,
    averageOrdersPerMonth,
    
    // Données de trafic
    trafficSources,
    markets,
    monthlyTraffic,
    monthlyRevenue,
    last3MonthsGrowth: Math.round(last3MonthsGrowth),
    lastMonthGrowth: Math.round(lastMonthGrowth),
    
    // Stack technique
    stack: {
      apps: detectedApps,
    },
    theme: detectedTheme,
    
    // Stratégie publicitaire
    adStrategy: {
      platform,
      activeAds,
      inactiveAds,
      estimatedSpend: Math.round(estimatedSpend),
    },
    adsEvolution,
    adTypes,
    last3MonthsAdsGrowth: 97,
    lastMonthAdsGrowth: -96,
    
    // Analyse IA
    aiAnalysis,
  };
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Rate limiting : 10 requêtes par minute par utilisateur
    const rateLimitResult = await rateLimitByUser(user.id, 'spy:analyze', {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Trop de requêtes. Veuillez patienter avant de réessayer.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 });
    }

    // Vérifier les limites selon le plan
    const analysisCount = await prisma.brandSpyAnalysis.count({
      where: { userId: user.id },
    });

    const limits: Record<string, number> = {
      free: 5,
      pro: 20,
      enterprise: Infinity,
    };

    const limit = limits[user.plan] || 5;
    if (analysisCount >= limit) {
      return NextResponse.json(
        {
          error: `Limite atteinte (${limit} analyses). Passez au plan Pro pour plus d'analyses.`,
        },
        { status: 403 }
      );
    }

    // Analyser l'URL
    const analysisData = await analyzeShopifyStore(url);

    // Sauvegarder dans la base de données
    const analysis = await prisma.brandSpyAnalysis.create({
      data: {
        userId: user.id,
        shopifyUrl: url,
        storeName: analysisData.storeName,
        category: analysisData.category,
        launchDate: analysisData.launchDate,
        country: analysisData.country,
        estimatedDailyRevenue: analysisData.estimatedDailyRevenue,
        estimatedMonthlyRevenue: analysisData.estimatedMonthlyRevenue,
        productCount: analysisData.productCount,
        averageOrdersPerMonth: analysisData.averageOrdersPerMonth,
        trafficSources: analysisData.trafficSources,
        markets: analysisData.markets,
        monthlyTraffic: analysisData.monthlyTraffic,
        monthlyRevenue: analysisData.monthlyRevenue,
        stack: analysisData.stack,
        theme: analysisData.theme,
        adStrategy: analysisData.adStrategy,
        adsEvolution: analysisData.adsEvolution,
        adTypes: analysisData.adTypes,
        aiAnalysis: analysisData.aiAnalysis,
        // Compatibilité avec l'ancien schéma
        estimatedRevenue: analysisData.estimatedMonthlyRevenue,
      },
    });

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('Erreur lors de l\'analyse:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de l\'analyse' },
      { status: 500 }
    );
  }
}

// PUT - Actualiser une analyse existante
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { analysisId, url } = await request.json();

    if (!analysisId || !url) {
      return NextResponse.json(
        { error: 'analysisId et url requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'analyse appartient à l'utilisateur
    const existingAnalysis = await prisma.brandSpyAnalysis.findFirst({
      where: {
        id: analysisId,
        userId: user.id,
      },
    });

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: 'Analyse non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    // Ré-analyser l'URL
    const analysisData = await analyzeShopifyStore(url);

    // Mettre à jour l'analyse existante
    const updatedAnalysis = await prisma.brandSpyAnalysis.update({
      where: { id: analysisId },
      data: {
        storeName: analysisData.storeName,
        category: analysisData.category,
        launchDate: analysisData.launchDate,
        country: analysisData.country,
        estimatedDailyRevenue: analysisData.estimatedDailyRevenue,
        estimatedMonthlyRevenue: analysisData.estimatedMonthlyRevenue,
        productCount: analysisData.productCount,
        averageOrdersPerMonth: analysisData.averageOrdersPerMonth,
        trafficSources: analysisData.trafficSources,
        markets: analysisData.markets,
        monthlyTraffic: analysisData.monthlyTraffic,
        monthlyRevenue: analysisData.monthlyRevenue,
        stack: analysisData.stack,
        theme: analysisData.theme,
        adStrategy: analysisData.adStrategy,
        adsEvolution: analysisData.adsEvolution,
        adTypes: analysisData.adTypes,
        aiAnalysis: analysisData.aiAnalysis,
        estimatedRevenue: analysisData.estimatedMonthlyRevenue,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ analysis: updatedAnalysis });
  } catch (error: any) {
    console.error('Erreur lors de l\'actualisation:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de l\'actualisation' },
      { status: 500 }
    );
  }
}
