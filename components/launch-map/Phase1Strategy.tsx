'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Copy, ExternalLink, AlertTriangle, FileText, History, Sparkles } from 'lucide-react';
import { getBrandLogoUrl } from '@/lib/curated-brands';
import { POSITIONING_OPTIONS } from '@/lib/constants/identity-options';
import {
  getReferenceBrandsForPositioning,
  getTargetAudienceOptionsForPositioning,
  getPositioningAudienceInconsistencyMessage,
  REFERENCE_BRAND_WEBSITES,
} from '@/lib/constants/audience-reference-brands';
import { BrandLogo } from '@/components/brands/BrandLogo';
import { PreviewWatermark } from '@/components/ui/preview-watermark';
import { StrategyPresentationView } from './StrategyPresentationView';
import type { BrandIdentity } from './LaunchMapStepper';
import { cn } from '@/lib/utils';
import { GenerationLoadingPopup } from '@/components/ui/generation-loading-popup';
import { GenerationCostBadge } from '@/components/ui/generation-cost-badge';
import { ConfirmGenerateModal } from '@/components/ui/confirm-generate-modal';
import { USAGE_REFRESH_EVENT } from '@/lib/hooks/useAIUsage';
import { useQuota } from '@/lib/hooks/useQuota';
import { useSurplusModal } from '@/components/usage/SurplusModalContext';
import { STRATEGY_VIEW_ONBOARDING_LIMIT } from '@/lib/quota-config';

interface Phase1StrategyProps {
  brandId: string;
  brand?: BrandIdentity | null;
  onComplete: () => void;
  /** Mode test (onboarding) : aucun enregistrement, simulation uniquement */
  demoMode?: boolean;
  userPlan?: string;
}

function styleGuideField(sg: Record<string, unknown> | null | undefined, key: string): string {
  if (!sg || typeof sg !== 'object') return '';
  const v = sg[key];
  return typeof v === 'string' ? v : '';
}

/** Contexte envoyé à l’IA pour qu’elle parle de la marque à partir de tes vrais choix (positionnement, cible, story, etc.). */
function buildCreatorBrandContext(b: Phase1StrategyProps['brand']): string {
  if (!b?.name?.trim()) return '';
  const parts: string[] = [`Marque : ${b.name.trim()}`];
  if (b.domain?.trim()) parts.push(`Site / domaine : ${b.domain.trim()}`);
  if (b.styleGuide && typeof b.styleGuide === 'object') {
    const sg = b.styleGuide as Record<string, unknown>;
    if (typeof sg.story === 'string' && sg.story.trim()) {
      parts.push(`Pourquoi le créateur a créé sa marque : ${sg.story.trim()}`);
    }
    const fields = ['tagline', 'description', 'mainProduct', 'stage', 'positioning', 'preferredStyle', 'targetAudience'] as const;
    for (const key of fields) {
      const v = sg[key];
      if (typeof v === 'string' && v.trim()) parts.push(`${key} : ${v.trim()}`);
    }
  }
  if (b.socialHandles && typeof b.socialHandles === 'object') {
    const handles = b.socialHandles as Record<string, string>;
    const list = Object.entries(handles).filter(([, v]) => v?.trim()).map(([k, v]) => `${k}: ${v}`).join(', ');
    if (list) parts.push(`Réseaux : ${list}`);
  }
  return parts.join('\n');
}

function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
}

function formatStrategyForPresentation(raw: string): ({ type: 'section'; title: string } | { type: 'paragraph'; text: string })[] {
  const cleaned = stripMarkdownBold(raw);
  const blocks: ({ type: 'section'; title: string } | { type: 'paragraph'; text: string })[] = [];
  const sectionRe = /^##\s+(.+)$/gm;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = sectionRe.exec(cleaned)) !== null) {
    const before = cleaned.slice(lastIndex, match.index).trim();
    if (before) {
      before.split(/\n\n+/).forEach((p) => {
        const t = p.trim();
        if (t) blocks.push({ type: 'paragraph', text: t });
      });
    }
    blocks.push({ type: 'section', title: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }
  const tail = cleaned.slice(lastIndex).trim();
  if (tail) {
    tail.split(/\n\n+/).forEach((p) => {
      const t = p.trim();
      if (t) blocks.push({ type: 'paragraph', text: t });
    });
  }
  return blocks;
}

export function Phase1Strategy({ brandId, brand, onComplete, demoMode = false, userPlan = 'free' }: Phase1StrategyProps) {
  const router = useRouter();
  const sg = brand?.styleGuide && typeof brand.styleGuide === 'object' ? brand.styleGuide as Record<string, unknown> : null;
  const strategyQuota = useQuota('brand_strategy');
  const strategyViewQuota = useQuota('strategy_view');
  const logoQuota = useQuota('brand_logo');
  const openSurplusModal = useSurplusModal();

  const [positioning, setPositioning] = useState(() => styleGuideField(sg, 'preferredStyle') || styleGuideField(sg, 'positioning') || '');
  const [targetAudience, setTargetAudience] = useState(() => styleGuideField(sg, 'targetAudience') || '');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyResult, setStrategyResult] = useState<string | null>(null);
  const [strategyError, setStrategyError] = useState('');
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [strategyHistory, setStrategyHistory] = useState<{ id: string; templateBrandSlug: string; templateBrandName: string; strategyText: string; positioning: string | null; targetAudience: string | null; visualIdentity?: { colorPalette?: { primary?: string; secondary?: string; accent?: string }; typography?: { heading?: string; body?: string }; logoRecommendation?: string }; createdAt: string }[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [viewingFromHistory, setViewingFromHistory] = useState<{ templateBrandSlug: string; templateBrandName: string; positioning: string | null; targetAudience: string | null; visualIdentity?: { colorPalette?: { primary?: string; secondary?: string; accent?: string }; typography?: { heading?: string; body?: string }; logoRecommendation?: string } } | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<{ templateBrandName: string; templateBrandSlug: string; visualIdentity?: { colorPalette?: { primary?: string; secondary?: string; accent?: string }; typography?: { heading?: string; body?: string }; logoRecommendation?: string } } | null>(null);
  const [templateStrategyLoading, setTemplateStrategyLoading] = useState(false);
  const [templateStrategyError, setTemplateStrategyError] = useState('');
  const [savedScrollY, setSavedScrollY] = useState<number>(0);
  const [lastCalquedVisualIdentity, setLastCalquedVisualIdentity] = useState<{ colorPalette?: { primary?: string; secondary?: string; accent?: string }; typography?: { heading?: string; body?: string }; logoRecommendation?: string } | undefined>(undefined);
  const [validateLoading, setValidateLoading] = useState(false);
  const [validateError, setValidateError] = useState('');
  const [logoGenerating, setLogoGenerating] = useState(false);
  const [logoError, setLogoError] = useState('');
  /** Après validation de la stratégie, si pas de logo : on affiche la page « Créez votre logo » (étape suivante chronologique). */
  const [showLogoStep, setShowLogoStep] = useState(false);
  /** 4 propositions de logo (url + urlTransparent) après génération. */
  const [logoProposals, setLogoProposals] = useState<Array<{ url: string; urlTransparent: string }>>([]);
  const [analyzedBrandsFromDb, setAnalyzedBrandsFromDb] = useState<Array<{ brandName: string; slug: string }>>([]);
  const [showConfirmLogo, setShowConfirmLogo] = useState(false);
  const [showConfirmCalquer, setShowConfirmCalquer] = useState(false);
  const [confirmCalquerSlug, setConfirmCalquerSlug] = useState<string | null>(null);
  const [showConfirmViewStrategy, setShowConfirmViewStrategy] = useState(false);
  const [pendingViewStrategy, setPendingViewStrategy] = useState<{ slug: string; brandName: string } | null>(null);

  useEffect(() => {
    if (brand?.templateBrandSlug) setSelectedSlug(brand.templateBrandSlug);
  }, [brand?.templateBrandSlug]);

  useEffect(() => {
    fetch('/api/brands/analyze?list=1')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d?.analyzedBrands && Array.isArray(d.analyzedBrands)) {
          setAnalyzedBrandsFromDb(
            d.analyzedBrands.map((b: { brandName: string; slug: string }) => ({
              brandName: b.brandName,
              slug: b.slug,
            }))
          );
        } else {
          setAnalyzedBrandsFromDb([]);
        }
      })
      .catch(() => setAnalyzedBrandsFromDb([]));
  }, []);

  const brandLogoProposals = brand?.logoVariations && typeof brand.logoVariations === 'object' && Array.isArray((brand.logoVariations as { proposals?: unknown }).proposals)
    ? (brand.logoVariations as { proposals: Array<{ url: string; urlTransparent: string }> }).proposals
    : [];
  const proposalsToShow = logoProposals.length > 0 ? logoProposals : brandLogoProposals;

  const fetchStrategyHistory = useCallback(async () => {
    if (!brandId || demoMode) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/brands/strategy/history?brandId=${encodeURIComponent(brandId)}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.strategies)) {
        setStrategyHistory(data.strategies);
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [brandId, demoMode]);

  useEffect(() => {
    fetchStrategyHistory();
  }, [fetchStrategyHistory]);

  useEffect(() => {
    const p = styleGuideField(sg, 'preferredStyle') || styleGuideField(sg, 'positioning');
    const t = styleGuideField(sg, 'targetAudience');
    if (p) setPositioning(p);
    if (t) setTargetAudience(t);
  }, [brand?.styleGuide]);

  const referenceBrandsList = useMemo(
    () => (positioning ? getReferenceBrandsForPositioning(positioning) : []),
    [positioning]
  );
  const referenceBrands = useMemo(() => {
    const fromRef = referenceBrandsList.map((b) => ({ brandName: b.name, brandKey: b.slug, slug: b.slug }));
    const refSlugs = new Set(fromRef.map((b) => b.slug.toLowerCase()));
    const extra = analyzedBrandsFromDb.filter((b) => !refSlugs.has(b.slug.toLowerCase()));
    return [...fromRef, ...extra];
  }, [referenceBrandsList, analyzedBrandsFromDb]);

  const targetAudienceOptions = useMemo(
    () => (positioning ? getTargetAudienceOptionsForPositioning(positioning) : []),
    [positioning]
  );

  useEffect(() => {
    if (positioning && targetAudience && targetAudienceOptions.length > 0 && !targetAudienceOptions.includes(targetAudience)) {
      setTargetAudience('');
      setSelectedSlug(null);
    }
  }, [positioning, targetAudience, targetAudienceOptions]);

  const inconsistencyMessage =
    positioning && targetAudience
      ? getPositioningAudienceInconsistencyMessage(positioning, targetAudience)
      : null;

  const hasBothChoices = Boolean(positioning && targetAudience);
  const showReferenceBrands = Boolean(positioning?.trim());
  /** Une fois une stratégie calquée ou déjà enregistrée : plus de modification (lecture seule). */
  const strategyLocked = !!(strategyResult || brand?.templateBrandSlug);

  const handleCalquerStrategie = async (overrideSlug?: string) => {
    if (userPlan === 'free') {
      openSurplusModal();
      return;
    }
    const slugToUse = overrideSlug ?? selectedSlug;
    const templateName = referenceBrands.find((b) => b.slug === slugToUse)?.brandName || slugToUse;
    const creatorName = brand?.name?.trim();
    if (!slugToUse || !creatorName) {
      setStrategyError('Choisissez une grande marque.');
      return;
    }
    if (overrideSlug) setSelectedSlug(overrideSlug);
    setStrategyError('');
    setStrategyLoading(true);
    setStrategyResult(null);
    try {
      const analysisRes = await fetch(`/api/brands/analyze?brandName=${encodeURIComponent(templateName ?? '')}`);
      const analysisData = await analysisRes.json();
      const analysisText = analysisRes.ok ? analysisData.analysis : '';

      const creatorBrandContext = buildCreatorBrandContext(brand);
      const creatorStory = brand?.styleGuide && typeof brand.styleGuide === 'object' ? (brand.styleGuide as Record<string, unknown>).story : undefined;
      const strategyRes = await fetch('/api/brands/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateBrandName: templateName,
          creatorBrandName: creatorName,
          analysisText: analysisText || undefined,
          positioning: positioning?.trim() || undefined,
          targetAudience: targetAudience?.trim() || undefined,
          creatorBrandContext: creatorBrandContext || undefined,
          creatorStory: typeof creatorStory === 'string' ? creatorStory.trim() || undefined : undefined,
        }),
      });
      const strategyData = await strategyRes.json();
      if (!strategyRes.ok) throw new Error(strategyData.error || 'Erreur génération');
      const strategyText = strategyData.strategy || '';
      setStrategyResult(strategyText);
      setViewingTemplate(null);
      setStrategyModalOpen(false);
      window.dispatchEvent(new CustomEvent(USAGE_REFRESH_EVENT));
      if (strategyText && brandId && !demoMode) {
        let visualIdentity: { colorPalette?: { primary?: string; secondary?: string; accent?: string }; typography?: { heading?: string; body?: string }; logoRecommendation?: string } | undefined;
        try {
          const templateRes = await fetch(`/api/brands/strategy/template?slug=${encodeURIComponent(slugToUse)}`);
          const templateData = templateRes.ok ? await templateRes.json() : null;
          const templateVisualIdentity = templateData?.visualIdentity;
          const referenceLogoUrl = getBrandLogoUrl(templateName ?? '') ?? undefined;
          const creatorRes = await fetch('/api/brands/strategy/creator-visual-identity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              templateBrandName: templateName,
              templateVisualIdentity: templateVisualIdentity ?? { colorPalette: {}, typography: {} },
              creatorBrandName: creatorName,
              referenceLogoUrl,
              strategyText,
            }),
          });
          if (creatorRes.ok) {
            const creatorData = await creatorRes.json();
            visualIdentity = creatorData.visualIdentity;
            setLastCalquedVisualIdentity(visualIdentity);
          } else if (templateVisualIdentity) {
            visualIdentity = templateVisualIdentity;
            setLastCalquedVisualIdentity(visualIdentity);
          }
        } catch {
          /* ignore */
        }
        fetch('/api/brands/strategy/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandId,
            templateBrandSlug: slugToUse,
            templateBrandName: templateName,
            strategyText,
            positioning: positioning?.trim() || undefined,
            targetAudience: targetAudience?.trim() || undefined,
            visualIdentity: visualIdentity ?? undefined,
          }),
        })
          .then(() => fetchStrategyHistory())
          .catch(() => { });
      }
    } catch (e) {
      setStrategyError(e instanceof Error ? e.message : 'Erreur lors du calquage');
    } finally {
      setStrategyLoading(false);
    }
  };

  const doViewStrategy = useCallback(
    async (slug: string, brandName: string) => {
      setTemplateStrategyError('');
      setTemplateStrategyLoading(true);
      setSavedScrollY(typeof window !== 'undefined' ? window.scrollY : 0);
      try {
        const onboardingParam = demoMode ? '&onboarding=1' : '';
        let res = await fetch(`/api/brands/strategy/template?slug=${encodeURIComponent(slug)}${onboardingParam}`);
        let data: { strategyText?: string; templateBrandName?: string; visualIdentity?: { colorPalette?: { primary?: string; secondary?: string; accent?: string }; typography?: { heading?: string; body?: string }; logoRecommendation?: string }; error?: string } = {};
        if (res.ok) {
          data = await res.json();
        } else if (res.status === 404) {
          res = await fetch('/api/brands/strategy/template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              templateBrandSlug: slug,
              templateBrandName: brandName.trim(),
              onboarding: demoMode,
            }),
          });
          data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || 'Erreur génération stratégie template');
        } else {
          data = await res.json().catch(() => ({}));
          const errMsg = (data as { error?: string; detail?: string }).error || 'Erreur chargement stratégie';
          const detail = (data as { detail?: string }).detail;
          throw new Error(detail ? `${errMsg} (${detail})` : errMsg);
        }
        const strategyText = data.strategyText ?? '';
        const name = (data.templateBrandName ?? brandName).trim();
        if (strategyText) {
          setStrategyResult(strategyText);
          setViewingTemplate({ templateBrandName: name, templateBrandSlug: slug, visualIdentity: data.visualIdentity });
          setViewingFromHistory(null);
          setStrategyModalOpen(true);
          window.dispatchEvent(new CustomEvent(USAGE_REFRESH_EVENT));
        } else {
          throw new Error('Stratégie vide');
        }
      } catch (e) {
        setTemplateStrategyError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        setTemplateStrategyLoading(false);
      }
    },
    [demoMode]
  );

  const handleVoirStrategie = useCallback(
    (slug: string, brandName: string) => {
      if (demoMode) {
        setPendingViewStrategy({ slug, brandName });
        setShowConfirmViewStrategy(true);
        return;
      }
      if (userPlan === 'free') {
        openSurplusModal();
        return;
      }
      if (strategyViewQuota?.isExhausted && !demoMode) {
        setTemplateStrategyError('Quota de consultation épuisé. Prochaine consultation à la date de renouvellement.');
        openSurplusModal();
        return;
      }
      setPendingViewStrategy({ slug, brandName });
      setShowConfirmViewStrategy(true);
    },
    [demoMode, strategyViewQuota?.isExhausted, openSurplusModal]
  );

  const handleConfirmViewStrategy = useCallback(() => {
    if (!pendingViewStrategy) return;
    setShowConfirmViewStrategy(false);
    doViewStrategy(pendingViewStrategy.slug, pendingViewStrategy.brandName);
    setPendingViewStrategy(null);
  }, [pendingViewStrategy, doViewStrategy]);

  const handleClosePresentation = useCallback((wasViewingTemplate?: boolean, wasViewingFromHistory?: boolean) => {
    setStrategyModalOpen(false);
    setViewingFromHistory(null);
    setViewingTemplate(null);
    if (wasViewingTemplate) {
      setStrategyResult(null);
    } else if (wasViewingFromHistory) {
      setStrategyResult(strategyHistory.length > 0 ? strategyHistory[0].strategyText : null);
    }
    if (typeof window !== 'undefined' && savedScrollY !== undefined) {
      window.scrollTo(0, savedScrollY);
    }
  }, [savedScrollY, strategyHistory]);

  /** Régénère la stratégie (même paramètres) pour mettre à jour le contenu après un changement de mise en page. */
  const handleRegenerateStrategy = useCallback(async () => {
    const slug = selectedSlug;
    const templateName = referenceBrands.find((b) => b.slug === slug)?.brandName || slug;
    const creatorName = brand?.name?.trim();
    if (!slug || !creatorName || demoMode) return;
    try {
      const analysisRes = await fetch(`/api/brands/analyze?brandName=${encodeURIComponent(templateName ?? '')}`);
      const analysisData = await analysisRes.json();
      const analysisText = analysisRes.ok ? analysisData.analysis : '';
      const creatorBrandContext = buildCreatorBrandContext(brand);
      const creatorStory = brand?.styleGuide && typeof brand.styleGuide === 'object' ? (brand.styleGuide as Record<string, unknown>).story : undefined;
      const strategyRes = await fetch('/api/brands/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateBrandName: templateName,
          creatorBrandName: creatorName,
          analysisText: analysisText || undefined,
          positioning: positioning?.trim() || undefined,
          targetAudience: targetAudience?.trim() || undefined,
          creatorBrandContext: creatorBrandContext || undefined,
          creatorStory: typeof creatorStory === 'string' ? creatorStory.trim() || undefined : undefined,
        }),
      });
      const strategyData = await strategyRes.json();
      if (!strategyRes.ok) throw new Error(strategyData.error || 'Erreur génération');
      const strategyText = strategyData.strategy || '';
      setStrategyResult(strategyText);
    } catch (e) {
      setStrategyError(e instanceof Error ? e.message : 'Erreur lors de la régénération');
    }
  }, [selectedSlug, referenceBrands, brand, positioning, targetAudience, demoMode]);

  const handleGenerateLogo = async () => {
    setLogoError('');
    setLogoGenerating(true);
    setLogoProposals([]);
    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 500));
        const placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f0f0f0"/><text x="32" y="36" font-size="12" fill="%23999" text-anchor="middle">Logo démo</text></svg>');
        setLogoProposals([
          { url: placeholder, urlTransparent: placeholder },
          { url: placeholder, urlTransparent: placeholder },
          { url: placeholder, urlTransparent: placeholder },
          { url: placeholder, urlTransparent: placeholder },
        ]);
        setLogoGenerating(false);
        return;
      }
      const recommendation = viewingTemplate?.visualIdentity?.logoRecommendation || strategyHistory[0]?.visualIdentity?.logoRecommendation;
      const res = await fetch(`/api/brands/${brandId}/generate-logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recommendation ? { logoRecommendation: recommendation } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur génération logo');
      if (Array.isArray(data.proposals) && data.proposals.length > 0) {
        setLogoProposals(data.proposals);
      }
      router.refresh();
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : 'Erreur lors de la génération');
    } finally {
      setLogoGenerating(false);
    }
  };

  const handleValidate = async (overrideSlug?: string) => {
    const slugToUse = overrideSlug ?? selectedSlug;
    if (!positioning?.trim()) {
      setValidateError('Choisissez un positionnement.');
      return;
    }
    if (!targetAudience?.trim()) {
      setValidateError('Choisissez un public cible.');
      return;
    }
    if (!slugToUse) {
      setValidateError("Choisissez une marque d'inspiration avant de valider.");
      return;
    }
    if (strategyHistory.length === 0 && !strategyResult) {
      setValidateError('Calquez d\'abord la stratégie pour votre marque avant de valider.');
      return;
    }
    if (!window.confirm('Êtes-vous sûr de valider cette stratégie et de passer à l\'étape suivante ?')) {
      return;
    }
    setValidateError('');
    setValidateLoading(true);
    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 300));
        if (sg?.noLogo === true && !brand?.logo) {
          setShowLogoStep(true);
        } else {
          onComplete();
        }
        setValidateLoading(false);
        return;
      }
      const res = await fetch('/api/launch-map/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          templateBrandSlug: slugToUse,
          positioning: positioning.trim(),
          targetAudience: targetAudience.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      router.refresh();
      if (sg?.noLogo === true && !brand?.logo) {
        setShowLogoStep(true);
      } else {
        onComplete();
      }
    } catch (e) {
      setValidateError(e instanceof Error ? e.message : 'Erreur lors de la validation');
    } finally {
      setValidateLoading(false);
    }
  };

  const noLogo = sg?.noLogo === true;
  const recommendation = strategyHistory[0]?.visualIdentity?.logoRecommendation ?? lastCalquedVisualIdentity?.logoRecommendation;

  /* Page « Créez votre logo » : affichée uniquement après validation de la stratégie, chronologiquement à la suite. */
  if (showLogoStep && noLogo) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-primary/30 bg-primary/10">
          <CardContent className="pt-6 pb-6">
            <h3 className="font-semibold text-foreground text-lg mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Créez votre logo
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Vous avez validé votre stratégie. Générez 4 propositions de logo par IA. Chaque logo aura sa version sur fond transparent. En validant, vous conservez les 4.
            </p>
            {recommendation && (
              <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Recommandation logo (issue de votre stratégie calquée)</p>
                <p className="text-sm text-foreground leading-relaxed">{recommendation}</p>
              </div>
            )}

            {proposalsToShow.length > 0 ? (
              <>
                <p className="text-sm font-medium text-foreground mb-3">4 propositions (chacune avec version fond transparent)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {proposalsToShow.map((p, i) => (
                    <div key={i} className="rounded-lg border-2 border-border bg-muted/20 overflow-hidden">
                      <div className="aspect-square bg-background flex items-center justify-center p-2 relative">
                        <PreviewWatermark src={p.url} alt={`Logo proposition ${i + 1}`} className="w-full h-full" />
                      </div>
                      <div className="p-2 flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">Proposition {i + 1}</span>
                        <a
                          href={p.urlTransparent}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={`logo-${i + 1}-transparent.png`}
                          className="text-xs text-primary hover:underline"
                        >
                          Télécharger fond transparent
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" onClick={() => onComplete()} className="gap-2">
                    Valider les 4 logos et continuer vers le calculateur
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : logoQuota?.isExhausted && !demoMode ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={openSurplusModal}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                >
                  <Sparkles className="w-4 h-4" />
                  Recharger ce module
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setShowConfirmLogo(true)}
                    disabled={logoGenerating}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    {logoGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Génération des 4 propositions…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Générer 4 propositions de logo par IA
                        <GenerationCostBadge feature="brand_logo" />
                      </>
                    )}
                  </Button>
                </div>
                {logoGenerating && (
                  <p className="text-sm text-muted-foreground mt-2">Chaque proposition inclut une version sur fond transparent. Cela peut prendre 1 à 2 minutes.</p>
                )}
              </>
            )}
            {logoError && <p className="text-sm text-destructive mt-3" role="alert">{logoError}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isGenerating = strategyLoading || templateStrategyLoading || validateLoading || logoGenerating;

  return (
    <div className="space-y-6">
      <GenerationLoadingPopup
        open={!!isGenerating}
        title={
          logoGenerating
            ? 'Génération des logos…'
            : validateLoading
              ? 'Validation en cours…'
              : templateStrategyLoading
                ? 'Chargement de la stratégie…'
                : 'Génération de la stratégie…'
        }
      />
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg text-foreground mb-2">Stratégie marketing</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Définissez votre stratégie en quelques choix : positionnement, puis public cible, puis marques de référence. Les marques s'affichent en fonction de vos sélections.
          </p>

          {/* 1. Positionnement — toujours modifiable */}
          <div className="space-y-2 mb-6">
            <label className="text-sm font-semibold text-foreground">1. Choisissez votre positionnement</label>
            <p className="text-xs text-muted-foreground mb-2">Style de marque (obligatoire).</p>
            <select
              value={positioning}
              onChange={(e) => {
                setPositioning(e.target.value || '');
                setStrategyResult(null);
                setStrategyError('');
              }}
              className="w-full max-w-md h-11 px-4 py-2.5 text-sm bg-background border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
            >
              <option value="">Sélectionnez un positionnement</option>
              {POSITIONING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* 2. Public cible — toujours modifiable */}
          <div className="space-y-2 mb-6">
            <label className="text-sm font-semibold text-foreground">2. Choisissez votre public cible</label>
            <p className="text-xs text-muted-foreground mb-2">
              {positioning
                ? 'Cibles compatibles avec « ' + positioning + ' » (obligatoire).'
                : 'Choisissez d\'abord un positionnement pour afficher les cibles.'}
            </p>
            <select
              value={targetAudience}
              onChange={(e) => {
                setTargetAudience(e.target.value || '');
                setSelectedSlug(null);
                setStrategyResult(null);
                setStrategyError('');
              }}
              disabled={!positioning || targetAudienceOptions.length === 0}
              className="w-full max-w-md h-11 px-4 py-2.5 text-sm bg-background border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">
                {positioning
                  ? (targetAudienceOptions.length === 0 ? 'Aucune cible pour ce positionnement' : 'Sélectionnez une cible')
                  : 'Choisissez d\'abord un positionnement'}
              </option>
              {targetAudienceOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Alerte incohérence */}
          {hasBothChoices && inconsistencyMessage && (
            <Card className="border-2 border-amber-500/50 bg-amber-500/10 mb-6">
              <CardContent className="pt-4 pb-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Incohérence positionnement / public cible</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{inconsistencyMessage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bandeau "Presque fini" stratégie */}
          {(strategyQuota?.isAlmostFinished || strategyViewQuota?.isAlmostFinished) && !demoMode && (
            <div className="flex items-center justify-between gap-2 rounded-md bg-amber-500/15 px-3 py-2 text-amber-800 dark:text-amber-200 mb-6">
              <span className="text-xs font-medium">Stock épuisé bientôt !</span>
              <button
                type="button"
                onClick={openSurplusModal}
                className="text-xs font-semibold underline hover:no-underline"
              >
                Prendre une recharge
              </button>
            </div>
          )}

          {/* 3. Marques de référence — même logique UX que la présentation stratégie */}
          {showReferenceBrands && (
            <section className="mt-8 pt-6 border-t border-border" aria-labelledby="ref-brands-heading">
              <h2 id="ref-brands-heading" className="text-base font-semibold text-foreground mb-1">
                Marques de référence
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Liées à votre positionnement « {positioning} ». Cliquez sur une marque pour voir sa stratégie, puis calquez-la depuis la présentation si vous souhaitez l’appliquer à votre marque.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {referenceBrands.map((b) => {
                  const isSelected = selectedSlug === b.slug;
                  const brandName = (b.brandName ?? '').trim();
                  const displayName = brandName || b.brandName;
                  const siteUrl = REFERENCE_BRAND_WEBSITES[b.brandName] ?? REFERENCE_BRAND_WEBSITES[brandName] ?? null;
                  const logoUrl = getBrandLogoUrl(brandName) ?? getBrandLogoUrl(b.brandName);
                  const calquedEntry = strategyHistory.find((e) => e.templateBrandSlug === b.slug);
                  const hasCalquedStrategy = !!calquedEntry;
                  return (
                    <article
                      key={b.slug}
                      role="group"
                      aria-label={`Marque ${displayName}${isSelected ? ', calquée pour ma marque' : ''}`}
                      className={cn(
                        'flex flex-col rounded-lg border-2 overflow-hidden transition-all',
                        isSelected
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 shadow-sm'
                          : 'border-border hover:border-[#8B5CF6]/40 hover:bg-muted/20'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleVoirStrategie(b.slug, brandName || b.brandName)}
                        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:ring-inset"
                        aria-label={`Voir la stratégie de ${displayName}`}
                      >
                        {/* Logo à taille normale, centré dans le cadre */}
                        <div className="aspect-square w-full overflow-hidden bg-muted flex items-center justify-center">
                          {logoUrl ? (
                            <BrandLogo logoUrl={logoUrl} brandName={displayName} className="w-20 h-20" />
                          ) : (
                            <span className="text-2xl font-bold text-muted-foreground">
                              {b.brandName.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="p-3 flex flex-col gap-2">
                          <p className="font-semibold text-foreground text-sm truncate">{displayName}</p>
                          {isSelected && (
                            <span className="text-[10px] font-medium text-[#8B5CF6] uppercase tracking-wider">
                              Calquée
                            </span>
                          )}
                        </div>
                      </button>
                      <div className="px-3 pb-3 flex flex-wrap items-center gap-2">
                        <Button
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            'h-8 text-xs gap-1.5 shrink-0',
                            !isSelected && 'border-[#8B5CF6]/50 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 hover:border-[#8B5CF6]'
                          )}
                          disabled={templateStrategyLoading || userPlan === 'free' || (strategyViewQuota?.isExhausted && !demoMode) || (demoMode && (strategyViewQuota?.remaining ?? 10) <= 10 - STRATEGY_VIEW_ONBOARDING_LIMIT)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoirStrategie(b.slug, brandName || b.brandName);
                          }}
                          aria-label={`Voir la stratégie de ${displayName}`}
                        >
                          {templateStrategyLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                          ) : (
                            <FileText className="w-3.5 h-3.5" aria-hidden />
                          )}
                          Voir la stratégie
                        </Button>
                        {hasCalquedStrategy && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5 shrink-0 border-green-600/50 text-green-700 dark:text-green-400 hover:bg-green-600/10 hover:border-green-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!calquedEntry) return;
                              setStrategyResult(calquedEntry.strategyText);
                              setSelectedSlug(b.slug);
                              setViewingFromHistory(null);
                              setViewingTemplate(null);
                            }}
                            aria-label={`Sélectionner la stratégie déjà calquée pour ${displayName}`}
                          >
                            Sélectionner cette stratégie
                          </Button>
                        )}
                        {siteUrl && (
                          <a
                            href={siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Site officiel de ${displayName}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                            Site
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
              {(strategyError || templateStrategyError) && (
                <p className="text-sm text-destructive font-medium mt-4" role="alert">
                  {templateStrategyError || strategyError}
                </p>
              )}
              {(strategyResult || strategyHistory.length > 0) && !viewingTemplate && (
                <div className="mt-6 p-4 rounded-[4px] border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    Stratégie enregistrée pour votre marque. Consultez la dernière générée par calque puis validez pour continuer.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewingTemplate(null);
                      setViewingFromHistory(null);
                      if (strategyHistory.length > 0) {
                        const latest = strategyHistory[0];
                        setStrategyResult(latest.strategyText);
                        setSelectedSlug(latest.templateBrandSlug);
                      }
                      setStrategyModalOpen(true);
                    }}
                    className="w-fit gap-2 rounded-[4px] border-[#8B5CF6]/50 text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                  >
                    <FileText className="w-4 h-4" aria-hidden />
                    Voir la présentation
                  </Button>
                </div>
              )}
              {strategyHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#8B5CF6]" aria-hidden />
                    Historique des stratégies ({strategyHistory.length})
                  </h3>
                  {historyLoading ? (
                    <p className="text-sm text-muted-foreground">Chargement…</p>
                  ) : (
                    <ul className="space-y-2 max-h-44 overflow-y-auto" role="list">
                      {strategyHistory.map((entry) => (
                        <li key={entry.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setStrategyResult(entry.strategyText);
                              setViewingFromHistory({
                                templateBrandSlug: entry.templateBrandSlug,
                                templateBrandName: entry.templateBrandName,
                                positioning: entry.positioning,
                                targetAudience: entry.targetAudience,
                                visualIdentity: entry.visualIdentity ?? undefined,
                              });
                              setStrategyModalOpen(true);
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-[4px] border border-border hover:bg-[#8B5CF6]/5 hover:border-[#8B5CF6]/40 text-sm transition-colors flex items-center justify-between gap-2"
                            aria-label={`Voir la stratégie ${brand?.name ?? 'Ma marque'} inspirée de ${entry.templateBrandName}`}
                          >
                            <span className="font-medium text-foreground truncate">
                              {brand?.name?.trim() || 'Ma marque'} · {entry.templateBrandName}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {new Date(entry.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>
          )}
        </CardContent>
      </Card>

      {validateError && <p className="text-sm text-destructive font-medium">{validateError}</p>}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => handleValidate()}
          disabled={
            validateLoading ||
            !positioning?.trim() ||
            !targetAudience?.trim() ||
            !selectedSlug ||
            (strategyHistory.length === 0 && !strategyResult)
          }
        >
          {validateLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Validation…
            </>
          ) : noLogo ? (
            <>
              Valider la stratégie
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Valider et continuer
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Page présentation stratégie (style analyse : schéma, graphique, onglets) */}
      {strategyModalOpen && strategyResult && (
        <StrategyPresentationView
          strategyText={strategyResult}
          brandName={
            viewingTemplate
              ? viewingTemplate.templateBrandName
              : (brand?.name?.trim() ?? '')
          }
          positioning={
            viewingTemplate
              ? ''
              : (viewingFromHistory?.positioning ?? positioning)?.trim() ?? ''
          }
          targetAudience={
            viewingTemplate
              ? ''
              : (viewingFromHistory?.targetAudience ?? targetAudience)?.trim() ?? ''
          }
          templateBrandName={
            viewingTemplate
              ? viewingTemplate.templateBrandName
              : viewingFromHistory?.templateBrandName ??
              referenceBrands.find((b) => b.slug === selectedSlug)?.brandName ??
              ''
          }
          isTemplateView={!!viewingTemplate}
          visualIdentity={viewingTemplate?.visualIdentity ?? viewingFromHistory?.visualIdentity ?? lastCalquedVisualIdentity ?? undefined}
          visualIdentityLocked={strategyLocked}
          onClose={() => handleClosePresentation(!!viewingTemplate, !!viewingFromHistory)}
          optionalPrimaryAction={
            viewingTemplate && !strategyHistory.some((e) => e.templateBrandSlug === viewingTemplate.templateBrandSlug)
              ? strategyQuota?.isExhausted && !demoMode
                ? { label: 'Recharger ce module', onClick: openSurplusModal, disabled: false }
                : {
                  label: strategyLoading ? 'Calquage en cours…' : 'Calquer la stratégie',
                  onClick: () => { setConfirmCalquerSlug(viewingTemplate.templateBrandSlug); setShowConfirmCalquer(true); },
                  disabled: strategyLoading || !brand?.name?.trim(),
                }
              : undefined
          }
          optionalValidateAction={
            !viewingTemplate && strategyResult
              ? (() => {
                const slugForValidate = viewingFromHistory?.templateBrandSlug ?? selectedSlug;
                return {
                  label: 'Valider et continuer',
                  disabled: !positioning?.trim() || !targetAudience?.trim() || !slugForValidate,
                  onClick: () => {
                    if (!window.confirm('Êtes-vous sûr de valider cette stratégie et de passer à l\'étape suivante ?')) return;
                    handleClosePresentation(false);
                    handleValidate(slugForValidate ?? undefined);
                  },
                };
              })()
              : undefined
          }
          onRegenerate={
            !viewingTemplate && !viewingFromHistory && selectedSlug ? handleRegenerateStrategy : undefined
          }
        />
      )}

      <ConfirmGenerateModal
        open={showConfirmLogo}
        onClose={() => setShowConfirmLogo(false)}
        onConfirm={() => { setShowConfirmLogo(false); handleGenerateLogo(); }}
        actionLabel="Générer 4 propositions de logo"
        remaining={logoQuota?.remaining ?? 0}
        limit={logoQuota?.limit ?? 10}
        loading={logoGenerating}
      />
      <ConfirmGenerateModal
        open={showConfirmCalquer}
        onClose={() => { setShowConfirmCalquer(false); setConfirmCalquerSlug(null); }}
        onConfirm={() => {
          const slug = confirmCalquerSlug;
          setShowConfirmCalquer(false);
          setConfirmCalquerSlug(null);
          if (slug) handleCalquerStrategie(slug);
        }}
        actionLabel="Calquer la stratégie"
        remaining={strategyQuota?.remaining ?? 0}
        limit={strategyQuota?.limit ?? 10}
        loading={strategyLoading}
      />
      <ConfirmGenerateModal
        open={showConfirmViewStrategy}
        onClose={() => { setShowConfirmViewStrategy(false); setPendingViewStrategy(null); }}
        onConfirm={handleConfirmViewStrategy}
        actionLabel={pendingViewStrategy ? `Voir la stratégie de ${pendingViewStrategy.brandName}` : 'Voir la stratégie'}
        remaining={demoMode ? Math.max(0, (strategyViewQuota?.remaining ?? 3) - (10 - STRATEGY_VIEW_ONBOARDING_LIMIT)) : (strategyViewQuota?.remaining ?? 0)}
        limit={demoMode ? STRATEGY_VIEW_ONBOARDING_LIMIT : (strategyViewQuota?.limit ?? 10)}
        loading={templateStrategyLoading}
        extraMessage="Cela se déduit de vos quotas. La stratégie restera consultable pendant 1 mois."
        confirmLabel="Voir"
      />
    </div>
  );
}
