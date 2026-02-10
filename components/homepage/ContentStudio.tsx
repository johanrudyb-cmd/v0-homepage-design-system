'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const contentItems = [
  {
    id: 1,
    type: 'Mannequin',
    image: '👗',
    title: 'Shooting produit',
    description: 'Génération de visuels avec mannequins IA',
  },
  {
    id: 2,
    type: 'Logo',
    image: '🎨',
    title: 'Identité visuelle',
    description: 'Création de logos et chartes graphiques',
  },
  {
    id: 3,
    type: 'Contenu',
    image: '📱',
    title: 'Posts réseaux sociaux',
    description: 'Génération de contenu marketing IA',
  },
  {
    id: 4,
    type: 'Mockup',
    image: '👔',
    title: 'Mockups produits',
    description: 'Visualisation de vos designs',
  },
];

export function ContentStudio() {
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

    const element = document.getElementById('content-studio');
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
    <section id="content-studio" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <div className="mb-16 text-center">
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-[#000000] mb-4">
            Atelier de Contenu
          </h2>
          <p className="text-xl text-[#6e6e73] font-light max-w-2xl mx-auto">
            Créez des visuels professionnels pour votre marque
          </p>
        </div>

        {/* Grille de contenu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contentItems.map((item, index) => (
            <Link
              key={item.id}
              href="/ugc"
              className={cn(
                'group bg-[#F5F5F7] rounded-[32px] p-8 shadow-sm border border-gray-100',
                'transition-all duration-500',
                'hover:scale-[1.02] hover:shadow-md hover:bg-white',
                'animate-stagger',
                isVisible ? 'opacity-100' : 'opacity-0'
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Placeholder d'image */}
              <div className="aspect-square bg-white rounded-2xl mb-6 flex items-center justify-center border border-gray-200 group-hover:border-[#000000] transition-colors">
                <span className="text-6xl">{item.image}</span>
              </div>

              {/* Contenu */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wide">
                    {item.type}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#6e6e73] group-hover:text-[#000000] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[#000000]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#6e6e73] font-light">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/ugc"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#000000] text-white rounded-full text-base font-semibold hover:bg-[#1D1D1F] transition-all duration-200 hover:scale-[1.02]"
          >
            Accéder à l'atelier
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
