'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VirtualTryOn } from './VirtualTryOn';
import { StructuredPostCreator } from './StructuredPostCreator';
import { ShootingPhoto } from './ShootingPhoto';
import { LogoGenerator } from './LogoGenerator';
import { LayoutList, Image as ImageIcon, Camera, Sparkles, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { FeatureUsageBadge } from '@/components/usage/FeatureUsageBadge';

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
  const [activeTab, setActiveTab] = useState<'tryon' | 'shooting' | 'scripts' | 'logo'>('tryon');

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
    <div className="space-y-4">
      {/* Onglets modernes */}
      <Card className="border-b-2 rounded-none border-x-0 border-t-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="flex gap-1 bg-muted/20 p-1 rounded-t-lg overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('tryon')}
              className={cn(
                'flex-1 min-w-[140px] px-4 py-2 text-xs font-semibold rounded-lg transition-all relative',
                'flex items-center justify-center gap-2',
                activeTab === 'tryon'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Virtual Try-On</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">PREMIUM</span>
            </button>
            <button
              onClick={() => setActiveTab('shooting')}
              className={cn(
                'flex-1 min-w-[140px] px-4 py-2 text-xs font-semibold rounded-lg transition-all relative',
                'flex items-center justify-center gap-2',
                activeTab === 'shooting'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Camera className="w-3.5 h-3.5" />
              Shooting photo
            </button>
            <button
              onClick={() => setActiveTab('logo')}
              className={cn(
                'flex-1 min-w-[140px] px-4 py-2 text-xs font-semibold rounded-lg transition-all relative',
                'flex items-center justify-center gap-2',
                activeTab === 'logo'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <PenTool className="w-3.5 h-3.5" />
              Identité visuelle
            </button>
            <button
              onClick={() => setActiveTab('scripts')}
              className={cn(
                'flex-1 min-w-[140px] px-4 py-2 text-xs font-semibold rounded-lg transition-all relative',
                'flex items-center justify-center gap-2',
                activeTab === 'scripts'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutList className="w-3.5 h-3.5" />
              Post structuré
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Contenu */}
      <div className="min-h-0">
        {activeTab === 'tryon' && (
          <div className="space-y-3">
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-medium text-amber-800">Le Virtual Try-On Premium est payant à l&apos;unité (7,90€ / essai).</p>
              </div>
              <FeatureUsageBadge featureKey="ugc_virtual_tryon" className="bg-white/50 px-3 py-1 rounded-lg" isFree={userPlan === 'free'} />
              <Link href="/usage" className="text-[10px] font-bold text-amber-700 underline hover:no-underline shrink-0">CRÉDITS</Link>
            </div>
            <VirtualTryOn brandId={brandId} designs={designs} />
          </div>
        )}

        {activeTab === 'shooting' && (
          <div className="space-y-3">
            <div className="px-4">
              <FeatureUsageBadge featureKey="ugc_shooting_photo" isFree={userPlan === 'free'} />
            </div>
            <ShootingPhoto
              brandId={brandId}
              designs={designs}
              onSwitchToTryOn={() => setActiveTab('tryon')}
            />
          </div>
        )}

        {activeTab === 'logo' && (
          <div className="space-y-3">
            <div className="px-4">
              <FeatureUsageBadge featureKey="brand_logo" isFree={userPlan === 'free'} />
            </div>
            <LogoGenerator brandId={brandId} />
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="space-y-3">
            <div className="px-4">
              <FeatureUsageBadge featureKey="ugc_scripts" isFree={userPlan === 'free'} />
            </div>
            <StructuredPostCreator brandId={brandId} brandName={brandName} />
          </div>
        )}
      </div>
    </div>
  );
}
