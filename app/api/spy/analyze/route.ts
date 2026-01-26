import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Fonction pour analyser une URL Shopify avec données complètes
async function analyzeShopifyStore(url: string) {
  // Extraction du domaine
  let domain = '';
  try {
    const urlObj = new URL(url);
    domain = urlObj.hostname.replace('www.', '').replace('.myshopify.com', '');
  } catch {
    throw new Error('URL invalide');
  }

  // Génération de données complètes (mock pour MVP)
  const estimatedMonthlyVisits = Math.floor(Math.random() * 50000) + 10000;
  const averageOrderValue = 80 + Math.random() * 40; // 80-120€
  const conversionRate = 0.02 + Math.random() * 0.03; // 2-5%
  
  const estimatedMonthlyRevenue = estimatedMonthlyVisits * conversionRate * averageOrderValue;
  const estimatedDailyRevenue = estimatedMonthlyRevenue / 30;
  const averageOrdersPerMonth = Math.floor(estimatedMonthlyVisits * conversionRate);
  const productCount = Math.floor(Math.random() * 100) + 30;

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

  // Stack technique
  const commonApps = [
    'Klaviyo: Email Marketing & SMS',
    'Junip - Product Reviews App',
    'Intelligems: A/B Testing',
    'KNO Post Purchase Surveys',
    'Loop Returns & Exchanges',
    'Gorgias',
    'Recharge',
    'Bold',
  ];
  
  const detectedApps = commonApps
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 4) + 3);

  // Thème Shopify avec détails
  const themes = [
    { name: 'Dawn 13.0.0', version: '13.0.0', fonts: 'Jost', colors: ['#000000', '#3b82f6', '#f5f5dc', '#b70000', '#8b6726'] },
    { name: 'Freshwater 2.3.9', version: '2.3.9', fonts: 'Inter', colors: ['#1a1a1a', '#2563eb', '#ffffff', '#dc2626'] },
    { name: 'Brooklyn', version: '9.0.0', fonts: 'Montserrat', colors: ['#000000', '#ffffff', '#f5f5f5'] },
  ];
  const detectedTheme = themes[Math.floor(Math.random() * themes.length)];

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

  return {
    storeName: domain.charAt(0).toUpperCase() + domain.slice(1),
    category: 'Vêtements → Vêtements décontractés',
    launchDate: 'Mai 2024',
    country: 'États-Unis',
    
    // Métriques principales
    estimatedDailyRevenue: Math.round(estimatedDailyRevenue),
    estimatedMonthlyRevenue: Math.round(estimatedMonthlyRevenue),
    productCount,
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
