'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';

/** Chemins ou préfixes paywalled (tous les autres sont gratuits) */
const PAYWALLED_PATHS: { path: string; exact?: boolean }[] = [
  { path: '/launch-map' }, // tout sauf phase/2
  { path: '/design-studio' },
  { path: '/ugc' },
  { path: '/brands/analyze' },
  { path: '/sourcing' },
];

function isPaywalledPath(pathname: string): boolean {
  // Calculateur de marge : gratuit
  if (pathname === '/launch-map/phase/2' || pathname.startsWith('/launch-map/phase/2/')) return false;
  for (const { path, exact } of PAYWALLED_PATHS) {
    if (exact ? pathname === path : pathname === path || pathname.startsWith(path + '/')) return true;
  }
  return false;
}

export function PaywallGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ plan?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const isFree = user?.plan === 'free';
    const isPathPaywalled = isPaywalledPath(pathname || '');
    setShowPaywall(!!(isFree && isPathPaywalled));
  }, [loading, user?.plan, pathname]);

  // Toujours la même structure racine pour éviter hydration mismatch
  if (showPaywall) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-8 py-16">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-[#007AFF]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1D1D1F]">
            Fonctionnalité réservée au plan Créateur
          </h2>
          <p className="text-[#6e6e73]">
            Passez au plan Créateur à 34€/mois pour débloquer tous les outils : stratégie, designs, shootings, sourcing, formation et plus.
          </p>
          <Link
            href="/auth/choose-plan"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#000000] text-white rounded-full font-semibold hover:bg-[#1D1D1F] transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Passer au plan Créateur
          </Link>
          <p className="text-sm text-[#6e6e73]">
            Annulable à tout moment
          </p>
        </div>
      </div>
    );
  }

  return <div className="min-w-0 flex-1">{children}</div>;
}
