'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VirtualTryOn } from './VirtualTryOn';
import { ScriptGenerator } from './ScriptGenerator';

interface Design {
  id: string;
  type: string;
  flatSketchUrl: string | null;
}

interface UGCLabProps {
  brandId: string;
  brandName: string;
  designs: Design[];
}

export function UGCLab({ brandId, brandName, designs }: UGCLabProps) {
  const [activeTab, setActiveTab] = useState<'tryon' | 'scripts'>('tryon');

  return (
    <div className="space-y-6">
      {/* Onglets */}
      <div className="flex gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('tryon')}
          className={`px-6 py-3 text-sm font-light tracking-wide uppercase border-b-2 transition-colors ${
            activeTab === 'tryon'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Virtual Try-On
        </button>
        <button
          onClick={() => setActiveTab('scripts')}
          className={`px-6 py-3 text-sm font-light tracking-wide uppercase border-b-2 transition-colors ${
            activeTab === 'scripts'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Script Generator
        </button>
      </div>

      {/* Contenu */}
      {activeTab === 'tryon' && (
        <VirtualTryOn brandId={brandId} designs={designs} />
      )}

      {activeTab === 'scripts' && (
        <ScriptGenerator brandId={brandId} brandName={brandName} />
      )}
    </div>
  );
}
