'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
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
}

interface ProductCardProps {
  product: Product;
  userId: string;
  isFavorite: boolean;
}

export function ProductCard({ product, userId, isFavorite: initialIsFavorite }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
    if (score < 30) return 'text-green-600 bg-green-50';
    if (score < 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getTrendBadge = (score: number) => {
    if (score >= 80) return { label: '🔥 Hot', color: 'bg-red-100 text-red-700' };
    if (score >= 60) return { label: '📈 Trending', color: 'bg-amber-100 text-amber-700' };
    return { label: '📊 Stable', color: 'bg-stone-100 text-stone-700' };
  };

  const trendBadge = getTrendBadge(product.trendScore);

  return (
    <Link href={`/trends/${product.id}`}>
      <Card className="border-stone-200 hover:border-amber-400 transition-all cursor-pointer group">
        <div className="relative aspect-square bg-stone-100 rounded-t-lg overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              isFavorite
                ? 'bg-amber-600 text-white'
                : 'bg-white/80 text-stone-400 hover:bg-white'
            }`}
          >
            <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${trendBadge.color}`}>
              {trendBadge.label}
            </span>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-medium text-stone-900 mb-1">{product.name}</h3>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-light">
              <span>{product.category}</span>
              <span>•</span>
              <span>{product.style}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-200">
            <div>
              <div className="text-sm font-medium text-stone-900">
                {product.averagePrice.toFixed(0)}€
              </div>
              <div className="text-xs text-stone-500 font-light">Prix moyen</div>
            </div>
            <div className="text-right">
              <div className={`text-xs px-2 py-1 rounded font-medium ${getSaturabilityColor(product.saturability)}`}>
                {product.saturability.toFixed(0)}% saturé
              </div>
              <div className="text-xs text-stone-500 font-light mt-1">
                Score tendance: {product.trendScore.toFixed(0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
