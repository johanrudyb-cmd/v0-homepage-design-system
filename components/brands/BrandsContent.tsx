'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { USAGE_REFRESH_EVENT } from '@/lib/hooks/useAIUsage';
import { useQuota } from '@/lib/hooks/useQuota';
import { ConfirmGenerateModal } from '@/components/ui/confirm-generate-modal';
import { GenerationLoadingPopup } from '@/components/ui/generation-loading-popup';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { CURATED_TOP_BRANDS, CYCLE_PHASE_LABELS, LAUNCH_POTENTIAL_LABELS, getBrandLogoUrl, brandNameToSlug, type CuratedBrand } from '@/lib/curated-brands';
import { BrandLogo } from './BrandLogo';

/** URLs des sites officiels des marques (aucune plateforme). */
const BRAND_URLS: Record<string, string> = {
  "arc'teryx": 'https://arcteryx.com/fr/fr/',
  'stone island': 'https://www.stoneisland.com/fr/',
  zara: 'https://www.zara.com/fr/',
  adidas: 'https://www.adidas.fr/',
  'massimo dutti': 'https://www.massimodutti.com/fr/',
  'carhartt wip': 'https://www.carhartt-wip.com/',
  'ami paris': 'https://amiparis.com/fr/',
  salomon: 'https://www.salomon.com/fr-fr/',
  'mango man': 'https://shop.mango.com/fr/',
  mango: 'https://shop.mango.com/fr/',
  "h&m edition": 'https://www2.hm.com/fr_fr/',
};

function getBrandUrl(brand: string): string {
  const key = brand.toLowerCase().trim();
  return BRAND_URLS[key] ?? BRAND_URLS[key.replace(/\s+/g, ' ')] ?? '#';
}

function getDomain(url: string): string {
  if (!url || url === '#') return '';
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}


export function BrandsContent() {
  const router = useRouter();
  const brands = CURATED_TOP_BRANDS;
  const [loadingBrand, setLoadingBrand] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showConfirmAnalyze, setShowConfirmAnalyze] = useState(false);
  const [brandToAnalyze, setBrandToAnalyze] = useState<CuratedBrand | null>(null);
  const analyzeQuota = useQuota('brand_analyze');

  const handleAnalyze = async (brand: CuratedBrand) => {
    setLoadingBrand(brand.brand);
    setError('');

    const context = {
      signaturePiece: brand.signaturePiece,
      dominantStyle: brand.dominantStyle,
      cyclePhase: CYCLE_PHASE_LABELS[brand.cyclePhase],
      launchPotential: LAUNCH_POTENTIAL_LABELS[brand.launchPotential],
      indicativePrice: brand.indicativePrice,
      rank: brand.rank,
      score: brand.score,
    };

    try {
      const res = await fetch('/api/brands/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName: brand.brand, context }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse');
      }

      window.dispatchEvent(new CustomEvent(USAGE_REFRESH_EVENT));
      router.push(`/brands/analyze/${brandNameToSlug(brand.brand)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoadingBrand(null);
    }
  };

  return (
    <div className="space-y-6">
      <GenerationLoadingPopup
        open={!!loadingBrand}
        title={loadingBrand ? `Analyse de ${loadingBrand} en cours…` : 'Analyse en cours…'}
      />
      {/* Header + CTA Analyse marques tendances */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Marques tendances
          </h1>
          <p className="text-muted-foreground text-sm">
            Cliquez sur &quot;Analyser&quot; pour ouvrir le rapport détaillé (graphiques, copier, dupliquer stratégie).
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      {/* Tableau marques */}
      <Card className="border-2 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-4 px-4 font-semibold text-sm">Rang</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Marque</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Score de tendance</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Phase</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Potentiel</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Prix indicatif</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Pièce maîtresse (EU)</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Style dominant</th>
                  <th className="text-right py-4 px-4 font-semibold text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => {
                  const websiteUrl = getBrandUrl(brand.brand);
                  const domain = getDomain(websiteUrl);
                  const isLoading = loadingBrand === brand.brand;
                  return (
                    <tr
                      key={brand.brand}
                      className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="py-4 px-4">
                        <span className="font-bold text-primary">#{brand.rank}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <BrandLogo
                            logoUrl={getBrandLogoUrl(brand.brand)}
                            brandName={brand.brand}
                            className="w-12 h-12"
                          />
                          <div>
                            <p className="font-semibold">{brand.brand}</p>
                            <a
                              href={websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                              {domain}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                          {brand.score}
                          <span className="text-green-500">↑</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${
                            brand.cyclePhase === 'emergent'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : brand.cyclePhase === 'croissance'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : brand.cyclePhase === 'pic'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {CYCLE_PHASE_LABELS[brand.cyclePhase]}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${
                            brand.launchPotential === 'opportunite'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : brand.launchPotential === 'a_surveiller'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          {LAUNCH_POTENTIAL_LABELS[brand.launchPotential]}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        {brand.indicativePrice}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground max-w-[180px]">
                        {brand.signaturePiece}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                          {brand.dominantStyle}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => { setBrandToAnalyze(brand); setShowConfirmAnalyze(true); }}
                            disabled={!!loadingBrand}
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            {isLoading ? 'Analyse…' : 'Analyser'}
                          </Button>
                          <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <ExternalLink className="w-4 h-4" />
                              Visiter
                            </Button>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmGenerateModal
        open={showConfirmAnalyze}
        onClose={() => { setShowConfirmAnalyze(false); setBrandToAnalyze(null); }}
        onConfirm={() => {
          const b = brandToAnalyze;
          setShowConfirmAnalyze(false);
          setBrandToAnalyze(null);
          if (b) handleAnalyze(b);
        }}
        actionLabel={brandToAnalyze ? `Analyser ${brandToAnalyze.brand}` : 'Analyser cette marque'}
        remaining={analyzeQuota?.remaining ?? 0}
        limit={analyzeQuota?.limit ?? 10}
        loading={!!loadingBrand}
      />
    </div>
  );
}
