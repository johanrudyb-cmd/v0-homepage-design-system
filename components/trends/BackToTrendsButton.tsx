'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <button
      onClick={handleBack}
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full",
        "bg-white border border-black/5 shadow-apple-sm transition-all duration-300",
        "hover:bg-[#F5F5F7] hover:scale-105 active:scale-95 group"
      )}
      title="Retour au radar"
    >
      <ArrowLeft className="w-5 h-5 text-black group-hover:-translate-x-0.5 transition-transform" />
    </button>
  );
}
