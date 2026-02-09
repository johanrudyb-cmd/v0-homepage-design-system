'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  category: string;
  style: string;
  material: string;
  averagePrice: number;
  trendScore: number;
  saturability: number;
  imageUrl: string | null;
  description: string | null;
  searchVolume: number | null;
}

interface ProductDetailsProps {
  product: Product;
  userId: string;
  isFavorite: boolean;
}

export function ProductDetails({ product, userId, isFavorite: initialIsFavorite }: ProductDetailsProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch('/api/trends/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getSaturabilityColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-50 border-green-200';
    if (score < 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Image */}
      <Card className="border-stone-200">
        <CardContent className="p-0">
          <div className="relative aspect-square bg-stone-100 rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Détails */}
      <div className="space-y-6">
        <Card className="border-stone-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-light tracking-wide mb-2">
                  {product.name}
                </CardTitle>
                <div className="flex items-center gap-3 text-sm text-stone-500 font-light">
                  <span>{product.category}</span>
                  <span>•</span>
                  <span>{product.style}</span>
                  <span>•</span>
                  <span>{product.material}</span>
                </div>
              </div>
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                }`}
              >
                <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {product.description && (
              <div>
                <h3 className="text-sm font-medium text-stone-700 mb-2 uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-sm text-stone-600 font-light">
                  {product.description}
                </p>
              </div>
            )}

            {/* Métriques */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-stone-200 rounded-lg p-4">
                <div className="text-xs text-stone-500 font-light mb-1 uppercase tracking-wide">
                  Score tendance
                </div>
                <div className="text-2xl font-light text-stone-900">
                  {product.trendScore.toFixed(0)}/100
                </div>
              </div>
              <div className={`border rounded-lg p-4 ${getSaturabilityColor(product.saturability)}`}>
                <div className="text-xs font-light mb-1 uppercase tracking-wide">
                  Saturabilité
                </div>
                <div className="text-2xl font-light">
                  {product.saturability.toFixed(0)}%
                </div>
                <div className="text-xs font-light mt-1">
                  {product.saturability < 30 ? 'Opportunité' : product.saturability < 60 ? 'Modéré' : 'Saturé'}
                </div>
              </div>
              {product.searchVolume && (
                <div className="border border-stone-200 rounded-lg p-4">
                  <div className="text-xs text-stone-500 font-light mb-1 uppercase tracking-wide">
                    Volume recherche
                  </div>
                  <div className="text-2xl font-light text-stone-900">
                    {product.searchVolume.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs py-3"
            >
              Utiliser ce produit comme inspiration
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
