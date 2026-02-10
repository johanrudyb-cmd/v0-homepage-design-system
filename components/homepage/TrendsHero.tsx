'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const brands = [
  {
    name: 'ZARA',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Zara_logo_1980.svg',
    fallback: 'ZARA'
  },
  {
    name: 'NIKE',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    fallback: 'NIKE'
  },
  {
    name: 'ASOS',
    logo: 'https://www.google.com/s2/favicons?domain=asos.com&sz=256',
    fallback: 'ASOS'
  },
  {
    name: 'ADIDAS',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
    fallback: 'ADIDAS'
  },
  {
    name: 'H&M',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg',
    fallback: 'H&M'
  },
  {
    name: "LEVI'S",
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Levi%27s_logo.svg/256px-Levi%27s_logo.svg.png',
    fallback: "LEVI'S"
  },
  {
    name: 'MANGO',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Logo_of_Mango_%28new%29.svg',
    fallback: 'MANGO'
  },
  {
    name: 'BERSHKA',
    logo: 'https://www.google.com/s2/favicons?domain=bershka.com&sz=256',
    fallback: 'BERSHKA'
  },
  {
    name: 'THE NORTH FACE',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/The_North_Face_logo.svg/256px-The_North_Face_logo.svg.png',
    fallback: 'THE NORTH FACE'
  },
  {
    name: 'JACQUEMUS',
    logo: 'https://www.google.com/s2/favicons?domain=jacquemus.com&sz=256',
    fallback: 'JACQUEMUS'
  },
  {
    name: 'RALPH LAUREN',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Ralph_Lauren_logo.svg/256px-Ralph_Lauren_logo.svg.png',
    fallback: 'RALPH LAUREN'
  },
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
              Créez votre marque avec les données des géants
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-[#6e6e73] font-light max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              Donnez à votre marque indépendante la puissance des leaders mondiaux. Mêmes données. Mêmes usines. Mêmes stratégies.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-[#000000] text-white rounded-full text-base sm:text-lg font-semibold hover:bg-[#1a1a1a] transition-all duration-200 group"
            >
              Découvrir les tendances
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Bandeau défilant avec logos de marques en couleur */}
          <div className="relative overflow-hidden mt-10 sm:mt-14 lg:mt-16 py-6 sm:py-8">
            <div className="flex items-center whitespace-nowrap animate-marquee-slow">
              {/* Première série */}
              {brands.map((brand, index) => (
                <div
                  key={`first-${index}`}
                  className="inline-flex items-center justify-center shrink-0 px-2 sm:px-4"
                >
                  <div className="relative h-16 sm:h-20 lg:h-14 min-w-[100px] sm:min-w-[140px] max-w-[140px] sm:max-w-[180px] flex items-center justify-center">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={180}
                      height={80}
                      className="object-contain h-16 sm:h-20 lg:h-14 w-auto max-w-[140px] sm:max-w-[180px]"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-text')) {
                          const fallback = document.createElement('span');
                          fallback.className = 'fallback-text text-sm font-bold text-[#000000] uppercase tracking-tight whitespace-nowrap';
                          fallback.textContent = brand.fallback || brand.name;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    {/* Fallback texte si l'image ne charge pas */}
                    <span className="fallback-text-hidden absolute text-sm font-bold text-[#000000] uppercase tracking-tight opacity-0 pointer-events-none whitespace-nowrap">
                      {brand.fallback || brand.name}
                    </span>
                  </div>
                  <span className="mx-2 sm:mx-4 text-[#6e6e73] text-base font-bold select-none shrink-0">•</span>
                </div>
              ))}
              {/* Duplication pour effet infini */}
              {brands.map((brand, index) => (
                <div
                  key={`second-${index}`}
                  className="inline-flex items-center justify-center shrink-0 px-2 sm:px-4"
                >
                  <div className="relative h-16 sm:h-20 lg:h-14 min-w-[100px] sm:min-w-[140px] max-w-[140px] sm:max-w-[180px] flex items-center justify-center">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={180}
                      height={80}
                      className="object-contain h-16 sm:h-20 lg:h-14 w-auto max-w-[140px] sm:max-w-[180px]"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-text')) {
                          const fallback = document.createElement('span');
                          fallback.className = 'fallback-text text-sm font-bold text-[#000000] uppercase tracking-tight whitespace-nowrap';
                          fallback.textContent = brand.fallback || brand.name;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    {/* Fallback texte si l'image ne charge pas */}
                    <span className="fallback-text-hidden absolute text-sm font-bold text-[#000000] uppercase tracking-tight opacity-0 pointer-events-none whitespace-nowrap">
                      {brand.fallback || brand.name}
                    </span>
                  </div>
                  <span className="mx-2 sm:mx-4 text-[#6e6e73] text-base font-bold select-none shrink-0">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
