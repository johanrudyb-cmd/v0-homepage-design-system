'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Phase3SourcingProps {
  brandId: string;
  onComplete: () => void;
}

export function Phase3Sourcing({ brandId, onComplete }: Phase3SourcingProps) {
  const [quoteCount, setQuoteCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Vérifier le nombre de devis envoyés
    const checkQuotes = async () => {
      try {
        const response = await fetch(`/api/quotes?brandId=${brandId}`);
        if (response.ok) {
          const data = await response.json();
          const sentQuotes = data.quotes?.filter((q: any) => q.status === 'sent') || [];
          setQuoteCount(sentQuotes.length);
          
          if (sentQuotes.length >= 2 && !isCompleted) {
            setIsCompleted(true);
            onComplete();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
      }
    };

    checkQuotes();
    // Vérifier toutes les 5 secondes
    const interval = setInterval(checkQuotes, 5000);
    return () => clearInterval(interval);
  }, [brandId, onComplete, isCompleted]);

  return (
    <div className="space-y-6">
      <div className="text-stone-700 font-light">
        <p className="mb-4">
          Pour valider cette phase, vous devez envoyer une demande de devis à au moins 2 usines du Sourcing Hub.
        </p>
        <p className="text-sm text-stone-600">
          Le Sourcing Hub vous permet de :
        </p>
        <ul className="list-disc list-inside text-sm text-stone-600 mt-2 space-y-1">
          <li>Filtrer les usines par pays, MOQ, spécialités</li>
          <li>Contacter directement les fournisseurs</li>
          <li>Envoyer votre Tech Pack pour obtenir des devis</li>
        </ul>
      </div>

      {quoteCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm text-amber-800 font-medium">
            {quoteCount} devis envoyé{quoteCount > 1 ? 's' : ''} sur 2 requis
          </div>
          {quoteCount >= 2 && (
            <div className="text-xs text-amber-700 mt-1">
              ✓ Phase 3 complétée
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <Link href="/sourcing">
          <Button className="bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs py-3 px-6">
            Explorer le Sourcing Hub
          </Button>
        </Link>
      </div>
    </div>
  );
}
