'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  getSeasonalRecommendation,
  getProductTypeLabel,
  getWeightOptions,
  PRODUCT_TYPE_IDS,
  type ProductTypeId,
} from '@/lib/seasonal-recommendation';
import { Phase0Identity } from '@/components/launch-map/Phase0Identity';
import type { BrandIdentity } from '@/components/launch-map/LaunchMapStepper';
import { WelcomeValidationAnimation } from '@/components/launch-map/WelcomeValidationAnimation';

type Step = 0 | 1 | 2;

const DEMO_BRAND_ID = 'demo-onboarding';

interface OnboardingFlowExistingBrandProps {
  onBack: () => void;
  /** Mode test : aucune donnée n'est enregistrée (parcours uniquement). */
  demoMode?: boolean;
  /** Données préremplies depuis une marque existante (après upgrade payant) */
  prefilledData?: {
    name?: string;
    logoUrl?: string;
    domain?: string;
    socialHandles?: { instagram?: string; twitter?: string };
  };
}

export function OnboardingFlowExistingBrand({ onBack, demoMode = false, prefilledData }: OnboardingFlowExistingBrandProps) {
  const [step, setStep] = useState<Step>(0);

  // Questionnaire (étape 0) - prérempli si données existantes
  const [name, setName] = useState(prefilledData?.name || '');
  const [logoUrl, setLogoUrl] = useState(prefilledData?.logoUrl || '');
  const [domain, setDomain] = useState(prefilledData?.domain || '');
  const [instagram, setInstagram] = useState(prefilledData?.socialHandles?.instagram || '');
  const [twitter, setTwitter] = useState(prefilledData?.socialHandles?.twitter || '');
  const [tagline, setTagline] = useState('');
  const recommendation = useMemo(() => getSeasonalRecommendation(), []);
  const [productType, setProductType] = useState<ProductTypeId>(recommendation.productType);
  const [productWeight, setProductWeight] = useState(recommendation.weight);

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const [brandId, setBrandId] = useState<string | null>(null);
  const [brand, setBrand] = useState<BrandIdentity | null>(null);

  const weightOptions = useMemo(() => getWeightOptions(productType), [productType]);

  const handleCreateBrand = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setCreateError('Le nom de la marque est requis (2 caractères minimum).');
      return;
    }
    setCreateError('');
    setCreateLoading(true);
    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 400));
        const fakeBrand: BrandIdentity = {
          id: DEMO_BRAND_ID,
          name: trimmedName,
          logo: logoUrl.trim() || null,
          domain: domain.trim() || null,
          socialHandles: instagram.trim() || twitter.trim() ? { instagram: instagram.trim() || undefined, twitter: twitter.trim() || undefined } : null,
          styleGuide: {
            mainProduct: getProductTypeLabel(productType),
            productType,
            productWeight,
            noLogo: !logoUrl.trim(),
            tagline: tagline.trim() || undefined,
          },
        };
        setBrandId(DEMO_BRAND_ID);
        setBrand(fakeBrand);
        setStep(1);
        setCreateLoading(false);
        return;
      }
      const socialHandles: Record<string, string> = {};
      if (instagram.trim()) socialHandles.instagram = instagram.trim();
      if (twitter.trim()) socialHandles.twitter = twitter.trim();

      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          logo: logoUrl.trim() || null,
          domain: domain.trim() || null,
          socialHandles: Object.keys(socialHandles).length ? socialHandles : null,
          styleGuide: {
            mainProduct: getProductTypeLabel(productType),
            productType,
            productWeight,
            noLogo: !logoUrl.trim(),
            tagline: tagline.trim() || undefined,
          },
          creationMode: 'onboarding',
          status: 'in_progress',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur création marque');
      const created = data.brand as { id: string; name: string; logo?: string | null; styleGuide?: unknown; domain?: string | null; socialHandles?: unknown };
      setBrandId(created.id);
      setBrand(created as unknown as BrandIdentity);
      setStep(1);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setCreateLoading(false);
    }
  };

  const stepLabels = [
    'Identité — Nom, logo, site, réseaux',
    'Compléter et valider',
    'Validation',
  ] as const;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Retour" disabled={step > 0}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">J&apos;ai déjà ma marque</h1>
          <p className="text-sm text-muted-foreground">
            Étape {step + 1} sur 3 — {stepLabels[step]}
          </p>
        </div>
      </div>

      {/* Étape 0 : Identité — infos de la marque */}
      {step === 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Identité — Nom, logo, site, réseaux</CardTitle>
            <CardDescription>
              Renseignez les infos de votre marque. Elles seront réutilisées dans le Guide de lancement (stratégie, design, sourcing, UGC). Même structure que pour les marques créées avec nous.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Nom de la marque *</label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setCreateError(''); }}
                placeholder="Ex. Ma Marque"
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Logo (URL)</label>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://... (optionnel)"
                className="border-2 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Site web</label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="ex. votremarque.com"
                className="border-2"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Instagram</label>
                <Input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@mamarque"
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Twitter / X</label>
                <Input
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@mamarque"
                  className="border-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Slogan / baseline</label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Ex. La marque qui vous ressemble"
                className="border-2"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Type de produit principal</label>
                <select
                  value={productType}
                  onChange={(e) => {
                    const v = e.target.value as ProductTypeId;
                    setProductType(v);
                    const opts = getWeightOptions(v);
                    setProductWeight(opts[0]?.value ?? '180 g/m²');
                  }}
                  className="w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm"
                >
                  {PRODUCT_TYPE_IDS.map((id) => (
                    <option key={id} value={id}>{getProductTypeLabel(id)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Grammage</label>
                <select
                  value={productWeight}
                  onChange={(e) => setProductWeight(e.target.value)}
                  className="w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm"
                >
                  {weightOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {createError && <p className="text-sm text-destructive font-medium">{createError}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack} disabled={createLoading}>
                Retour
              </Button>
              <Button
                onClick={handleCreateBrand}
                disabled={createLoading || name.trim().length < 2}
              >
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Enregistrement…
                  </>
                ) : (
                  "Enregistrer et continuer"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 1 : Phase 0 Identité (compléter / modifier) */}
      {step === 1 && brandId && brand && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Compléter et valider</CardTitle>
            <CardDescription>
              Modifiez ou complétez les infos (description, produit principal, etc.) puis valider. Votre marque sera disponible dans le tableau de bord et le Guide de lancement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Phase0Identity
              brandId={brandId}
              brand={brand}
              onComplete={() => setStep(2)}
              hideNameField
              demoMode={demoMode}
            />
          </CardContent>
        </Card>
      )}

      {/* Étape 2 : Animation puis dashboard */}
      {step === 2 && (
        <Card className="border-2">
          <CardContent className="p-0">
            <WelcomeValidationAnimation />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
