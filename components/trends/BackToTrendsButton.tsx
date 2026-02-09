'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Bouton Retour : redirige vers /trends. La position de scroll est restaurée côté page Tendances
 * (sauvegardée au clic sur "Voir en détail" dans sessionStorage).
 */
export function BackToTrendsButton() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/trends');
  };

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleBack} type="button">
      <ArrowLeft className="w-4 h-4" />
      Retour
    </Button>
  );
}
