'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';

interface Phase0IdentityProps {
  brandId: string;
  onComplete: () => void;
}

export function Phase0Identity({ brandId, onComplete }: Phase0IdentityProps) {
  const router = useRouter();

  const handleCreateIdentity = () => {
    router.push('/brands/create');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Créez l'identité de votre marque
          </h3>
          <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
            Définissez le nom, le logo et l'identité visuelle de votre marque avant de commencer.
            L'IA vous aidera à créer une identité cohérente et professionnelle.
          </p>
        </div>
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-lg text-foreground mb-2">
                Ce que vous allez créer :
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Nom de marque (5 suggestions IA)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Logo (3 options générées)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Palette de couleurs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Typographie
                </li>
              </ul>
            </div>
            <div className="pt-4">
              <Button
                onClick={handleCreateIdentity}
                className="w-full shadow-modern-lg"
                size="lg"
              >
                Créer mon identité de marque
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
