'use client';

import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface BrandIdentityStep2Props {
  loading: boolean;
}

export function BrandIdentityStep2({ loading }: BrandIdentityStep2Props) {
  return (
    <div className="py-12 text-center space-y-6">
      {loading ? (
        <>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              Génération en cours...
            </h3>
            <p className="text-muted-foreground font-medium">
              L'IA crée votre identité de marque (nom, logo, couleurs, typographie)
            </p>
            <p className="text-sm text-muted-foreground">
              Cela peut prendre 10-30 secondes
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              Génération terminée !
            </h3>
            <p className="text-muted-foreground font-medium">
              Votre identité de marque est prête
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
