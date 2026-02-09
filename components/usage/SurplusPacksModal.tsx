'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SurplusPack {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  popular?: boolean;
}

const SURPLUS_PACKS: SurplusPack[] = [
  {
    id: 'logos-plus',
    name: 'Logos+',
    description: '10 logos supplémentaires',
    price: '9,90€',
    features: ['10 générations de logos'],
  },
  {
    id: 'photos-plus',
    name: 'Photos+',
    description: 'Shooting photo & produit',
    price: '14,90€',
    features: ['5 shootings photo', '2 shootings produit (4 images chacun)'],
    popular: true,
  },
  {
    id: 'scripts-plus',
    name: 'Scripts+',
    description: 'Scripts UGC en masse',
    price: '4,90€',
    features: ['10 lots de 5 scripts'],
  },
  {
    id: 'tryon-premium',
    name: 'Virtual Try-On',
    description: 'Module Premium à l\'essai',
    price: '7,90€ / essai',
    features: ['1 virtual try-on'],
  },
];

interface SurplusPacksModalProps {
  open: boolean;
  onClose: () => void;
}

export function SurplusPacksModal({ open, onClose }: SurplusPacksModalProps) {
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (packId: string) => {
    setError(null);
    setLoadingPackId(packId);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ packId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Erreur ${res.status} lors de la création du paiement`);
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
      setLoadingPackId(null);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-white dark:bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white dark:bg-zinc-900 px-6 py-4">
          <h2 className="text-lg font-semibold">Acheter des crédits supplémentaires</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            Rechargez vos modules pour continuer à utiliser les fonctionnalités IA.
          </p>

          {error && (
            <div className="p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {SURPLUS_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={cn(
                  'relative rounded-xl border p-5 transition-colors',
                  pack.popular
                    ? 'border-primary/50 bg-primary/10 dark:bg-primary/20'
                    : 'border-border bg-zinc-50 dark:bg-zinc-800/80 hover:border-primary/30'
                )}
              >
                {pack.popular && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                    Populaire
                  </span>
                )}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{pack.name}</h3>
                    <p className="text-sm text-muted-foreground">{pack.description}</p>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {pack.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    variant={pack.popular ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    disabled={loadingPackId !== null}
                    onClick={() => handlePurchase(pack.id)}
                  >
                    {loadingPackId === pack.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirection…
                      </>
                    ) : (
                      pack.price
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
