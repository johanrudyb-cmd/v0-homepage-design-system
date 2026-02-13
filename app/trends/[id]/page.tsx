import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getFeatureCountThisMonth } from '@/lib/ai-usage';
import { TrendViewRecorder } from '@/components/trends/TrendViewRecorder';
import {
  Package,
  FileText,
  ExternalLink,
  Calendar,
  Factory,
  ImageIcon,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { ProductDetailImage } from '@/components/trends/ProductDetailImage';
import { ProductDetailCharts } from '@/components/trends/ProductDetailCharts';
import { EditTrendKpis } from '@/components/trends/EditTrendKpis';
import { ProductDetailEnricher } from '@/components/trends/ProductDetailEnricher';
import { BackToTrendsButton } from '@/components/trends/BackToTrendsButton';
import { VisualTrendScanner } from '@/components/trends/VisualTrendScanner';
import { UsageBadge } from '@/components/trends/UsageBadge';
import {
  inferComplexityScore,
  inferSustainabilityScore,
  computeSaturability,
  computeTrendScore,
  estimateInternalTrendPercent,
  inferSmartDefaults,
} from '@/lib/trend-product-kpis';
import { isRetailerBrand } from '@/lib/constants/retailer-exclusion';
import { getBaseUrl, cn } from '@/lib/utils';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');

  // Vérifier si le produit est à la une (visible gratuitement)
  let isFeatured = false;
  try {
    const featuredRes = await fetch(`${getBaseUrl()}/api/trends/homepage-featured`);
    if (featuredRes.ok) {
      const data = await featuredRes.json();
      isFeatured = (data.trends || []).some((t: any) => t.id === id);
    }
  } catch (e) {
    console.error('Error fetching featured status:', e);
  }

  const isFree = user.plan === 'free';
  const shouldLockTrend = isFree && !isFeatured;

  // Quotas réels : 3 / mois pour gratuit, 10 / mois pour Créateur
  const checkImage = await getFeatureCountThisMonth(user.id, 'trends_check_image');
  const analyse = await getFeatureCountThisMonth(user.id, 'trends_analyse');
  const detailView = await getFeatureCountThisMonth(user.id, 'trends_detail_view');
  const analysesCount = checkImage + analyse + detailView;
  const maxAnalyses = isFree ? 3 : 10;

  if (!isFeatured && analysesCount >= maxAnalyses) {
    redirect('/trends?limit=reached');
  }

  const product = await prisma.trendProduct.findUnique({
    where: { id },
  });

  if (!product) {
    redirect('/trends');
  }

  // Jours depuis l'ajout dans le radar (pour calcul saturabilité)
  const daysInRadar = Math.floor((Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  // Récurrence catégorie+segment pour calcul interne du % tendance (quand pas de % source)
  const recurrenceInCategory = await prisma.trendProduct.count({
    where: {
      category: product.category,
      segment: product.segment ?? undefined,
      marketZone: product.marketZone ?? undefined,
    },
  });

  const effectiveTrendGrowthPercent =
    product.trendGrowthPercent ??
    estimateInternalTrendPercent({
      trendGrowthPercent: product.trendGrowthPercent ?? null,
      trendScoreVisual: product.trendScoreVisual ?? null,
      isGlobalTrendAlert: product.isGlobalTrendAlert ?? false,
      daysInRadar,
      recurrenceInCategory,
    });

  // Saturabilité et score tendance : calcul réaliste si valeur en base = défaut (50), sinon garder la valeur (ex. IA)
  const isDefaultSaturability = product.saturability === 50 && (product.trendScoreVisual == null || product.trendScoreVisual === 50);
  const displaySaturability = isDefaultSaturability && (effectiveTrendGrowthPercent > 0 || daysInRadar > 0)
    ? computeSaturability(effectiveTrendGrowthPercent, product.trendLabel ?? null, daysInRadar)
    : product.saturability;
  const displayTrendScore = (product.trendScoreVisual == null || product.trendScoreVisual === 50)
    ? computeTrendScore(effectiveTrendGrowthPercent, product.trendLabel ?? null)
    : (product.trendScoreVisual ?? product.trendScore ?? 50);

  const getSaturabilityStyle = (score: number) => {
    if (score < 30) return { label: 'Opportunité', class: 'text-green-600 bg-green-500/10 border-green-500/30' };
    if (score < 60) return { label: 'Modéré', class: 'text-amber-600 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Saturé', class: 'text-red-600 bg-red-500/10 border-red-500/30' };
  };

  const saturabilityStyle = getSaturabilityStyle(displaySaturability);

  // KPIs calculés ou depuis la BDD
  // Complexité fabrication : priorité à l'IA, fallback note interne (heuristique matière/description)
  const rawComplexity = product.complexityScore ?? inferComplexityScore(product.material, product.description, product.category);
  const complexityScore = rawComplexity === 'Différent' || rawComplexity?.toLowerCase() === 'different' ? 'Complexe' : rawComplexity;
  const sustainabilityScore = product.sustainabilityScore ?? inferSustainabilityScore(product.material, product.description);

  // Marque de l'article uniquement — ne jamais afficher Zalando, Zara ou ASOS (distributeurs)
  const displayBrand = (() => {
    if (product.productBrand?.trim()) {
      if (isRetailerBrand(product.productBrand)) return '—';
      return product.productBrand.trim();
    }
    if (product.sourceBrand?.trim()) {
      if (isRetailerBrand(product.sourceBrand)) return '—';
      return product.sourceBrand.trim();
    }
    const first = product.name.trim().split(/\s+/)[0];
    if (first && first.length >= 2 && first.length <= 25 && !isRetailerBrand(first) && !/sweat|hoodie|t-shirt|tee|cargo|pantalon|veste|jacket|short|pull|robe|blouson|polo|jean|legging/i.test(first.toLowerCase())) {
      return first;
    }
    return '—';
  })();

  const infoRows: { label: string; value: string | React.ReactNode }[] = [
    { label: 'Catégorie', value: product.category },
    { label: 'Style', value: product.style || inferSmartDefaults(product.category, 'style') },
    { label: 'Matière', value: (product.material && product.material !== 'Non spécifié') ? product.material : inferSmartDefaults(product.category, 'material') },
    { label: 'Couleur', value: product.color || inferSmartDefaults(product.category, 'color') },
    { label: 'Entretien', value: product.careInstructions || inferSmartDefaults(product.category, 'careInstructions') },
    { label: 'Segment', value: product.segment ? String(product.segment).charAt(0).toUpperCase() + product.segment.slice(1) : '—' },
    { label: 'Zone marché', value: product.marketZone || '—' },
    { label: 'Marque', value: displayBrand },
    ...(product.brandWebsiteUrl
      ? [
        {
          label: 'Site marque',
          value: (
            <a
              href={product.brandWebsiteUrl.startsWith('http') ? product.brandWebsiteUrl : `https://${product.brandWebsiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#007AFF] hover:underline inline-flex items-center gap-1 text-sm font-bold"
            >
              Lien direct <ExternalLink className="w-3 h-3" />
            </a>
          ),
        },
      ]
      : []),
  ];

  return (
    <DashboardLayout>
      {user.plan === 'free' && <TrendViewRecorder trendId={product.id} />}
      <ProductDetailEnricher productId={product.id} product={product}>
        <div className="min-h-screen bg-[#F5F5F7] pb-24">
          {/* Main Sticky Header - Apple Style */}
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.05] px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                  <h1 className="text-xl font-bold tracking-tight text-[#1D1D1F] truncate leading-tight">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6e6e73]/60 px-1.5 py-0.5 bg-black/5 rounded">
                      Detail Report
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#007AFF] px-1.5 py-0.5 bg-[#007AFF]/10 rounded">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-12 animate-fade-in">
            {/* Row 1: Widget Données & Image */}
            <div className="grid gap-8 md:grid-cols-5">
              {/* Product Visual - Bigger & Cleaner */}
              <div className="md:col-span-2 space-y-4">
                <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden shadow-apple-lg bg-white group">
                  {shouldLockTrend && (
                    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl p-8 text-center animate-fade-in">
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 shadow-apple">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-black text-black mb-3 tracking-tight">Analyse Exclusive</h3>
                      <p className="text-sm text-[#6e6e73] mb-8 font-medium max-w-[200px] mx-auto">
                        Cette analyse est réservée aux membres Créateur.
                      </p>
                      <Link
                        href="/auth/choose-plan"
                        className="px-8 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-black/90 transition-all active:scale-95 shadow-xl"
                      >
                        Débloquer maintenant
                      </Link>
                    </div>
                  )}
                  <div className={cn("w-full h-full text-center", shouldLockTrend ? 'opacity-20 blur-sm' : '')}>
                    <ProductDetailImage
                      imageUrl={product.imageUrl}
                      alt={product.name ?? ''}
                      className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>

                  {/* Floating Score on Image */}
                  {!shouldLockTrend && displayTrendScore && (
                    <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-apple-lg text-right">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-[-2px]">IVS Index</div>
                      <div className="text-xl font-black text-white tracking-tighter">{displayTrendScore}%</div>
                    </div>
                  )}
                </div>

                {/* Quick Info Grid under image */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white rounded-[24px] shadow-apple border border-black/[0.03]">
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#6e6e73] mb-1.5 text-center">Segment</p>
                    <p className="text-sm font-black text-black capitalize text-center">{product.segment || '—'}</p>
                  </div>
                  <div className="p-4 bg-white rounded-[24px] shadow-apple border border-black/[0.03]">
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#6e6e73] mb-1.5 text-center">Zone</p>
                    <p className="text-sm font-black text-black text-center">{product.marketZone || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Data Widgets */}
              <div className="md:col-span-3 flex flex-col gap-6">
                <div className="relative flex-1">
                  {shouldLockTrend && (
                    <div className="absolute inset-0 z-30 bg-[#F5F5F7]/40 backdrop-blur-[2px] rounded-[24px]" />
                  )}
                  <div className={cn("h-full", shouldLockTrend ? 'pointer-events-none opacity-20 filter grayscale blur-sm' : '')}>
                    <EditTrendKpis
                      productId={product.id}
                      trendGrowthPercent={product.trendGrowthPercent ?? (effectiveTrendGrowthPercent > 0 ? effectiveTrendGrowthPercent : null)}
                      trendLabel={product.trendLabel ?? (product.trendGrowthPercent == null && effectiveTrendGrowthPercent > 0 ? 'Estimé' : null)}
                      displaySaturability={displaySaturability}
                      saturabilityStyle={saturabilityStyle}
                      isInternalPercent={product.trendGrowthPercent == null && effectiveTrendGrowthPercent > 0}
                    />
                  </div>
                </div>

                {/* Secondary KPIs in Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-white rounded-[24px] shadow-apple border border-black/[0.03] space-y-3">
                    <div className="flex items-center gap-2 text-[#6e6e73]">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Temps de suivi</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-black tracking-tight">
                        {daysInRadar <= 0 ? 'New' : daysInRadar === 1 ? '1 jour' : `${daysInRadar} jours`}
                      </p>
                      <p className="text-[10px] text-[#6e6e73] font-medium mt-1">Stabilité de la tendance</p>
                    </div>
                  </div>

                  <div className="p-5 bg-white rounded-[24px] shadow-apple border border-black/[0.03] space-y-3">
                    <div className="flex items-center gap-2 text-[#6e6e73]">
                      <Package className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Attrait Visuel</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-black tracking-tight">
                        {product.visualAttractivenessScore ? `${product.visualAttractivenessScore}/100` : '—'}
                      </p>
                      <p className="text-[10px] text-[#6e6e73] font-medium mt-1">Score esthétique IA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Charts Section */}
            <div className="relative pt-8">
              {!shouldLockTrend && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-black/[0.05]" />
                  <h2 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6e6e73]/60">Visualization Analytics</h2>
                  <div className="h-px flex-1 bg-black/[0.05]" />
                </div>
              )}

              <div className="relative">
                {shouldLockTrend && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#F5F5F7]/60 backdrop-blur-md rounded-[32px] p-8 text-center border border-white">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4 shadow-apple">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-black text-black mb-2">Visualisations détaillées</h3>
                    <p className="text-sm text-[#6e6e73] max-w-xs mb-6 font-medium">Dépassez les chiffres avec nos graphiques de performance.</p>
                  </div>
                )}
                <div className={cn(shouldLockTrend ? 'opacity-20 blur-md grayscale pointer-events-none' : '')}>
                  <ProductDetailCharts
                    saturability={displaySaturability}
                    sustainabilityScore={sustainabilityScore ?? null}
                    visualAttractivenessScore={product.visualAttractivenessScore ?? null}
                    complexityScore={complexityScore}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Product Info Grid (Modern replacement for table) */}
            <div className="space-y-6 pt-8">
              <div className="flex items-center gap-3">
                <h2 className="text-[15px] font-black text-black tracking-tight">Développement Article</h2>
                <div className="h-px flex-1 bg-black/[0.05]" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {infoRows.map((row) => (
                  <div key={row.label as string} className="p-5 bg-white rounded-[24px] shadow-apple border border-black/[0.03] flex flex-col justify-between group transition-apple hover:scale-[1.02]">
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#6e6e73] mb-3">{row.label}</p>
                    <div className="text-sm font-black text-black group-hover:text-[#007AFF] transition-colors leading-snug">
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>

              {product.description && (
                <div className="p-8 bg-white rounded-[24px] shadow-apple border border-black/[0.03]">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-[#6e6e73]" />
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#6e6e73]">Analyse Contextuelle</p>
                  </div>
                  <p className="text-[15px] text-[#1D1D1F] leading-relaxed whitespace-pre-wrap font-medium">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Row 4: Visual Scanner */}
            <div className="pt-12 border-t border-black/[0.05]">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-black text-black tracking-tighter">Scanner Visuel Outfity</h2>
                <p className="text-[#6e6e73] max-w-sm mx-auto text-sm font-medium">Analysez l&apos;ADN mode de n&apos;importe quelle image pour détecter les points de corrélation.</p>
              </div>
              <div className="bg-white rounded-[32px] shadow-apple-lg border border-black/[0.03] p-8 sm:p-12 overflow-hidden">
                <VisualTrendScanner />
              </div>
            </div>
          </div>
        </div>
      </ProductDetailEnricher>
    </DashboardLayout>
  );
}
