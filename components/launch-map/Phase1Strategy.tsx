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
import { getTechnicalStyleKeywords } from '@/lib/brand-style-keywords';
import { PreviewWatermark } from '@/components/ui/preview-watermark';
import { StrategyPresentationView } from './StrategyPresentationView';
import type { BrandIdentity } from './LaunchMapStepper';
import { cn } from '@/lib/utils';
import { GenerationLoadingPopup } from '@/components/ui/generation-loading-popup';
import { useToast } from '@/components/ui/toast';
import { GenerationCostBadge } from '@/components/ui/generation-cost-badge';
import { ConfirmGenerateModal } from '@/components/ui/confirm-generate-modal';
import { USAGE_REFRESH_EVENT } from '@/lib/hooks/useAIUsage';
import { useQuota } from '@/lib/hooks/useQuota';
import { useSurplusModal } from '@/components/usage/SurplusModalContext';
import { STRATEGY_VIEW_ONBOARDING_LIMIT } from '@/lib/quota-config';
import { FeatureUsageBadge } from '@/components/usage/FeatureUsageBadge';

interface Phase1StrategyProps {
  brandId: string;
  brand?: BrandIdentity | null;
  brandName?: string;
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

export function Phase1Strategy({ brandId, brand, brandName, onComplete, demoMode = false, userPlan = 'free' }: Phase1StrategyProps) {
  const router = useRouter();
  const { toast } = useToast();
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
      toast({
        title: 'Stratégie calquée !',
        message: `La stratégie de ${templateName} a été adaptée à votre marque.`,
        type: 'success',
      });
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
      // Free users allowed to view (blurred)
      if (strategyViewQuota?.isExhausted && !demoMode && userPlan !== 'free') {
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
        toast({
          title: 'Logos générés !',
          message: 'Découvrez vos 4 propositions de logo.',
          type: 'success',
        });
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
    if (strategyHistory.length === 0 && !strategyResult && userPlan !== 'free') {
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
        if (!brand?.logo) {
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
      toast({
        title: 'Stratégie validée !',
        message: 'Passons à l\'étape suivante.',
        type: 'success',
      });
      router.refresh();
      if (!brand?.logo) {
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

  const needsLogo = !brand?.logo || sg?.noLogo === true;
  const inspirationName = referenceBrands.find(b => b.slug === selectedSlug || b.slug === brand?.templateBrandSlug)?.brandName || brand?.templateBrandSlug || undefined;
  const technicalStyle = getTechnicalStyleKeywords(inspirationName);
  const recommendation = strategyHistory[0]?.visualIdentity?.logoRecommendation ?? lastCalquedVisualIdentity?.logoRecommendation;

  /* Page « Créez votre logo » : affichée après validation de la stratégie ou manuellement pour régénérer. */
  if (showLogoStep) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-primary/30 bg-primary/10">
          <CardContent className="pt-6 pb-6">
            <h3 className="font-semibold text-foreground text-lg mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Studio Logo IA (Ideogram)
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Votre stratégie est validée. Créons maintenant votre identité visuelle en s'inspirant de l'esthétique de <strong className="text-foreground">{inspirationName || 'votre marque de référence'}</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-background border border-border">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Style technique détecté</p>
                <p className="text-sm font-semibold text-primary">{technicalStyle}</p>
              </div>

              {recommendation && (
                <div className="p-3 rounded-lg bg-background border border-border">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Concept créatif</p>
                  <p className="text-xs text-foreground leading-relaxed line-clamp-2">{recommendation}</p>
                </div>
              )}
            </div>

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
                        Ciselage de vos emblèmes...
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
            <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
              <Button variant="ghost" size="sm" onClick={() => setShowLogoStep(false)} className="text-muted-foreground">
                Retour à la stratégie
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onComplete()} className="text-muted-foreground hover:text-foreground">
                Passer cette étape
              </Button>
            </div>
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
        messages={
          logoGenerating ? [
            "Ciselage de vos emblèmes...",
            "Calcul des variantes chromatiques...",
            "Optimisation du rendu vectoriel...",
            "Génération des détourages...",
          ] : validateLoading ? [
            "Sécurisation de vos choix...",
            "Mise à jour de votre Launch Map...",
            "Préparation du studio créatif...",
            "Finalisation de l'étape 1...",
          ] : [
            "Extraction de l'ADN de la marque...",
            "Fusion avec votre identité créative...",
            "Rédaction du plan d'attaque complet...",
            "Calcul de viabilité stratégique...",
          ]
        }
      />
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8 bg-background/50 p-2 rounded-xl border border-primary/10">
            {[
              { id: 1, label: 'Positionnement', active: !!positioning },
              { id: 2, label: 'Public cible', active: !!targetAudience },
              { id: 3, label: 'Inspiration', active: !!selectedSlug }
            ].map((s, i) => (
              <div key={s.id} className="flex-1 flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                  s.active ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {s.id}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider hidden sm:inline",
                  s.active ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
                {i < 2 && <div className="flex-1 h-px bg-muted mx-2" />}
              </div>
            ))}
          </div>

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

          {/* Quotas */}
          {!demoMode && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <FeatureUsageBadge featureKey="brand_strategy" isFree={userPlan === 'free'} />
              <FeatureUsageBadge featureKey="strategy_view" isFree={userPlan === 'free'} />
            </div>
          )}

          {/* 3. Marques de référence — même logique UX que la présentation stratégie */}
          {showReferenceBrands && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border pb-2">
                <div>
                  <label className="text-base font-semibold text-foreground flex items-center gap-2">
                    3. Inspirez-vous des meilleurs
                    <Sparkles className="w-4 h-4 text-primary" />
                  </label>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xl text-balance">
                    {userPlan === 'free'
                      ? 'Analysez en détail les stratégies des marques leaders. Passez au plan Pro pour que l’IA adapte ces stratégies à votre marque.'
                      : 'Explorez et analysez les marques. Une fois votre inspiration trouvée, l’IA "clonera" son génie marketing pour l’adapter à votre projet.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {referenceBrands.map((brand) => {
                  const isSelected = selectedSlug === brand.slug;
                  const isCalqued = strategyHistory.some(h => h.templateBrandSlug === brand.slug);

                  return (
                    <Card
                      key={brand.slug}
                      className={cn(
                        "cursor-pointer transition-all duration-300 relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                      onClick={() => handleVoirStrategie(brand.slug, brand.brandName)}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-bl-xl shadow-sm z-10 transition-transform duration-300">
                          {isCalqued ? <History className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                        </div>
                      )}
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 relative bg-white rounded-full border flex items-center justify-center overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-110",
                          isSelected ? "border-primary/30" : "border-gray-100 shadow-sm"
                        )}>
                          <BrandLogo brandName={brand.brandName} logoUrl={getBrandLogoUrl(brand.brandName)} className="w-8 h-8 object-contain" />
                        </div>
                        <div className="overflow-hidden flex-1 space-y-0.5">
                          <p className={cn("font-medium text-sm truncate transition-colors", isSelected ? "text-primary" : "text-foreground group-hover:text-primary/80")}>
                            {brand.brandName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Voir l'analyse
                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary ml-auto" />
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Indicateur de stratégie calquée (Plan Payant) */}
          {strategyHistory.length > 0 && userPlan !== 'free' && !demoMode && (
            <div className="mt-8 p-4 rounded-xl border border-green-500/20 bg-green-500/5 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-full shrink-0 text-green-600 dark:text-green-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">Stratégie prête & adaptée</p>
                <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed max-w-2xl">
                  L'IA a fusionné le génie de <strong>{strategyHistory[0].templateBrandName}</strong> avec votre identité.
                  <br className="hidden sm:block" />
                  Vous pouvez maintenant valider pour passer à l'identité visuelle.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none border-green-200 text-green-700 hover:text-green-800 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/50"
                  onClick={() => {
                    setStrategyResult(strategyHistory[0].strategyText);
                    setViewingFromHistory(strategyHistory[0]);
                    setStrategyModalOpen(true);
                  }}
                >
                  <FileText className="w-3.5 h-3.5 mr-2" />
                  Relire
                </Button>
              </div>
            </div>
          )}

          {/* Validation */}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={() => handleValidate()}
              disabled={validateLoading || !selectedSlug}
              className={cn(
                "gap-2 px-6 h-12 text-base rounded-xl transition-all duration-300",
                (strategyHistory.length > 0 || userPlan === 'free')
                  ? "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                  : "opacity-80"
              )}
              size="lg"
            >
              {validateLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Validation en cours...
                </>
              ) : (
                <>
                  {userPlan === 'free' ? 'Valider mes choix manuels' : 'Valider la stratégie et continuer'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de présentation stratégie wrapper */}
      {strategyModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 fade-in animate-in duration-200"
          onClick={() => handleClosePresentation(!!viewingTemplate, !!viewingFromHistory)}
        >
          <div
            className="w-full h-full max-w-7xl bg-background rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-border zoom-in-95 animate-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              <StrategyPresentationView
                isOpen={true}
                onClose={() => handleClosePresentation(!!viewingTemplate, !!viewingFromHistory)}
                strategyText={strategyResult ?? ''}
                brandName={viewingTemplate?.templateBrandName || viewingFromHistory?.templateBrandName || ''}
                isTemplateView={!!viewingTemplate}
                optionalPrimaryAction={!!viewingTemplate ? {
                  label: strategyLoading ? 'Adaptation en cours...' : 'Calquer cette stratégie',
                  onClick: () => handleCalquerStrategie(viewingTemplate?.templateBrandSlug),
                  disabled: strategyLoading
                } : undefined}
                isFree={userPlan === 'free' && !demoMode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
