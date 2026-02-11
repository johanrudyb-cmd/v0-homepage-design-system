'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight, CheckCircle2, Sun, ImageOff, Upload } from 'lucide-react';
import { BrandLogo } from '@/components/brands/BrandLogo';
import { cn } from '@/lib/utils';
import {
  getSeasonalRecommendation,
  getWeightOptions,
  getProductTypeLabel,
  PRODUCT_TYPE_IDS,
  type ProductTypeId,
} from '@/lib/seasonal-recommendation';
import type { BrandIdentity } from './LaunchMapStepper';

interface Phase0IdentityProps {
  brandId: string;
  brand?: BrandIdentity | null;
  onComplete: () => void;
  /** En onboarding : masque le champ nom (affiché par le parent comme « Sélecteur de nom de marque ») */
  hideNameField?: boolean;
  /** Mode test (onboarding) : aucun enregistrement, simulation uniquement */
  demoMode?: boolean;
  userPlan?: string;
}

function styleGuideField(sg: Record<string, unknown> | null | undefined, key: string): string {
  if (!sg || typeof sg !== 'object') return '';
  const v = sg[key];
  return typeof v === 'string' ? v : '';
}

function styleGuideBool(sg: Record<string, unknown> | null | undefined, key: string): boolean {
  if (!sg || typeof sg !== 'object') return false;
  return sg[key] === true || sg[key] === 'true';
}

export function Phase0Identity({ brandId, brand, onComplete, hideNameField = false, demoMode = false, userPlan = 'free' }: Phase0IdentityProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [noLogo, setNoLogo] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [domain, setDomain] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [story, setStory] = useState('');
  const [mainProduct, setMainProduct] = useState('');
  const [stage, setStage] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState<ProductTypeId>('tshirt');
  const [productWeight, setProductWeight] = useState('180 g/m²');

  const recommendation = useMemo(() => getSeasonalRecommendation(), []);
  const weightOptions = useMemo(() => getWeightOptions(productType), [productType]);

  useEffect(() => {
    if (!brand) return;
    setName(brand.name || '');
    setLogo(brand.logo || '');
    const sg = brand.styleGuide && typeof brand.styleGuide === 'object' ? (brand.styleGuide as Record<string, unknown>) : null;
    setNoLogo(styleGuideBool(sg, 'noLogo'));
    setDomain(brand.domain || '');
    const sh = brand.socialHandles && typeof brand.socialHandles === 'object' ? brand.socialHandles : {};
    setInstagram((sh as { instagram?: string }).instagram || '');
    setTwitter((sh as { twitter?: string }).twitter || '');
    setStory(styleGuideField(sg, 'story'));
    setMainProduct(styleGuideField(sg, 'mainProduct'));
    setStage(styleGuideField(sg, 'stage'));
    setTagline(styleGuideField(sg, 'tagline'));
    setDescription(styleGuideField(sg, 'description'));
    const pt = styleGuideField(sg, 'productType') as ProductTypeId;
    if (pt && PRODUCT_TYPE_IDS.includes(pt)) {
      setProductType(pt);
      const w = styleGuideField(sg, 'productWeight');
      if (w) setProductWeight(w);
    } else {
      setProductType(recommendation.productType);
      setProductWeight(recommendation.weight);
    }
  }, [brand, recommendation.productType, recommendation.weight]);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [error]);

  const handleSave = async (): Promise<boolean> => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Le nom de la marque est requis (2 caractères minimum).');
      return false;
    }
    setError('');
    setLoading(true);
    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 300));
        setSaved(true);
        return true;
      }
      const socialHandles: Record<string, string> = {};
      if (instagram.trim()) socialHandles.instagram = instagram.trim();
      if (twitter.trim()) socialHandles.twitter = twitter.trim();

      const styleGuide: Record<string, string | boolean> = {};
      if (story.trim()) styleGuide.story = story.trim();
      styleGuide.mainProduct = getProductTypeLabel(productType);
      if (stage.trim()) styleGuide.stage = stage.trim();
      if (tagline.trim()) styleGuide.tagline = tagline.trim();
      if (description.trim()) styleGuide.description = description.trim();
      styleGuide.productType = productType;
      styleGuide.productWeight = productWeight;
      styleGuide.noLogo = noLogo;

      const res = await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          logo: noLogo ? null : (logo.trim() || null),
          logoVariations: !noLogo && logo.trim() ? { main: logo.trim() } : undefined,
          domain: domain.trim() || null,
          socialHandles: Object.keys(socialHandles).length ? socialHandles : null,
          styleGuide,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’enregistrement');
      setSaved(true);
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l’enregistrement');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleValidateAndContinue = async () => {
    const ok = await handleSave();
    if (ok) {
      onComplete();
      router.push('/launch-map/phase/1');
    }
  };

  const handleNoLogo = () => {
    setNoLogo(true);
    setLogo('');
    setLogoUploadError('');
  };

  const LOGO_SIZE = 256;

  const checkImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image invalide'));
      };
      img.src = url;
    });
  };

  const uploadLogoFile = async (file: File): Promise<void> => {
    if (!file.type.startsWith('image/')) {
      setLogoUploadError('Choisissez une image (PNG, JPG, etc.).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLogoUploadError('L\'image ne doit pas dépasser 10 Mo.');
      return;
    }
    setLogoUploadError('');
    setLogoUploading(true);
    try {
      const { width, height } = await checkImageDimensions(file);
      if (width !== LOGO_SIZE || height !== LOGO_SIZE) {
        setLogoUploadError(`Le logo doit faire exactement ${LOGO_SIZE}×${LOGO_SIZE} pixels. Votre image fait ${width}×${height} px. Redimensionnez-la puis réessayez.`);
        setLogoUploading(false);
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('brandId', brandId);
      formData.append('isLogo', 'true');
      const res = await fetch('/api/ugc/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur upload');
      const url = typeof data.url === 'string' ? data.url : '';
      if (url) setLogo(url);
    } catch (e) {
      setLogoUploadError(e instanceof Error ? e.message : 'Erreur lors de l\'upload');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) uploadLogoFile(file);
  };

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogoFile(file);
    e.target.value = '';
  };

  const hasIdentity = Boolean(name.trim().length >= 2);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-foreground">
            Complétez l&apos;identité de votre marque (nom, logo si vous en avez un). Ce choix sera repris dans les étapes suivantes (modifiable avec confirmation).
          </p>
        </CardContent>
      </Card>

      {/* Identité de base */}
      <div className="grid gap-6 sm:grid-cols-2">
        {!hideNameField && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Nom de la marque *</label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Ex. Ma Marque"
              className="border-2"
            />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Logo</label>
          <div className="flex flex-col gap-2">
            {!noLogo ? (
              <>
                <div
                  onDrop={handleLogoDrop}
                  onDragOver={handleLogoDragOver}
                  onClick={() => logoFileInputRef.current?.click()}
                  className={cn(
                    'flex gap-3 items-center min-h-[56px] rounded-lg border-2 border-dashed transition-colors cursor-pointer',
                    logoUploading ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/40 hover:bg-muted/30'
                  )}
                >
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoFileSelect}
                  />
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0 border-2 flex items-center justify-center">
                    {logo ? (
                      <BrandLogo logoUrl={logo} brandName={name || 'Logo'} className="w-full h-full object-contain" />
                    ) : logoUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-2">
                    {logo ? (
                      <p className="text-sm text-foreground">Cliquez ou glissez-déposez pour remplacer le logo (256×256 px)</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Glissez-déposez votre logo (256×256 px) ici ou cliquez pour choisir un fichier</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Taille requise : <strong>256 × 256 pixels</strong> (carré). Ou collez l&apos;URL d&apos;une image ci-dessous.
                </p>
                <Input
                  value={logo}
                  onChange={(e) => { setLogo(e.target.value); setLogoUploadError(''); }}
                  placeholder="URL du logo (https://...)"
                  className="border-2"
                />
                {logoUploadError && <p className="text-sm text-destructive" role="alert">{logoUploadError}</p>}
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground w-fit gap-2" onClick={handleNoLogo}>
                  <ImageOff className="w-4 h-4" />
                  Je n&apos;ai pas de logo
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground">
                  {userPlan === 'free'
                    ? "Pas de logo pour l&apos;instant. Vous pouvez en ajouter un manuellement plus tard."
                    : "Pas de logo pour l&apos;instant. Vous pourrez en générer un par IA dans la phase Stratégie."}
                </span>
                <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setNoLogo(false)}>
                  J&apos;ai un logo à ajouter
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Domaine du site</label>
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="ex. ma-marque.com" className="border-2" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Slogan / baseline</label>
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Ex. La marque qui vous ressemble" className="border-2" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-muted-foreground">Description courte</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description de la marque" className="border-2" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Instagram</label>
          <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@mamarque" className="border-2" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Twitter / X</label>
          <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@mamarque" className="border-2" />
        </div>
      </div>

      {/* Recommandation saisonnière + produit principal */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" />
            Produit principal recommandé
          </h4>
          <p className="text-sm text-muted-foreground mb-4">{recommendation.reason}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type de vêtement</label>
              <select
                value={productType}
                onChange={(e) => {
                  const v = e.target.value as ProductTypeId;
                  setProductType(v);
                  const opts = getWeightOptions(v);
                  setProductWeight(opts[0]?.value ?? '180 g/m²');
                }}
                className="w-full h-11 px-4 py-2.5 text-sm bg-background border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
              >
                {PRODUCT_TYPE_IDS.map((id) => (
                  <option key={id} value={id}>{getProductTypeLabel(id)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Grammage (g/m²)</label>
              <select
                value={productWeight}
                onChange={(e) => setProductWeight(e.target.value)}
                className="w-full h-11 px-4 py-2.5 text-sm bg-background border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
              >
                {weightOptions.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Ce choix sera repris automatiquement dans la Calculatrice et le Design ; vous pourrez le modifier avec une confirmation.
          </p>
        </CardContent>
      </Card>

      {/* Pourquoi créer sa marque — histoire / raison d'être (réutilisée partout : descriptions produit, stratégie, etc.) */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-foreground mb-1">Pourquoi avez-vous créé cette marque ? Racontez votre histoire</h4>
          <p className="text-sm text-muted-foreground mb-4">
            On réutilisera cette histoire dans vos descriptions produit et partout pour donner du sens à la marque et que les gens s&apos;y retrouvent — c&apos;est la clé d&apos;une marque qui cartonne.
          </p>
          <Textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Ex. J'ai lancé cette marque après des années à ne pas trouver de vêtements qui me ressemblent. Je voulais des pièces minimalistes, durables, avec une vraie histoire derrière chaque coupe…"
            className="border-2 min-h-[120px] resize-y"
          />
        </CardContent>
      </Card>

      {/* Infos créateur */}
      <Card className="border-2 bg-muted/20">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-foreground mb-4">Informations que seul le créateur connaît</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Étape actuelle</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full h-11 px-4 py-2.5 text-sm bg-background border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
              >
                <option value="">Sélectionnez</option>
                <option value="ideation">Idéation / projet</option>
                <option value="prelaunch">Pré-lancement</option>
                <option value="launch">Lancement</option>
                <option value="growth">Croissance</option>
                <option value="established">Marque établie</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p ref={errorRef} className="text-sm text-destructive font-medium">{error}</p>}
      {saved && <p className="text-sm text-green-600 font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Enregistré.</p>}

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={loading || !name.trim()}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Enregistrement…</> : 'Enregistrer les modifications'}
        </Button>
        {hasIdentity && (
          <Button variant="default" onClick={handleValidateAndContinue} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Enregistrement…</> : <>Valider et continuer<ArrowRight className="w-4 h-4 ml-2" /></>}
          </Button>
        )}
        <Button variant="outline" onClick={() => router.push('/brands/create')}>
          Autre marque
        </Button>
      </div>
    </div>
  );
}
