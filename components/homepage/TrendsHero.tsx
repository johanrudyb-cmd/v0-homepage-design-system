'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const brands = [
  { name: 'NIKE', logo: 'https://cdn.simpleicons.org/nike/000000', domain: 'nike.com' },
  { name: 'ADIDAS', logo: 'https://cdn.simpleicons.org/adidas/000000', domain: 'adidas.com' },
  { name: 'ZARA', logo: 'https://cdn.simpleicons.org/zara/000000', domain: 'zara.com' },
  { name: 'H&M', logo: 'https://cdn.simpleicons.org/handm/000000', domain: 'hm.com' },
  { name: 'UNIQLO', logo: 'https://cdn.simpleicons.org/uniqlo/000000', domain: 'uniqlo.com' },
  { name: 'PUMA', logo: 'https://cdn.simpleicons.org/puma/000000', domain: 'puma.com' },
  { name: 'THE NORTH FACE', logo: 'https://cdn.simpleicons.org/thenorthface/000000', domain: 'thenorthface.com' },
  { name: 'NEW BALANCE', logo: 'https://cdn.simpleicons.org/newbalance/000000', domain: 'newbalance.com' },
  { name: 'ASOS', logo: 'https://logo.clearbit.com/asos.com', domain: 'asos.com' },
  { name: 'LEVI\'S', logo: 'https://logo.clearbit.com/levi.com', domain: 'levi.com' },
  { name: 'MANGO', logo: 'https://logo.clearbit.com/mango.com', domain: 'mango.com' },
  { name: 'BERSHKA', logo: 'https://logo.clearbit.com/bershka.com', domain: 'bershka.com' },
  { name: 'PULL&BEAR', logo: 'https://logo.clearbit.com/pullandbear.com', domain: 'pullandbear.com' },
  { name: 'CONVERSE', logo: 'https://logo.clearbit.com/converse.com', domain: 'converse.com' },
  { name: 'VANS', logo: 'https://logo.clearbit.com/vans.com', domain: 'vans.com' },
  { name: 'SUPREME', logo: 'https://logo.clearbit.com/supremenewyork.com', domain: 'supremenewyork.com' },
  { name: 'CARHARTT', logo: 'https://logo.clearbit.com/carhartt.com', domain: 'carhartt.com' },
  { name: 'ARC\'TERYX', logo: 'https://logo.clearbit.com/arcteryx.com', domain: 'arcteryx.com' },
  { name: 'STONE ISLAND', logo: 'https://logo.clearbit.com/stoneisland.com', domain: 'stoneisland.com' },
  { name: 'SALOMON', logo: 'https://logo.clearbit.com/salomon.com', domain: 'salomon.com' },
  { name: 'PATAGONIA', logo: 'https://logo.clearbit.com/patagonia.com', domain: 'patagonia.com' },
  { name: 'RALPH LAUREN', logo: 'https://logo.clearbit.com/ralphlauren.com', domain: 'ralphlauren.com' },
  { name: 'TOMMY HILFIGER', logo: 'https://logo.clearbit.com/tommy.com', domain: 'tommy.com' },
  { name: 'CALVIN KLEIN', logo: 'https://logo.clearbit.com/calvinklein.com', domain: 'calvinklein.com' },
  { name: 'CHAMPION', logo: 'https://logo.clearbit.com/champion.com', domain: 'champion.com' },
  { name: 'DICKIES', logo: 'https://logo.clearbit.com/dickies.com', domain: 'dickies.com' },
];

export function TrendsHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-24">
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
              Donnez à votre marque indépendante la puissance des leaders mondiaux. Mêmes données. Mêmes usines. Mêmes stratégies.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-[#000000] text-white rounded-full text-base sm:text-lg font-semibold hover:bg-[#1a1a1a] transition-all duration-200 group"
              >
                Découvrir les tendances
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Bandeau défilant avec logos de marques — Style Premium Apple */}
          <div className="relative mt-16 sm:mt-24 lg:mt-32">
            {/* Dégradé de fondu sur les côtés via mask-marquee (défini dans globals.css) */}
            <div className="mask-marquee relative overflow-hidden py-12">
              <div className="flex w-fit items-center gap-12 sm:gap-20 animate-marquee-infinite hover:[animation-play-state:paused]">
                {/* Première série de marques */}
                <div className="flex shrink-0 items-center gap-12 sm:gap-20">
                  {brands.map((brand, index) => (
                    <div
                      key={`first-${index}`}
                      className="group relative flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110"
                    >
                      <div className="relative h-12 sm:h-16 w-32 sm:w-48 flex items-center justify-center">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="object-contain max-h-full max-w-full"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const container = target.closest('.group');
                            if (container) (container as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Duplication pour effet infini parfait */}
                <div className="flex shrink-0 items-center gap-12 sm:gap-20">
                  {brands.map((brand, index) => (
                    <div
                      key={`second-${index}`}
                      className="group relative flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110"
                    >
                      <div className="relative h-12 sm:h-16 w-32 sm:w-48 flex items-center justify-center">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="object-contain max-h-full max-w-full"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const container = target.closest('.group');
                            if (container) (container as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Texte décoratif ou indicateur sous le slider — Traduit en français */}
            <div className="flex justify-center mt-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6e6e73]/40 text-center px-4">
                Collection Basée sur les Données • Stratégie 2026 • Tendances Mondiales
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
