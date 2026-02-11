'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VirtualTryOn } from './VirtualTryOn';
import { StructuredPostCreator } from './StructuredPostCreator';
import { ShootingPhoto } from './ShootingPhoto';
import { LayoutList, Image as ImageIcon, Camera, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Design pour UGC (Virtual Try-On, Shooting). Compatible avec les designs renvoyés par /api/designs. */
interface Design {
  id: string;
  type: string;
  flatSketchUrl: string | null;
  productImageUrl?: string | null;
  templateName?: string | null;
}

interface Brand {
  id: string;
  name: string;
  logo?: string | null;
  colorPalette?: any;
}

interface UGCLabProps {
  brandId: string;
  brandName: string;
  /** Designs de la marque (optionnel : Shooting photo charge la collection via l’API). */
  designs?: Design[];
  brand?: Brand;
  userPlan?: string;
}

export function UGCLab({ brandId, brandName, designs = [], brand, userPlan = 'free' }: UGCLabProps) {
  const [activeTab, setActiveTab] = useState<'tryon' | 'shooting' | 'scripts'>('tryon');

  if (userPlan === 'free') {
    return (
      <Card className="border-2 border-primary/20 bg-primary/5 py-12">
        <CardContent className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Débloquez l&apos;UGC Lab</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le Laboratoire UGC et ses outils d&apos;intelligence artificielle (Virtual Try-On, Shooting Photo, Scripts Marketing) sont réservés aux membres <strong>Créateur</strong>.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Shootings IA
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Virtual Try-On
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Scripts marketing
            </div>
          </div>
          <div className="pt-4">
            <Button
              size="lg"
              className="px-8 gap-2"
              onClick={() => window.location.href = '/auth/choose-plan'}
            >
              🚀 Passer au plan Créateur
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Onglets modernes */}
      <Card className="border-2">
        <CardContent className="p-0">
          <div className="flex gap-1 border-b-2 border-border bg-muted/30 p-1 rounded-t-lg">
            <button
              onClick={() => setActiveTab('tryon')}
              className={cn(
                'flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all relative',
                'flex items-center justify-center gap-2',
                activeTab === 'tryon'
                  ? 'bg-background text-foreground shadow-modern'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ImageIcon className="w-4 h-4" />
              Virtual Try-On
            </button>
            <button
              onClick={() => setActiveTab('shooting')}
              className={cn(
                'flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all relative',
                'flex items-center justify-center gap-2',
                activeTab === 'shooting'
                  ? 'bg-background text-foreground shadow-modern'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Camera className="w-4 h-4" />
              Shooting photo
            </button>
            <button
              onClick={() => setActiveTab('scripts')}
              className={cn(
                'flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all relative',
                'flex items-center justify-center gap-2',
                activeTab === 'scripts'
                  ? 'bg-background text-foreground shadow-modern'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutList className="w-4 h-4" />
              Post structuré
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Contenu */}
      {activeTab === 'tryon' && (
        <VirtualTryOn brandId={brandId} designs={designs} />
      )}

      {activeTab === 'shooting' && (
        <ShootingPhoto
          brandId={brandId}
          designs={designs}
          onSwitchToTryOn={() => setActiveTab('tryon')}
        />
      )}

      {activeTab === 'scripts' && (
        <StructuredPostCreator brandId={brandId} brandName={brandName} />
      )}
    </div>
  );
}
