'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

// Les 4 images de la section Shooting — à placer dans public/fashion/
// Noms attendus : fashion-1.png, fashion-2.png, fashion-3.png, fashion-4.png (ou mettre vos fichiers et adapter les chemins ci-dessous)
const fashionImages = [
  {
    src: '/fashion/hf_20260131_195003_c7ee5196-eb3f-437e-8261-900b196185fb.png',
    alt: 'Shooting mode 1',
    aspect: 'portrait' as const,
    fallback: '👔',
  },
  {
    src: '/fashion/hf_20260202_064558_2c745b26-af10-4bd1-bc72-6c20c20cbae8.png',
    alt: 'Shooting mode 2',
    aspect: 'portrait' as const,
    fallback: '👗',
  },
  {
    src: '/fashion/hf_20260206_221357_069cdbaa-9fae-417b-a95e-bb863d6fe412.png',
    alt: 'Shooting mode 3',
    aspect: 'portrait' as const,
    fallback: '🧥',
  },
  {
    src: '/fashion/hf_20260208_124626_4fe0953f-e187-4e25-beef-257400d22a65.png',
    alt: 'Shooting mode 4',
    aspect: 'landscape' as const,
    fallback: '👟',
  },
];

export function FashionGallery() {
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
      { threshold: 0.1 }
    );

    const element = document.getElementById('fashion-gallery');
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
    <section id="fashion-gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        {/* Titre de section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-[#000000] mb-4">
            Shootings Générés par IA
          </h2>
          <p className="text-xl text-[#6e6e73] font-light max-w-2xl mx-auto">
            Créez des shootings photo professionnels pour votre marque en quelques clics. Notre IA génère des images de mode réalistes pour mettre en valeur vos créations.
          </p>
        </div>

        {/* Grille asymétrique style Bento */}
        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
            'transition-all duration-1000',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          )}
        >
          {/* Image 1 - Grande carte portrait */}
          <div
            className={cn(
              'relative overflow-hidden rounded-[32px] bg-[#F5F5F7]',
              'md:row-span-2',
              'group cursor-pointer',
              'transition-all duration-500 hover:scale-[1.02]'
            )}
          >
            <div className="relative w-full h-full min-h-[500px]">
              <Image
                src={fashionImages[0].src}
                alt={fashionImages[0].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-placeholder')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-placeholder absolute inset-0 flex items-center justify-center text-8xl bg-gradient-to-br from-[#F5F5F7] to-[#E5E5E7]';
                    fallback.textContent = fashionImages[0].fallback;
                    parent.appendChild(fallback);
                  }
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

          {/* Image 2 - Carte moyenne portrait */}
          <div
            className={cn(
              'relative overflow-hidden rounded-[32px] bg-[#F5F5F7]',
              'group cursor-pointer',
              'transition-all duration-500 hover:scale-[1.02]'
            )}
          >
            <div className="relative w-full h-full min-h-[400px]">
              <Image
                src={fashionImages[1].src}
                alt={fashionImages[1].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-placeholder')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-placeholder absolute inset-0 flex items-center justify-center text-7xl bg-gradient-to-br from-[#F5F5F7] to-[#E5E5E7]';
                    fallback.textContent = fashionImages[1].fallback;
                    parent.appendChild(fallback);
                  }
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

          {/* Image 3 - Petite carte portrait */}
          <div
            className={cn(
              'relative overflow-hidden rounded-[32px] bg-[#F5F5F7]',
              'group cursor-pointer',
              'transition-all duration-500 hover:scale-[1.02]'
            )}
          >
            <div className="relative w-full h-full min-h-[300px]">
              <Image
                src={fashionImages[2].src}
                alt={fashionImages[2].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-placeholder')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-placeholder absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-[#F5F5F7] to-[#E5E5E7]';
                    fallback.textContent = fashionImages[2].fallback;
                    parent.appendChild(fallback);
                  }
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

          {/* Image 4 - Grande carte paysage */}
          <div
            className={cn(
              'relative overflow-hidden rounded-[32px] bg-[#F5F5F7]',
              'md:col-span-2',
              'group cursor-pointer',
              'transition-all duration-500 hover:scale-[1.02]'
            )}
          >
            <div className="relative w-full h-full min-h-[400px]">
              <Image
                src={fashionImages[3].src}
                alt={fashionImages[3].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 66vw"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-placeholder')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-placeholder absolute inset-0 flex items-center justify-center text-7xl bg-gradient-to-br from-[#F5F5F7] to-[#E5E5E7]';
                    fallback.textContent = fashionImages[3].fallback;
                    parent.appendChild(fallback);
                  }
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="#pricing-section"
            onClick={(e) => {
              e.preventDefault();
              const element = document.querySelector('#pricing-section');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#000000] text-white rounded-full font-semibold text-lg hover:bg-[#1a1a1a] transition-all duration-200 group"
          >
            Créer mes shootings photo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
