'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AppleLoader } from './apple-loader';

const DEFAULT_MESSAGES = [
  'Tissage de votre stratégie marketing...',
  'Découpe des meilleures tendances mondiales...',
  'Assemblage de votre identité de marque...',
  'Drapage de vos mockups en haute définition...',
  'Sourcing de vos futurs fournisseurs...',
  'Affinage des détails de vos fiches techniques...',
  'Filature de votre calendrier de contenu...',
];

interface GenerationLoadingPopupProps {
  open: boolean;
  title?: string;
  /** Messages affichés à tour de rôle (défilement toutes les 4 s). */
  messages?: string[];
  className?: string;
}

export function GenerationLoadingPopup({
  open,
  title = 'Génération en cours',
  messages = DEFAULT_MESSAGES,
  className,
}: GenerationLoadingPopupProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open || messages.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 4000);
    return () => clearInterval(t);
  }, [open, messages.length]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center p-4',
        'bg-black/60 backdrop-blur-md',
        'animate-fade-in',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label={title}
    >
      <div
        className={cn(
          'rounded-3xl bg-white shadow-apple-lg p-8 sm:p-10 max-w-sm w-full text-center',
          'animate-scale-in',
          'border border-black/5'
        )}
      >
        <div className="mb-6 flex justify-center">
          <AppleLoader size="lg" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-[#1D1D1F] mb-3">
          {title}
        </h3>
        <p
          key={index}
          className="text-sm text-[#1D1D1F]/70 transition-opacity duration-500 animate-fade-in"
        >
          {messages[index % messages.length]}
        </p>
        {messages.length > 1 && (
          <p className="text-xs text-[#1D1D1F]/50 mt-4">
            Cela peut prendre jusqu'à 1 à 2 minutes selon la complexité.
          </p>
        )}
      </div>
    </div>
  );
}
