'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Store, ExternalLink, Circle, CheckCircle, RefreshCw, Palette, Type, Code2, Copy, Check, Sparkles, ShoppingBag, ArrowRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AppleLoader } from '@/components/ui/apple-loader';
import type { SiteCreationTodoStep } from '@/lib/api/claude';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

interface Phase6ShopifyProps {
  brandId: string;
  brand: {
    id: string;
    name: string;
    logo?: string | null;
    colorPalette?: { primary?: string; secondary?: string; accent?: string } | null;
    typography?: { heading?: string; body?: string } | null;
  } | null;
  shopifyShopDomain: string | null;
  /** To-do création site générée par IA au calquage (étape par étape). */
  siteCreationTodo?: { steps: SiteCreationTodoStep[] } | null;
  onComplete: () => void;
}

function normalizeShopifyDomain(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, '');
    if (host.endsWith('.myshopify.com')) return host;
    return host + '.myshopify.com';
  } catch {
    return trimmed.endsWith('.myshopify.com') ? trimmed : trimmed + '.myshopify.com';
  }
}

const DEFAULT_SITE_TODO_STEPS: SiteCreationTodoStep[] = [
  { id: '1', label: 'Créer votre compte Shopify (bouton ci-dessous)', done: false },
  { id: '2', label: 'Choisir le thème DAWNS (gratuit, ultra-rapide)', done: false },
  { id: '3', label: 'Appliquer la palette de couleurs Outfity dans les paramètres du thème', done: false },
  { id: '4', label: 'Créer la fiche produit et coller la description générée par l\'IA', done: false },
  { id: '5', label: 'Ajouter les visuels premium (IA Mannequin / Design Studio)', done: false },
  { id: '6', label: 'Ajouter le badge "Partenaire Officiel Outfity" dans le footer', done: false },
  { id: '7', label: 'Configurer Stripe pour les paiements', done: false },
  { id: '8', label: 'Lancer la boutique avec votre domaine', done: false },
];

export function Phase6Shopify({ brandId, brand, shopifyShopDomain, siteCreationTodo, onComplete }: Phase6ShopifyProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState(shopifyShopDomain ?? '');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState('');
  const initialSteps = siteCreationTodo?.steps?.length ? siteCreationTodo.steps : DEFAULT_SITE_TODO_STEPS;
  const [steps, setSteps] = useState<SiteCreationTodoStep[]>(initialSteps);
  const [todoSaving, setTodoSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pour le preview du produit
  const [siteTexts, setSiteTexts] = useState<{ productTitle: string; productDescription: string } | null>(null);
  const [loadingTexts, setLoadingTexts] = useState(false);

  useEffect(() => {
    setSteps(siteCreationTodo?.steps?.length ? siteCreationTodo.steps : DEFAULT_SITE_TODO_STEPS);
  }, [siteCreationTodo?.steps]);

  useEffect(() => {
    if (brandId) {
      setLoadingTexts(true);
      fetch('/api/launch-map/site-texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId }),
      })
        .then(res => res.json())
        .then(data => {
          if (!data.error) setSiteTexts(data);
        })
        .finally(() => setLoadingTexts(false));
    }
  }, [brandId]);

  const isConnected = Boolean(shopifyShopDomain?.trim());

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: 'Copié !',
      message: 'Le code a été copié dans votre presse-papier.',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStep = useCallback(
    async (stepId: string) => {
      const next = steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s));
      setSteps(next);
      setTodoSaving(true);
      try {
        const res = await fetch('/api/launch-map/site-creation-todo', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandId, siteCreationTodo: { steps: next } }),
        });
        if (!res.ok) setSteps(steps);
      } catch {
        setSteps(steps);
      } finally {
        setTodoSaving(false);
      }
    },
    [brandId, steps]
  );

  async function handleRegenerateTodo() {
    setRegenerateError('');
    setRegenerating(true);
    try {
      const res = await fetch('/api/launch-map/regenerate-site-todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegenerateError(data.error || 'Erreur lors de la régénération');
        return;
      }
      if (data.siteCreationTodo?.steps?.length) {
        setSteps(data.siteCreationTodo.steps);
      }
    } finally {
      setRegenerating(false);
    }
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeShopifyDomain(domain);
    if (!normalized) {
      setError('Indiquez le domaine de votre boutique (ex. mystore.myshopify.com)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/launch-map/shopify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          shopifyShopDomain: normalized,
          shopifyAccessToken: accessToken.trim() || undefined
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la connexion');
        return;
      }
      toast({
        title: 'Boutique liée !',
        message: 'Votre boutique Shopify a été connectée avec succès.',
      });
      onComplete();
    } finally {
      setLoading(false);
    }
  }

  async function handlePushToShopify() {
    if (!isConnected) {
      toast({ title: 'Erreur', message: 'Connectez d\'abord votre boutique.', type: 'error' });
      return;
    }
    setPushing(true);
    try {
      const res = await fetch('/api/launch-map/push-to-shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, price: 59.90 }), // Prix par défaut
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erreur Import',
          message: data.error || 'Vérifiez votre Access Token Shopify.',
          type: 'error'
        });
        return;
      }
      toast({
        title: 'Produit Exporté !',
        message: 'Le produit a été créé en brouillon sur votre boutique Shopify.',
      });
    } finally {
      setPushing(false);
    }
  }

  const outfityBadgeCode = `<div class="outfity-partner-badge" style="text-align: center; margin: 40px 0 20px; font-family: sans-serif; opacity: 0.8;">
  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; display: block; margin-bottom: 8px;">Partenaire Officiel</span>
  <a href="https://outfity.ai" target="_blank" style="text-decoration: none; display: inline-block;">
    <img src="https://media-biangory.vercel.app/icon.png" alt="Outfity" style="height: 32px; filter: grayscale(100%); transition: filter 0.3s;" onmouseover="this.style.filter='none'" onmouseout="this.style.filter='grayscale(100%)'" />
  </a>
</div>`;

  const customCssCode = `/* Outfity Premium Theme Tweaks */
.button, .shopify-payment-button__button {
  border-radius: 12px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}
.button:hover, .shopify-payment-button__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}
.card, .p-block {
  border-radius: 20px !important;
  overflow: hidden;
}`;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identity: true,
    dev: false,
    plan: true,
    import: true,
    settings: false,
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header & Shopify Banner */}
      {!isConnected ? (
        <div className="bg-gradient-to-br from-[#95BF47] to-[#5E8E3E] rounded-2xl sm:rounded-3xl shadow-apple-lg p-6 sm:p-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-apple p-3">
                <Image src="/shopify-logo.png" alt="Shopify" width={48} height={48} className="object-contain" />
              </div>
              <div className="space-y-1 sm:space-y-2 text-white">
                <h3 className="text-xl sm:text-3xl font-semibold tracking-tight">Créez votre boutique Shopify</h3>
                <p className="text-sm sm:text-lg opacity-90 max-w-lg">
                  Lancez votre boutique en ligne avec notre lien partenaire pour débloquer les outils d&apos;exportation.
                </p>
              </div>
            </div>
            <Link href="https://www.shopify.com/fr-fr/start" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button className="w-full bg-white text-[#1D1D1F] hover:bg-white/90 font-semibold h-12 px-8 text-base shadow-apple">
                Créer mon compte
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <Card className="border-2 border-green-500/30 bg-green-500/5 rounded-2xl sm:rounded-3xl">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-4 text-left w-full sm:w-auto">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Boutique connectée</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">{shopifyShopDomain}</p>
                </div>
              </div>
              <Link href={`https://${shopifyShopDomain}`} target="_blank" className="w-full sm:w-auto text-center text-primary hover:underline flex items-center justify-center gap-2 font-medium text-sm">
                Accéder au site <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Colonne GAUCHE : Identité & Dev Corner */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Design Directives</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toggleSection('identity')} className="lg:hidden">
              <ChevronDown className={cn("w-5 h-5 transition-transform", expandedSections.identity && "rotate-180")} />
            </Button>
          </div>

          <div className={cn(!expandedSections.identity && "hidden lg:block")}>
            <Card className="rounded-2xl sm:rounded-3xl shadow-apple border-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-center sm:text-left">Marque : {brand?.name}</CardTitle>
                <CardDescription className="text-center sm:text-left text-xs">Utilisez ces réglages dans votre thème Shopify</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Couleurs */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase opacity-60">
                    <Palette className="w-3 h-3" /> Palette de couleurs
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['primary', 'secondary', 'accent'].map((key) => {
                      const color = brand?.colorPalette?.[key as keyof typeof brand.colorPalette] || '#eee';
                      return (
                        <button
                          key={key}
                          onClick={() => handleCopy(color, `color-${key}`)}
                          className="group flex items-center sm:flex-col gap-3 sm:gap-2 text-left p-2 sm:p-0 rounded-xl bg-muted/30 sm:bg-transparent border border-black/5 sm:border-0"
                        >
                          <div
                            className="h-10 w-10 sm:h-12 sm:w-full rounded-lg sm:rounded-xl border border-black/5 shadow-inner transition-transform group-hover:scale-95 shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
                            <span className="text-[10px] font-bold uppercase opacity-60">{key}</span>
                            <span className="text-[10px] font-mono">{color}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Polices */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase opacity-60">
                    <Type className="w-3 h-3" /> Typographies
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-black/5">
                      <div>
                        <span className="text-[10px] font-bold uppercase opacity-60 block">Titres</span>
                        <span className="text-sm font-medium">{brand?.typography?.heading || 'Sans-serif'}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(brand?.typography?.heading || '', 'font-h')}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-black/5">
                      <div>
                        <span className="text-[10px] font-bold uppercase opacity-60 block">Corps</span>
                        <span className="text-sm font-medium">{brand?.typography?.body || 'Sans-serif'}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(brand?.typography?.body || '', 'font-b')}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dev Corner */}
            <div className="flex items-center gap-2 px-2 pt-4">
              <Code2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Dev Corner — Design Pro</h3>
            </div>
            <Card className="rounded-3xl shadow-apple border-2 bg-black text-white">
              <CardHeader>
                <CardTitle className="text-base text-white">Custom CSS Premium</CardTitle>
                <CardDescription className="text-white/60">Collez ceci dans Boutique en ligne &gt; Thèmes &gt; Personnaliser &gt; Paramètres &gt; CSS Personnalisé</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative group">
                  <pre className="p-4 rounded-xl bg-white/10 text-[11px] font-mono leading-relaxed overflow-x-auto text-white/90 max-h-[200px] border border-white/10 no-scrollbar">
                    {customCssCode}
                  </pre>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" onClick={() => handleCopy(customCssCode, 'css')} className="h-8 rounded-lg bg-white text-black hover:bg-white/90">
                      {copiedId === 'css' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === 'css' ? 'Copié' : 'Copier CSS'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2 px-1">
                    <CheckCircle2 className="w-4 h-4 text-[#95BF47]" />
                    <span className="text-sm font-semibold">Badge "Partenaire Officiel"</span>
                  </div>
                  <p className="text-xs text-white/50 px-1">Affiche le logo Outfity dans votre pied de page pour booster la confiance client.</p>
                  <div className="relative group">
                    <pre className="p-4 rounded-xl bg-white/10 text-[10px] font-mono leading-relaxed overflow-x-auto text-white/90 border border-white/10 no-scrollbar">
                      {outfityBadgeCode}
                    </pre>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" onClick={() => handleCopy(outfityBadgeCode, 'badge')} className="h-8 rounded-lg bg-white text-black hover:bg-white/90">
                        {copiedId === 'badge' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedId === 'badge' ? 'Copié' : 'Copier Liquid'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Colonne DROITE : Checklist & Import Direct */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Plan d&apos;exécution A-Z</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toggleSection('plan')} className="lg:hidden">
              <ChevronDown className={cn("w-5 h-5 transition-transform", expandedSections.plan && "rotate-180")} />
            </Button>
          </div>

          <div className={cn(!expandedSections.plan && "hidden lg:block")}>
            <Card className="rounded-2xl sm:rounded-3xl shadow-apple border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider opacity-60">Checklist Interactive</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerateTodo}
                    disabled={regenerating}
                    className="h-8 px-2 text-primary gap-1"
                  >
                    {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Régénérer par l&apos;IA
                  </Button>
                </div>
                <div className="space-y-2">
                  {steps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => !todoSaving && toggleStep(step.id)}
                      disabled={todoSaving}
                      className={cn(
                        "w-full flex items-start gap-4 p-4 rounded-2xl transition-all border text-left group",
                        step.done
                          ? "bg-green-500/5 border-green-500/10 opacity-60"
                          : "bg-white border-black/5 hover:border-primary/30 hover:shadow-apple"
                      )}
                    >
                      <div className={cn(
                        "shrink-0 mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                        step.done ? "bg-green-500 border-green-500 text-white" : "border-black/10 group-hover:border-primary/50"
                      )}>
                        {step.done && <Check className="w-4 h-4" />}
                      </div>
                      <p className={cn("text-sm font-medium", step.done && "line-through")}>{step.label}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* IMPORT DIRECT */}
          <div className="flex items-center justify-between gap-2 px-2 pt-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Importation Directe</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toggleSection('import')} className="lg:hidden">
              <ChevronDown className={cn("w-5 h-5 transition-transform", expandedSections.import && "rotate-180")} />
            </Button>
          </div>

          <div className={cn(!expandedSections.import && "hidden lg:block")}>
            <Card className="rounded-2xl sm:rounded-3xl shadow-apple border-2 overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="bg-white border-b border-black/5 py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Preview Produit
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {loadingTexts ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <AppleLoader size="md" />
                    <p className="text-xs text-muted-foreground animate-pulse">Extraction des données de la stratégie...</p>
                  </div>
                ) : siteTexts ? (
                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
                      <div className="w-20 h-20 rounded-xl bg-muted shrink-0 flex items-center justify-center overflow-hidden border border-black/5">
                        {brand?.logo ? (
                          <img src={brand.logo as string} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Sparkles className="w-6 h-6 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate">{siteTexts?.productTitle}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{siteTexts?.productDescription}</p>
                        <p className="text-sm font-bold mt-2 text-primary">59,90 €</p>
                      </div>
                    </div>
                    <Button
                      disabled={pushing || !isConnected}
                      onClick={handlePushToShopify}
                      className="w-full h-12 rounded-xl bg-black text-white hover:bg-black/90 gap-2 shadow-apple"
                    >
                      {pushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      Exporter vers ma boutique Shopify
                    </Button>
                    {!isConnected && (
                      <p className="text-[10px] text-center text-muted-foreground">Liez votre boutique ci-dessous pour activer l&apos;exportation.</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs text-muted-foreground">Complétez la stratégie marketing pour activer l&apos;importation automatique.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Link Boutique Card */}
          <div className="flex items-center justify-between gap-2 px-2 pt-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Connexion Boutique</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toggleSection('settings')} className="lg:hidden">
              <ChevronDown className={cn("w-5 h-5 transition-transform", expandedSections.settings && "rotate-180")} />
            </Button>
          </div>

          <div className={cn(!expandedSections.settings && "hidden lg:block")}>
            <Card className="rounded-2xl sm:rounded-3xl shadow-apple border-2">
              <CardContent className="pt-6">
                <form onSubmit={handleConnect} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shopify-domain" className="text-xs font-bold uppercase opacity-60">URL de la boutique</Label>
                      <Input
                        id="shopify-domain"
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="ma-marque.myshopify.com"
                        className="h-12 rounded-xl bg-muted/30 border-black/5 font-mono"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="shopify-token" className="text-xs font-bold uppercase opacity-60">Access Token (Optionnel)</Label>
                        <Link href="https://help.shopify.com/fr/manual/apps/app-types/custom-apps" target="_blank" className="text-[10px] text-primary hover:underline">Où trouver ?</Link>
                      </div>
                      <Input
                        id="shopify-token"
                        type="password"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                        className="h-12 rounded-xl bg-muted/30 border-black/5 font-mono"
                        disabled={loading}
                      />
                      <p className="text-[10px] text-muted-foreground opacity-60 px-1 italic">
                        L&apos;Access Token est requis uniquement pour l&apos;importation automatique de produits.
                      </p>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#007AFF] hover:bg-[#0056CC] gap-2">
                      {loading ? <AppleLoader size="sm" /> : <Store className="w-4 h-4" />}
                      Enregistrer les réglages
                    </Button>
                    {error && <p className="text-sm text-destructive font-bold text-center mt-2">{error}</p>}
                  </div>
                </form>
                <div className="mt-4 pt-4 border-t border-black/5">
                  <Link href={`/admin/shopify-simulator?brandId=${brandId}`} className="text-xs text-primary hover:underline flex items-center justify-center gap-1 font-medium">
                    <ExternalLink className="w-3 h-3" /> Ouvrir la console du simulateur local
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
