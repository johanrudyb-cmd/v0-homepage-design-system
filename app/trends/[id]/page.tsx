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
import {
  inferComplexityScore,
  inferSustainabilityScore,
  computeSaturability,
  computeTrendScore,
  estimateInternalTrendPercent,
} from '@/lib/trend-product-kpis';
import { isRetailerBrand } from '@/lib/constants/retailer-exclusion';
import { getBaseUrl } from '@/lib/utils';

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

  // Plan gratuit : max 3 analyses/mois (pour les produits non à la une ou pour l'analyseur)
  if (isFree && !isFeatured) {
    const checkImage = await getFeatureCountThisMonth(user.id, 'trends_check_image');
    const analyse = await getFeatureCountThisMonth(user.id, 'trends_analyse');
    const detailView = await getFeatureCountThisMonth(user.id, 'trends_detail_view');
    if (checkImage + analyse + detailView >= 3) {
      redirect('/trends?limit=reached');
    }
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
  const rawComplexity = product.complexityScore ?? inferComplexityScore(product.material, product.description);
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

  // Couleur, style, matière, entretien : affichés pour l’IA (générés par IA)
  // Pays d’origine, tailles, ref, lien source : retirés. Source = site principal de la marque.
  const infoRows: { label: string; value: string | React.ReactNode }[] = [
    { label: 'Catégorie', value: product.category },
    { label: 'Style', value: product.style || '—' },
    { label: 'Matière / composition', value: (product.material && product.material !== 'Non spécifié') ? product.material : '—' },
    { label: 'Couleur', value: product.color || '—' },
    { label: 'Entretien', value: product.careInstructions || '—' },
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
              className="text-primary hover:underline inline-flex items-center gap-1 text-sm font-medium"
            >
              Voir le site <ExternalLink className="w-3.5 h-3.5" />
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
        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          {/* Header - Sticky on mobile */}
          <div className="sticky top-14 sm:top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-background/80 backdrop-blur-md border-b border-black/5 flex items-center gap-4">
            <BackToTrendsButton />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-[#1D1D1F] truncate">
                {product.name}
              </h1>
              <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
                Tendances de la semaine · KPIs marketing
              </p>
            </div>
          </div>

          {/* Row 1: Widgets KPIs + Produit (style Copyfy) */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Widget Données tendance (éditable ; % interne affiché quand pas de % source) */}
            <div className="relative">
              {shouldLockTrend && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-xl p-4 text-center">
                  <Lock className="w-8 h-8 text-white mb-2 animate-pulse" />
                  <p className="text-white text-xs font-bold mb-3 uppercase tracking-wider">Données réservées</p>
                  <Link
                    href="/auth/choose-plan"
                    className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-gray-100 shadow-xl transition-all"
                  >
                    Plan Créateur
                  </Link>
                </div>
              )}
              <div className={shouldLockTrend ? 'opacity-0' : ''}>
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

            {/* Widget Produit (image + infos clés) */}
            <Card className="border bg-card shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Produit
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-36 aspect-[3/4] rounded-xl bg-muted shrink-0 overflow-hidden relative shadow-apple-sm">
                  {shouldLockTrend && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-lg p-2 text-center">
                      <Lock className="w-6 h-6 text-white mb-1 animate-pulse" />
                    </div>
                  )}
                  <div className={shouldLockTrend ? 'opacity-0' : ''}>
                    <ProductDetailImage
                      imageUrl={product.imageUrl}
                      alt={product.name ?? ''}
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1 grid grid-cols-2 gap-x-4 gap-y-3 text-sm py-1">
                  <div>
                    <p className="text-[#1D1D1F]/40 text-[11px] font-bold uppercase tracking-wider mb-0.5">Catégorie</p>
                    <p className="font-semibold text-[#1D1D1F] capitalize">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-[#1D1D1F]/40 text-[11px] font-bold uppercase tracking-wider mb-0.5">Style</p>
                    <p className="font-semibold text-[#1D1D1F] capitalize truncate">{product.style || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[#1D1D1F]/40 text-[11px] font-bold uppercase tracking-wider mb-0.5">Segment</p>
                    <p className="font-semibold text-[#1D1D1F] capitalize">{product.segment || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[#1D1D1F]/40 text-[11px] font-bold uppercase tracking-wider mb-0.5">Zone</p>
                    <p className="font-semibold text-[#1D1D1F]">{product.marketZone || '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row KPIs : 3 sections (Pérennité radar, Sourcing, Visuels) */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. Présent dans le radar depuis */}
            <Card className="border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Présent dans le radar depuis
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Durée de suivi de cette tendance. Plus c&apos;est long, plus c&apos;est une tendance de fond (et non un buzz éphémère).
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {daysInRadar <= 0 ? 'Aujourd\'hui' : daysInRadar === 1 ? '1 jour' : `${daysInRadar} jours`}
                </p>
              </CardContent>
            </Card>

            {/* 2. KPIs Sourcing & Production */}
            <Card className="border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Factory className="w-4 h-4 text-primary" />
                  Sourcing & Production
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Complexité de fabrication, score durabilité (ESG).
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Complexité fabrication</p>
                  <p className="font-semibold capitalize">{complexityScore}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Score durabilité (ESG)</p>
                  <p className="font-semibold">
                    {sustainabilityScore != null ? `${sustainabilityScore}/100` : '—'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 3. KPIs Visuels & Design */}
            <Card className="border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Visuels & Design
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Attractivité visuelle, attribut dominant.
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Score attractivité visuelle</p>
                  <p className="font-semibold">
                    {product.visualAttractivenessScore != null
                      ? `${product.visualAttractivenessScore}/100`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Dominance de l&apos;attribut</p>
                  <p className="font-medium text-foreground line-clamp-3">
                    {product.dominantAttribute || '—'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            {shouldLockTrend && (
              <div className="absolute inset-x-0 -top-4 -bottom-4 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl p-8 text-center">
                <Lock className="w-12 h-12 text-white mb-4 animate-pulse" />
                <h3 className="text-white text-xl font-bold mb-4">Graphiques Tendances Bloqués</h3>
                <Link
                  href="/auth/choose-plan"
                  className="px-8 py-3 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-100 shadow-xl transition-all scale-110"
                >
                  Débloquer avec le plan Créateur
                </Link>
              </div>
            )}
            <div className={shouldLockTrend ? 'opacity-10 grayscale blur-md pointer-events-none' : ''}>
              {/* Graphiques KPIs */}
              <ProductDetailCharts
                saturability={displaySaturability}
                sustainabilityScore={sustainabilityScore ?? null}
                visualAttractivenessScore={product.visualAttractivenessScore ?? null}
                complexityScore={complexityScore}
              />
            </div>
          </div>

          {/* Table Infos pour ton article */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Infos pour développer ton article
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Données utiles pour rédiger ton article ou brief produit.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Donnée</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {infoRows.map((row) => (
                      <tr key={row.label} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium text-muted-foreground">{row.label}</td>
                        <td className="py-3 px-4 font-medium min-w-0 break-words" title={typeof row.value === 'string' ? row.value : undefined}>
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {product.description && (
                <div className="p-4 border-t">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Description / fiche produit</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {product.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analyseur de tendances visuel — toute la largeur */}
        <div className="w-full border-t bg-muted/10 px-6 lg:px-8 py-12 space-y-8">
          <div className="max-w-4xl mx-auto">
            <VisualTrendScanner />
          </div>
        </div>
      </ProductDetailEnricher>
    </DashboardLayout>
  );
}
