'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';

function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const u = url.trim();
  if (!u) return null;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return `https:${u}`;
}

interface ProductDetailImageProps {
  imageUrl: string | null;
  alt: string;
  className?: string;
}

/**
 * Affiche l’image produit en détail avec repli sur <img> si Next/Image échoue
 * (certaines URLs externes ASOS/Zalando ne passent pas par l’optimisation Next).
 */
export function ProductDetailImage({ imageUrl, alt, className = 'object-cover' }: ProductDetailImageProps) {
  const [useFallback, setUseFallback] = useState(false);
  const src = normalizeImageUrl(imageUrl);

  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted">
        <Package className="w-12 h-12" />
      </div>
    );
  }

  if (useFallback) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 144px, 200px"
      className={className}
      unoptimized
      onError={() => setUseFallback(true)}
    />
  );
}
