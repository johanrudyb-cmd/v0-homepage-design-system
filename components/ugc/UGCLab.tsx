'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VirtualTryOn } from './VirtualTryOn';
import { StructuredPostCreator } from './StructuredPostCreator';
import { ShootingPhoto } from './ShootingPhoto';
import { LayoutList, Image as ImageIcon, Camera } from 'lucide-react';
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
}

export function UGCLab({ brandId, brandName, designs = [], brand }: UGCLabProps) {
  const [activeTab, setActiveTab] = useState<'tryon' | 'shooting' | 'scripts'>('tryon');

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
