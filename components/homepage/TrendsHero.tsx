'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const brands = [
  { name: 'NIKE', logo: '/images/brand-logos/nike.png', scale: 1.6 },
  { name: 'ADIDAS', logo: '/images/brand-logos/Adidas.png', scale: 2.6 },
  { name: 'ZARA', logo: '/images/brand-logos/zara.PNG', scale: 2.6 },
  { name: 'H&M', logo: '/images/brand-logos/H&M.png', scale: 2.0 },
  { name: 'UNIQLO', logo: '/images/brand-logos/uniqlo.png', scale: 3.2 },
  { name: 'MANGO', logo: '/images/brand-logos/mango.png', scale: 1.1 },
  { name: 'CORTEIZ', logo: '/images/brand-logos/corteiz.png', scale: 3.2 },
  { name: 'TRAPSTAR', logo: '/images/brand-logos/trapstar.png', scale: 4.2 },
  { name: 'STONE ISLAND', logo: '/images/brand-logos/Stone Island.png', scale: 3.2 },
  { name: 'CARHARTT', logo: '/images/brand-logos/Carhartt.png', scale: 1.1 },
  { name: 'JACQUEMUS', logo: '/images/brand-logos/jacquemus.png', scale: 1.1 },
  { name: 'MASSIMO DUTTI', logo: '/images/brand-logos/Massimo Dutti.png', scale: 0.9 },
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
              Créez votre marque de vêtement avec les données des géants
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-[#6e6e73] font-light max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              Validez vos designs avec les tendances virales de TikTok et Instagram. Mêmes signaux. Mêmes usines. Mêmes succès commerciaux.
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
                  <div key={i} className="flex items-center gap-24 sm:gap-48 px-12 sm:px-24">
                    {brands.map((brand, index) => (
                      <div
                        key={`${i}-${index}`}
                        className="flex-shrink-0 transition-all duration-500 hover:scale-110 opacity-40 hover:opacity-100"
                      >
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-6 sm:h-8 md:h-10 w-auto object-contain grayscale mix-blend-multiply contrast-[1.1] brightness-[1.05]"
                          style={{ transform: `scale(${brand.scale || 1})` }}
                          loading="lazy"
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
