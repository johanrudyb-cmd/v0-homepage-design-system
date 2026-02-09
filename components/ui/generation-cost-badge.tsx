'use client';

import type { AIFeatureKey } from '@/lib/ai-usage-config';

interface GenerationCostBadgeProps {
  /** Clé de la feature IA — conservée pour compatibilité */
  feature: AIFeatureKey | string;
  showZero?: boolean;
  showRemaining?: boolean;
  className?: string;
}

/**
 * Badge désactivé — les générations restantes sont affichées dans la navbar (forfait 34€/mois).
 */
export function GenerationCostBadge(_props: GenerationCostBadgeProps) {
  return null;
}
