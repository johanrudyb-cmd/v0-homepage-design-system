'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UsageTracker } from '@/components/usage/UsageTracker';
import { useSurplusModal } from '@/components/usage/SurplusModalContext';
import { USAGE_REFRESH_EVENT } from '@/lib/hooks/useAIUsage';

function UsagePageContent() {
  const openSurplusModal = useSurplusModal();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      // Rafraîchir immédiatement + retries fréquents (webhook Stripe peut être en retard)
      window.dispatchEvent(new CustomEvent(USAGE_REFRESH_EVENT));
      const intervals: NodeJS.Timeout[] = [];
      // Rafraîchir toutes les 2 secondes pendant 30 secondes pour capturer le webhook
      for (let i = 1; i <= 15; i++) {
        intervals.push(
          setTimeout(() => window.dispatchEvent(new CustomEvent(USAGE_REFRESH_EVENT)), i * 2000)
        );
      }
      const t3 = setTimeout(() => setShowSuccess(false), 10000);
      return () => {
        intervals.forEach(clearTimeout);
        clearTimeout(t3);
      };
    }
  }, [searchParams]);

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16 max-w-4xl mx-auto space-y-8 sm:space-y-12 lg:space-y-16">
      {showSuccess && (
        <div className="flex items-center gap-4 border-b border-[#E5E5E1] border-b-[1px] pb-6">
          <div>
            <p className="font-light text-sm text-[#1A1A1A] mb-1">Paiement validé</p>
            <p className="font-light text-xs text-[#1A1A1A] opacity-70">Vos crédits ont bien été ajoutés. Merci pour votre achat.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="space-y-4 border-b border-[#E5E5E1] border-b-[1px] pb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#1A1A1A]">
          Mes quotas
        </h1>
        <p className="font-light text-sm text-[#1A1A1A] opacity-70">
          Pack Fashion Launch — suivez vos utilisations et rechargez si besoin
        </p>
      </div>

      {/* Bouton Acheter des crédits */}
      <div className="flex justify-end">
        <Button
          onClick={openSurplusModal}
        >
          Acheter des crédits supplémentaires
        </Button>
      </div>

      {/* Usage Tracker par catégories */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisation des modules</CardTitle>
          <CardDescription>
            Intelligence, Identité, Marketing — barres de progression et alertes de recharge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsageTracker onRechargeClick={openSurplusModal} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function UsagePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16 max-w-4xl mx-auto">Chargement…</div>}>
        <UsagePageContent />
      </Suspense>
    </DashboardLayout>
  );
}
