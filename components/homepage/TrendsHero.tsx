'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const brands = [
  { name: 'NIKE', domain: 'nike.com' },
  { name: 'ADIDAS', domain: 'adidas.com' },
  { name: 'ZARA', domain: 'zara.com' },
  { name: 'H&M', domain: 'hm.com' },
  { name: 'UNIQLO', domain: 'uniqlo.com' },
  { name: 'PUMA', domain: 'puma.com' },
  { name: 'THE NORTH FACE', domain: 'thenorthface.com' },
  { name: 'NEW BALANCE', domain: 'newbalance.com' },
  { name: 'LEVI\'S', domain: 'levi.com' },
  { name: 'GUCCI', domain: 'gucci.com' },
  { name: 'PRADA', domain: 'prada.com' },
  { name: 'DIOR', domain: 'dior.com' },
  { name: 'LOUIS VUITTON', domain: 'louisvuitton.com' },
  { name: 'SUPREME', domain: 'supremenewyork.com' },
  { name: 'CARHARTT', domain: 'carhartt.com' },
  { name: 'BURBERRY', domain: 'burberry.com' },
  { name: 'VERSACE', domain: 'versace.com' },
  { name: 'LACOSTE', domain: 'lacoste.com' },
];

export function TrendsHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'text-center space-y-6 sm:space-y-8 transition-all duration-1000',
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          )}
        >
          {/* Titre principal */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#000000] mb-4 sm:mb-6 px-2">
              Propulsez votre marque avec Outfity Intelligence
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-[#6e6e73] font-light max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              Validez vos designs avec notre algorithme de corrélation sociale. Mêmes signaux. Mêmes usines. Mêmes succès commerciaux.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-[#000000] text-white rounded-full text-base sm:text-lg font-semibold hover:bg-[#1a1a1a] transition-all duration-200 group shadow-lg"
              >
                Découvrir les tendances
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Bandeau défilant avec logos de marques — Style Premium Apple */}
          <div className="relative mt-16 sm:mt-24 lg:mt-32">
            <div className="mask-marquee relative overflow-hidden py-8 select-none">
              <div className="flex w-max animate-marquee-infinite">
                {/* On duplique 2 fois pour un loop infini parfait avec translateX(-50%) */}
                {[0, 1].map((i) => (
                  <div key={i} className="flex items-center gap-8 sm:gap-16 px-4 sm:px-8">
                    {brands.map((brand, index) => (
                      <div
                        key={`${i}-${index}`}
                        className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110 opacity-40 hover:opacity-100"
                      >
                        <img
                          src={`https://logo.clearbit.com/${brand.domain}`}
                          alt={brand.name}
                          className="h-6 sm:h-8 md:h-10 w-auto object-contain"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Texte décoratif ou indicateur sous le slider — Traduit en français */}
            <div className="flex justify-center mt-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6e6e73]/40 text-center px-4">
                Outfity Intelligence • Social Velocity Index • Mass-Market Correlation 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
