'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Video } from 'lucide-react';
import type { BrandIdentity } from './LaunchMapStepper';
import { MockupPackSelector } from './MockupPackSelector';

interface PhaseMockupCreationProps {
  brandId: string;
  brand?: BrandIdentity | null;
  onComplete: () => void;
}

export function PhaseMockupCreation({ brandId, brand, onComplete }: PhaseMockupCreationProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

  useEffect(() => {
    if (!brandId) return;
    setIsLoadingRecommendations(true);
    fetch(`/api/launch-map/mockup/recommendations?brandId=${encodeURIComponent(brandId)}`)
      .then((res) => (res.ok ? res.json() : { recommendations: [] }))
      .then((data) => setRecommendations(data.recommendations || []))
      .catch(() => setRecommendations([]))
      .finally(() => setIsLoadingRecommendations(false));
  }, [brandId]);

  return (
    <div className="space-y-8">
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Video className="w-6 h-6 text-primary" />
            Comment créer votre design
          </CardTitle>
          <CardDescription className="text-base">
            Dans l&apos;onglet Tech Pack vous pourrez télécharger un pack de mockup et suivre les étapes (type de produit → dimensions → import).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="aspect-video w-full rounded-lg bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/30 min-h-[200px]">
            <div className="text-center space-y-2 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto" />
              <p className="text-sm">Vidéo tutorielle à venir</p>
            </div>
          </div>
          <MockupPackSelector brandId={brandId} brandName={brand?.name} />
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Recommandations pour votre vêtement
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRecommendations ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : recommendations.length > 0 ? (
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 p-3 rounded-lg border border-border bg-muted/30 text-sm">
                  <span className="text-primary font-medium">{i + 1}.</span>
                  {rec}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune recommandation pour le moment.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={onComplete} variant="default" className="gap-2">
          Valider et passer à l&apos;étape suivante
        </Button>
      </div>
    </div>
  );
}
