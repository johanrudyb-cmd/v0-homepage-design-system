'use client';

import { useEffect, useState } from 'react';
import { FashionItem } from './FashionItem';
import { cn } from '@/lib/utils';

export function FashionShowcase() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('fashion-showcase');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div
      id="fashion-showcase"
      className={cn(
        'relative py-24 overflow-hidden',
        'bg-gradient-to-b from-[#F5F5F7] to-white'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Titre */}
        <div
          className={cn(
            'text-center mb-16 transition-all duration-700',
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          )}
        >
          <h2 className="text-5xl lg:text-6xl font-semibold tracking-tight text-[#1D1D1F] mb-4">
            Créez votre collection
          </h2>
          <p className="text-xl text-[#1D1D1F]/70 max-w-2xl mx-auto">
            Design, production, marketing — Tout automatisé avec l'IA
          </p>
        </div>

        {/* Grille de produits animés */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <FashionItem type="tshirt" delay={100} />
          <FashionItem type="hoodie" delay={200} />
          <FashionItem type="jacket" delay={300} />
          <FashionItem type="pants" delay={400} />
        </div>

        {/* Lignes décoratives animées */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={cn(
              'absolute top-1/4 left-0 w-full h-px bg-gradient-to-r',
              'from-transparent via-[#007AFF]/20 to-transparent',
              'transition-all duration-1000',
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
            )}
          />
          <div
            className={cn(
              'absolute bottom-1/4 right-0 w-full h-px bg-gradient-to-l',
              'from-transparent via-[#007AFF]/20 to-transparent',
              'transition-all duration-1000 delay-300',
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            )}
          />
        </div>
      </div>
    </div>
  );
}
