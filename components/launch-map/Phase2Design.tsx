'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Phase2DesignProps {
  brandId: string;
  onComplete: () => void;
}

export function Phase2Design({ brandId, onComplete }: Phase2DesignProps) {
  const [hasDesign, setHasDesign] = useState(false);

  useEffect(() => {
    // Vérifier si un design existe pour cette marque
    const checkDesign = async () => {
      try {
        const response = await fetch(`/api/designs?brandId=${brandId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.designs && data.designs.length > 0) {
            setHasDesign(true);
            // Marquer la phase comme complétée
            await fetch('/api/launch-map/phase2', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ brandId }),
            });
            onComplete();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
      }
    };

    checkDesign();
    // Vérifier toutes les 5 secondes
    const interval = setInterval(checkDesign, 5000);
    return () => clearInterval(interval);
  }, [brandId, onComplete]);

  return (
    <div className="space-y-6">
      <div className="text-stone-700 font-light">
        <p className="mb-4">
          Pour valider cette phase, vous devez créer votre premier Tech Pack via le Design Studio IA.
        </p>
        <p className="text-sm text-stone-600">
          Le Tech Pack doit inclure :
        </p>
        <ul className="list-disc list-inside text-sm text-stone-600 mt-2 space-y-1">
          <li>Flat sketch (recto/verso)</li>
          <li>Liste des composants (tissu, bord-côte, étiquettes, boutons)</li>
        </ul>
      </div>

      {hasDesign && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm text-amber-800 font-medium">
            ✓ Design créé avec succès
          </div>
          <div className="text-xs text-amber-700 mt-1">
            La Phase 2 est maintenant complétée
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Link href="/design-studio">
          <Button className="bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs py-3 px-6">
            Accéder au Design Studio IA
          </Button>
        </Link>
      </div>
    </div>
  );
}
