'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Store, ExternalLink, Circle, CheckCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AppleLoader } from '@/components/ui/apple-loader';
import type { SiteCreationTodoStep } from '@/lib/api/claude';

interface Phase6ShopifyProps {
  brandId: string;
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
  { id: '2', label: 'Choisir un thème adapté au mono-produit (ex. Dawn, Craft)', done: false },
  { id: '3', label: 'Créer la fiche produit et coller la description générée avec nous', done: false },
  { id: '4', label: 'Ajouter les photos produit (atelier ou vos visuels)', done: false },
  { id: '5', label: 'Configurer livraison et paiements', done: false },
  { id: '6', label: 'Activer le domaine et lancer la boutique', done: false },
];

export function Phase6Shopify({ brandId, shopifyShopDomain, siteCreationTodo, onComplete }: Phase6ShopifyProps) {
  const [domain, setDomain] = useState(shopifyShopDomain ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const initialSteps = siteCreationTodo?.steps?.length ? siteCreationTodo.steps : DEFAULT_SITE_TODO_STEPS;
  const [steps, setSteps] = useState<SiteCreationTodoStep[]>(initialSteps);
  const [todoSaving, setTodoSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState('');

  useEffect(() => {
    setSteps(siteCreationTodo?.steps?.length ? siteCreationTodo.steps : DEFAULT_SITE_TODO_STEPS);
  }, [siteCreationTodo?.steps]);

  const isConnected = Boolean(shopifyShopDomain?.trim());

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
        body: JSON.stringify({ brandId, shopifyShopDomain: normalized }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la connexion');
        return;
      }
      onComplete();
    } finally {
      setLoading(false);
    }
  }

  if (isConnected) {
    const storeUrl = shopifyShopDomain!.startsWith('http') ? shopifyShopDomain! : `https://${shopifyShopDomain}`;
    return (
      <Card className="border-2 border-green-500/30 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground mb-1">Boutique Shopify connectée</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Votre boutique <strong>{shopifyShopDomain}</strong> est liée à cette marque. Vous pouvez créer des posts à partir de votre stratégie de contenu et les planifier dans le Calendrier.
              </p>
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Ouvrir ma boutique
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shopify Account Creation Banner */}
      {!isConnected && (
        <div className="bg-gradient-to-br from-[#95BF47] to-[#5E8E3E] rounded-3xl shadow-apple-lg p-10">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              {/* Logo Shopify */}
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-apple p-3">
                <Image 
                  src="/shopify-logo.png" 
                  alt="Shopify" 
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-semibold tracking-tight text-white">
                  Créez votre boutique Shopify
                </h3>
                <p className="text-lg text-white/90">
                  Lancez votre boutique en ligne et commencez à vendre vos créations. Connectez votre compte Shopify pour finaliser votre marque.
                </p>
              </div>
            </div>
            <Link href="https://www.shopify.com/fr-fr/start" target="_blank" rel="noopener noreferrer">
              <Button className="bg-white text-[#1D1D1F] hover:bg-white/90 font-semibold h-12 px-8 text-base shadow-apple">
                Créer mon compte Shopify
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* To-do complète étape par étape (générée par IA au calquage) */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="font-semibold text-foreground">Plan de création du site — étape par étape</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRegenerateTodo}
              disabled={regenerating}
              className="gap-2 shrink-0"
            >
              {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Régénérer (IA)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Suivez ces étapes pour lancer votre site mono-produit sur Shopify.
          </p>
          {regenerateError && <p className="text-sm text-destructive mb-3">{regenerateError}</p>}
          <ul className="space-y-3">
            {steps.map((step, i) => (
              <li key={step.id} className="flex gap-3 items-start">
                <button
                  type="button"
                  onClick={() => !todoSaving && toggleStep(step.id)}
                  disabled={todoSaving}
                  className="shrink-0 mt-0.5 rounded-[4px] border border-primary bg-primary/10 p-0.5 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  aria-label={step.done ? 'Marquer comme non faite' : 'Marquer comme faite'}
                >
                  {step.done ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                <span className={`text-sm leading-relaxed ${step.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Connectez votre boutique Shopify pour valider cette étape. Saisissez le domaine de votre boutique (ex. <code className="text-xs bg-muted px-1 rounded">votreboutique.myshopify.com</code>). Une fois connectée, vous pourrez générer des posts adaptés à chaque plateforme depuis votre stratégie de contenu et les planifier dans le Calendrier.
      </p>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <Label htmlFor="shopify-domain">Domaine de la boutique Shopify</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="shopify-domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="votreboutique.myshopify.com"
                  className="font-mono"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading} className="gap-2 shrink-0">
                  {loading ? (
                    <AppleLoader size="sm" />
                  ) : (
                    <Store className="w-4 h-4" />
                  )}
                  Connecter
                </Button>
              </div>
              {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
