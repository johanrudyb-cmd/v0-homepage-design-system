'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Store, ArrowRight, LayoutDashboard, Map, Coins, CheckCircle } from 'lucide-react';
import { OnboardingFlowCreateBrand } from './OnboardingFlowCreateBrand';
import { OnboardingFlowExistingBrand } from './OnboardingFlowExistingBrand';

type Path = 'choice' | 'create' | 'existing';

interface OnboardingViewProps {
  userPlan: string;
}

export function OnboardingView({ userPlan }: OnboardingViewProps) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement…</div>}>
      <OnboardingContent userPlan={userPlan} />
    </Suspense>
  );
}

function OnboardingContent({ userPlan }: OnboardingViewProps) {
  const searchParams = useSearchParams();
  const subscribed = searchParams.get('subscribed') === 'true';
  const [path, setPath] = useState<Path>('choice');
  const [existingBrands, setExistingBrands] = useState<Array<{ id: string; name: string; logo?: string | null; domain?: string | null; socialHandles?: unknown }>>([]);

  useEffect(() => {
    if (subscribed) {
      fetch('/api/brands')
        .then((r) => (r.ok ? r.json() : Promise.resolve({ brands: [] })))
        .then((data) => {
          if (data.brands && Array.isArray(data.brands) && data.brands.length > 0) {
            setExistingBrands(data.brands);
            // Auto-rediriger vers "existing" si marque existante
            setPath('existing');
          }
        })
        .catch(() => { });
    }
  }, [subscribed]);

  if (path === 'create') {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <OnboardingFlowCreateBrand onBack={() => setPath('choice')} demoMode={false} userPlan={userPlan} />
      </div>
    );
  }

  if (path === 'existing') {
    const firstBrand = existingBrands[0];
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <OnboardingFlowExistingBrand
          onBack={() => setPath('choice')}
          demoMode={false}
          prefilledData={firstBrand ? {
            name: firstBrand.name,
            logoUrl: firstBrand.logo || '',
            domain: firstBrand.domain || '',
            socialHandles: firstBrand.socialHandles as { instagram?: string; twitter?: string } | undefined,
          } : undefined}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen">
      {subscribed && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800">
            Votre abonnement est activé. Tous les quotas ont été réinitialisés. Complétez votre profil pour accéder à toutes les fonctionnalités.
          </p>
        </div>
      )}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Bienvenue sur votre guide de lancement
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Créez ou enregistrez votre marque, puis lancez-vous avec identité, stratégie, design, sourcing et contenu.
        </p>
      </div>

      <div className="grid gap-6 w-full sm:grid-cols-2">
        <Card
          className="border-2 cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:bg-primary/5"
          onClick={() => setPath('create')}
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Je crée ma marque de zéro</CardTitle>
            <CardDescription>
              {userPlan === 'free'
                ? "Définissez votre positionnement et votre cible manuellement. Nous vous aidons à structurer votre projet étape par étape pour un lancement réussi."
                : "Inspirez-vous d'une marque tendance, copiez sa stratégie, puis l'IA vous propose un nom et une identité. Vous poursuivez dans le Guide de lancement."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2" variant="default">
              Commencer
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card
          className="border-2 cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:bg-primary/5"
          onClick={() => setPath('existing')}
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">J&apos;ai déjà ma marque</CardTitle>
            <CardDescription>
              Enregistrez le nom, logo, site et réseaux. Accédez directement au Guide de lancement, tendances, calendrier et UGC.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2" variant="outline">
              Continuer
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground mt-8 text-center max-w-md">
        Mode démo : parcours sans enregistrement. Vous pouvez refaire l&apos;onboarding autant de fois que vous voulez.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
          <LayoutDashboard className="w-4 h-4" />
          Tableau de bord
        </Link>
        <Link href="/launch-map" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
          <Map className="w-4 h-4" />
          Gérer ma marque
        </Link>
        <Link href="/usage" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
          <Coins className="w-4 h-4" />
          Mes quotas
        </Link>
      </div>
    </div>
  );
}
