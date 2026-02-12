'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, Image, FileText, Palette, Calculator, Camera } from 'lucide-react';

export function CreativeGrid() {
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

    const element = document.getElementById('creative-grid');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const creativeItems = [
    {
      title: 'Création de logo par IA',
      description: 'Générez 4 propositions de logo personnalisées avec l\'IA. Choisissez celui qui correspond le mieux à votre marque et téléchargez-le en version transparente.',
      icon: Palette,
      href: '#pricing-section',
      isFree: false,
      color: 'bg-[#007AFF]/10',
      iconColor: 'text-[#007AFF]',
    },
    {
      title: 'Mannequin IA',
      description: 'Créez un mannequin IA personnalisé pour votre marque. Uploadez vos produits et générez des visuels professionnels sans shooting photo.',
      icon: Image,
      href: '#pricing-section',
      isFree: false,
      color: 'bg-[#34C759]/10',
      iconColor: 'text-[#34C759]',
    },
    {
      title: 'Scripts Marketing IA',
      description: 'Générez des posts structurés pour Instagram et TikTok. Accroche, corps du texte, CTA et hashtags optimisés générés automatiquement.',
      icon: FileText,
      href: '#pricing-section',
      isFree: false,
      color: 'bg-[#FF9500]/10',
      iconColor: 'text-[#FF9500]',
    },
    {
      title: 'Scanner visuel IA',
      description: 'Uploadez une photo de vêtement et obtenez instantanément son potentiel de vente, son style et les produits similaires du marché.',
      icon: Camera,
      href: '/trends/visual',
      isFree: false,
      color: 'bg-[#5856D6]/10',
      iconColor: 'text-[#5856D6]',
    },
  ];

  return (
    <section id="creative-grid" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-[#000000] mb-4">
            Outils de création IA
          </h2>
          <p className="text-xl text-[#6e6e73] font-light max-w-2xl mx-auto">
            Créez vos designs, visuels marketing et contenus avec l'intelligence artificielle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Cartes créatives - mieux mises en avant */}
          {creativeItems.map((item, index) => {
            const IconComponent = item.icon;
            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (!item.isFree && item.href.startsWith('#')) {
                e.preventDefault();
                const element = document.querySelector(item.href);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }
            };
            return (
              <Link
                key={index}
                href={item.href}
                onClick={handleClick}
                className={cn(
                  'group bg-white rounded-[32px] p-8 border border-[#F2F2F2] shadow-sm',
                  'transition-all duration-500',
                  'hover:shadow-lg hover:scale-[1.01]',
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6', item.color)}>
                  <IconComponent className={cn('w-7 h-7', item.iconColor)} />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[#000000] mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-[#6e6e73] font-normal mb-6 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#007AFF] group-hover:underline">
                  Découvrir
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
