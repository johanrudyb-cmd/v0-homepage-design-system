'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  const isDbError =
    error.message?.includes('Circuit breaker') ||
    error.message?.includes('database') ||
    error.message?.includes('Prisma') ||
    error.message?.includes('connection');

  return (
    <DashboardLayout>
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 border border-[#E5E5E1] border-[1px] flex items-center justify-center mx-auto">
          <span className="text-2xl font-serif text-[#1A1A1A]">!</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            {isDbError ? 'Base de données indisponible' : 'Une erreur est survenue'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isDbError
              ? 'La connexion à Supabase est temporairement indisponible. Vérifiez que le projet est actif dans le dashboard Supabase.'
              : 'Une erreur inattendue a interrompu le chargement du dashboard.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Réessayer
          </Button>
          <Link href="/auth/signin">
            <Button variant="outline">Retour à la connexion</Button>
          </Link>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
