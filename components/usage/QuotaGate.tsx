'use client';

import { useQuota } from '@/lib/hooks/useQuota';
import type { QuotaFeatureKey } from '@/lib/quota-config';

interface QuotaGateProps {
  feature: QuotaFeatureKey;
  /** Contenu du bouton ou de l'action quand le quota est disponible */
  children: React.ReactNode;
  /** Callback quand l'utilisateur clique sur "Recharger ce module" */
  onRecharge?: () => void;
  /** Pour Try-On : toujours afficher le bouton actif avec le prix premium */
  isPremiumModule?: boolean;
  /** Rendu alternatif quand épuisé (ex: bouton désactivé) */
  renderExhausted?: (onRecharge: () => void) => React.ReactNode;
}

/**
 * Encadre une action soumise à quota. Quand le quota est épuisé, affiche
 * le bouton "Recharger ce module" à la place. Pour le module Premium (Try-On),
 * affiche toujours le contenu avec le badge de prix.
 */
export function QuotaGate({
  feature,
  children,
  onRecharge = () => {},
  isPremiumModule = false,
  renderExhausted,
}: QuotaGateProps) {
  const status = useQuota(feature);

  if (isPremiumModule) {
    return <>{children}</>;
  }

  if (!status) return <>{children}</>;

  if (status.isExhausted) {
    if (renderExhausted) return <>{renderExhausted(onRecharge)}</>;
    return (
      <button
        type="button"
        onClick={onRecharge}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:from-primary/90 hover:to-primary/70 hover:shadow-xl hover:shadow-primary/30"
      >
        Recharger ce module
      </button>
    );
  }

  return <>{children}</>;
}
