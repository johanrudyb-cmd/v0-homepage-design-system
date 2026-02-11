'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import {
  getSeasonalRecommendation,
  getProductTypeLabel,
  type ProductTypeId,
} from '@/lib/seasonal-recommendation';
import { Phase1Strategy } from '@/components/launch-map/Phase1Strategy';
import { Phase0Identity } from '@/components/launch-map/Phase0Identity';
import type { BrandIdentity } from '@/components/launch-map/LaunchMapStepper';
import { WelcomeValidationAnimation } from '@/components/launch-map/WelcomeValidationAnimation';

type Step = 0 | 1 | 2 | 3;

const DEMO_BRAND_ID = 'demo-onboarding';

interface OnboardingFlowCreateBrandProps {
  onBack: () => void;
  /** Mode test : aucune donnée n'est enregistrée (parcours uniquement). */
  demoMode?: boolean;
  userPlan?: string;
}

export function OnboardingFlowCreateBrand({ onBack, demoMode = false, userPlan = 'free' }: OnboardingFlowCreateBrandProps) {
  const [step, setStep] = useState<Step>(0);

  const [brandId, setBrandId] = useState<string | null>(null);
  const [brand, setBrand] = useState<BrandIdentity | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const [strategyContext, setStrategyContext] = useState<{ concept: string; style: string; target: string } | null>(null);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [nameSuggestionsLoading, setNameSuggestionsLoading] = useState(false);
  const [selectedName, setSelectedName] = useState('');

  const recommendation = useMemo(() => getSeasonalRecommendation(), []);

  const handleCreateBrand = async () => {
    setCreateError('');
    setCreateLoading(true);
    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 400));
        const fakeBrand: BrandIdentity = {
          id: DEMO_BRAND_ID,
          name: 'Nouvelle marque',
          styleGuide: {
            mainProduct: getProductTypeLabel(recommendation.productType as ProductTypeId),
            productType: recommendation.productType,
            productWeight: recommendation.weight,
            noLogo: true,
          },
        };
        setBrandId(DEMO_BRAND_ID);
        setBrand(fakeBrand);
        setStep(1);
        setCreateLoading(false);
        return;
      }
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nouvelle marque',
          logo: null,
          styleGuide: {
            mainProduct: getProductTypeLabel(recommendation.productType as ProductTypeId),
            productType: recommendation.productType,
            productWeight: recommendation.weight,
            noLogo: true,
          },
          creationMode: 'quick',
          status: 'in_progress',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur création marque');
      const created = data.brand as { id: string; name: string; logo?: string | null; styleGuide?: unknown; domain?: string | null; socialHandles?: unknown; templateBrandSlug?: string | null };
      setBrandId(created.id);
      setBrand(created as unknown as BrandIdentity);
      setStep(1);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStrategyComplete = useCallback(async () => {
    if (!brandId) return;
    if (demoMode) {
      setStep(2);
      return;
    }
    try {
      const res = await fetch(`/api/brands/${brandId}`);
      const data = await res.json();
      if (res.ok) setBrand(data as unknown as BrandIdentity);
    } catch {
      /* ignore */
    }
    setStep(2);
  }, [brandId, demoMode]);

  // Récupérer la stratégie pour le contexte IA (nom) — quand on arrive sur Phase 0 (step 2)
  useEffect(() => {
    if (step !== 2 || !brandId) return;
    if (demoMode || brandId === DEMO_BRAND_ID) {
      setStrategyContext({ concept: 'Marque de mode (démo)', style: '', target: '' });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/brands/strategy/history?brandId=${encodeURIComponent(brandId)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStrategyContext({ concept: 'Marque de mode', style: '', target: '' });
          return;
        }
        const strategies = data.strategies as Array<{ strategyText?: string; positioning?: string | null; targetAudience?: string | null; templateBrandName?: string }> | undefined;
        const last = strategies?.[0];
        if (last) {
          const concept = (last.strategyText || '').slice(0, 500) || `Marque mode inspirée de ${last.templateBrandName || 'référence'}`;
          const style = (last.positioning || '').trim() || '';
          const target = (last.targetAudience || '').trim() || '';
          if (!cancelled) setStrategyContext({ concept, style, target });
        } else {
          if (!cancelled) setStrategyContext({ concept: 'Marque de mode', style: '', target: '' });
        }
      } catch {
        if (!cancelled) setStrategyContext({ concept: 'Marque de mode', style: '', target: '' });
      }
    })();
    return () => { cancelled = true; };
  }, [step, brandId, demoMode]);

  // Générer les noms par IA à partir de la stratégie
  const fetchNameSuggestions = useCallback(async () => {
    if (!strategyContext?.concept || userPlan === 'free') return;
    setNameSuggestionsLoading(true);
    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 300));
        const fakeNames = ['Marque Démo', 'Test Mode', 'Essai Fashion', 'Parcours Test', 'Preview'];
        setNameSuggestions(fakeNames);
        if (!selectedName) setSelectedName(fakeNames[0]);
        setNameSuggestionsLoading(false);
        return;
      }
      const res = await fetch('/api/brands/generate-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: strategyContext.concept,
          style: strategyContext.style || undefined,
          target: strategyContext.target || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.names) && data.names.length > 0) {
        setNameSuggestions(data.names.slice(0, 5));
        if (!selectedName && data.names[0]) setSelectedName(data.names[0]);
      }
    } catch {
      setNameSuggestions([]);
    } finally {
      setNameSuggestionsLoading(false);
    }
  }, [strategyContext, selectedName, demoMode]);

  useEffect(() => {
    if (step === 2 && strategyContext && nameSuggestions.length === 0 && !nameSuggestionsLoading) {
      fetchNameSuggestions();
    }
  }, [step, strategyContext, nameSuggestions.length, nameSuggestionsLoading, fetchNameSuggestions]);

  const brandForIdentity = brand && selectedName.trim()
    ? { ...brand, name: selectedName.trim() }
    : brand
      ? { ...brand, name: selectedName || brand.name || 'Nouvelle marque' }
      : null;

  const stepLabels = [
    'Commencer',
    'Stratégie marketing — Marque d’inspiration',
    'Identité — Nom par IA, logo, produit',
    'Validation',
  ] as const;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Retour" disabled={step > 0}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Je crée ma marque de zéro</h1>
          <p className="text-sm text-muted-foreground">
            Étape {step + 1} sur 4 — {stepLabels[step]}
          </p>
        </div>
      </div>

      {/* Étape 0 : Commencer — création de l'espace marque */}
      {step === 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Commencer</CardTitle>
            <CardDescription>
              {userPlan === 'free'
                ? "Définissez votre positionnement et votre public cible manuellement. Nous vous accompagnerons ensuite pour créer votre logo et votre fiche produit."
                : "Vous n'avez pas encore de nom de marque. Dans ce parcours, vous choisissez d'abord une marque d'inspiration et sa stratégie marketing, puis l'IA vous propose un nom et votre identité (logo, produit principal). Ensuite, accès au tableau de bord et au Guide de lancement."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {createError && <p className="text-sm text-destructive font-medium">{createError}</p>}
            <div className="flex gap-2">
              <Button onClick={handleCreateBrand} disabled={createLoading}>
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Création de votre espace…
                  </>
                ) : (
                  'Commencer — Stratégie marketing'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 1 : Stratégie marketing — Marque d'inspiration */}
      {step === 1 && brandId && brand && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Stratégie marketing — Marque d&apos;inspiration</CardTitle>
            <CardDescription>
              Choisissez un positionnement, un public cible et une marque tendance d&apos;inspiration. Calquez sa stratégie, puis créez un logo par IA si besoin. Comme dans le Guide de lancement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Phase1Strategy
              brandId={brandId}
              brand={brand}
              onComplete={handleStrategyComplete}
              userPlan={userPlan}
            />
          </CardContent>
        </Card>
      )}

      {/* Étape 2 : Identité — nom par IA + formulaire */}
      {step === 2 && brandId && brandForIdentity && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Identité — Nom, logo, produit</CardTitle>
            <CardDescription>
              L&apos;IA propose plusieurs noms à partir de la stratégie. Choisissez-en un (ou saisissez le vôtre), puis complétez logo et produit principal. Ensuite, vous pourrez créer vos mockups, tech packs et contenu UGC dans le Guide de lancement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nom par IA sur base de la stratégie */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  {userPlan === 'free' ? null : <Sparkles className="w-4 h-4 text-primary" />}
                  Nom de la marque {userPlan === 'free' ? '' : '(générés par IA à partir de votre stratégie)'}
                </h4>
                {nameSuggestionsLoading ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Génération des noms…
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {nameSuggestions.map((n) => (
                        <Button
                          key={n}
                          type="button"
                          variant={selectedName === n ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedName(n)}
                        >
                          {n}
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Ou saisir un nom personnalisé</label>
                      <Input
                        value={selectedName}
                        onChange={(e) => setSelectedName(e.target.value)}
                        placeholder="Nom de la marque"
                        className="border-2 max-w-md"
                      />
                    </div>
                    {nameSuggestions.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-muted-foreground"
                        onClick={fetchNameSuggestions}
                        disabled={nameSuggestionsLoading}
                      >
                        Régénérer d&apos;autres noms
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Phase0Identity
              brandId={brandId}
              brand={brandForIdentity}
              onComplete={() => setStep(3)}
              hideNameField
              demoMode={demoMode}
            />
          </CardContent>
        </Card>
      )}

      {/* Étape 3 : Animation puis dashboard */}
      {step === 3 && (
        <Card className="border-2">
          <CardContent className="p-0">
            <WelcomeValidationAnimation />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
