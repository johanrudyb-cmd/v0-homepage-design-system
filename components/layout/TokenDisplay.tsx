'use client';

import { useEffect, useState, useCallback } from 'react';
import { USAGE_REFRESH_EVENT } from '@/lib/hooks/useAIUsage';

interface UsageData {
  tokens: number;
  tokensBudget: number | null;
  generationsRemaining: number;
  generationsBudget: number | null;
  used: number;
  plan: string;
}

interface TokenDisplayProps {
  /** Variante compacte pour la sidebar (sans jauge) */
  compact?: boolean;
  /** Afficher la jauge (barre de progression) — navbar par défaut */
  showGauge?: boolean;
}

export function TokenDisplay({ compact = false, showGauge = true }: TokenDisplayProps) {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(() => {
    fetch('/api/usage/ai')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d && typeof d.tokens === 'number') {
          const gen = d.generationsRemaining ?? Math.floor(d.tokens / 34);
          const budget = d.generationsBudget ?? (d.tokensBudget != null ? Math.round(d.tokensBudget / 34) : null);
          setData({ ...d, generationsRemaining: gen, generationsBudget: budget });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  useEffect(() => {
    window.addEventListener(USAGE_REFRESH_EVENT, fetchUsage);
    return () => window.removeEventListener(USAGE_REFRESH_EVENT, fetchUsage);
  }, [fetchUsage]);

  if (loading) {
    return (
      <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-apple">
        <span className="text-sm font-medium text-[#1D1D1F]/40">—</span>
      </div>
    );
  }

  if (!data) return null;

  // Illimité (plan enterprise)
  if (data.generationsRemaining < 0 || data.generationsBudget === null) {
    return (
      <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-apple">
        <span className="text-sm font-medium text-[#1D1D1F]">Illimité</span>
      </div>
    );
  }

  // Navbar : Badge Apple avec espace
  if (showGauge && !compact && data.generationsBudget) {
    return (
      <div
        className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-apple"
        title={`${data.generationsRemaining} générations restantes sur ${data.generationsBudget}`}
      >
        <span className="text-sm font-medium text-[#1D1D1F] tabular-nums">
          {data.generationsRemaining} / {data.generationsBudget}
        </span>
      </div>
    );
  }

  // Sidebar compacte
  return (
    <div
      className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-apple"
      title={`${data.generationsRemaining} générations restantes sur ${data.generationsBudget}`}
    >
      <span className="text-sm font-medium text-[#1D1D1F] tabular-nums">
        {data.generationsRemaining}
      </span>
      {compact && data.generationsBudget && (
        <span className="text-xs text-[#1D1D1F]/60"> / {data.generationsBudget}</span>
      )}
    </div>
  );
}
