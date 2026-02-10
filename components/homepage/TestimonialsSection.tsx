'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sophie',
    role: 'Fondatrice de Mode Éthique',
    rating: 5,
    text: 'OUTFITY a transformé ma façon de créer ma marque. En quelques semaines, j\'ai pu lancer ma collection complète avec des designs professionnels et trouver les meilleurs fournisseurs.',
  },
  {
    name: 'Lucas',
    role: 'Créateur de streetwear',
    rating: 5,
    text: 'La génération de logo par IA est incroyable. J\'ai obtenu 4 propositions parfaites en quelques minutes et j\'ai pu choisir celui qui correspondait le mieux à mon identité.',
  },
  {
    name: 'Emma',
    role: 'Designer indépendante',
    rating: 5,
    text: 'Le calendrier de contenu et la génération de posts IA m\'ont permis de me concentrer sur le design. Ma présence sur les réseaux sociaux a explosé !',
  },
  {
    name: 'Thomas',
    role: 'Entrepreneur mode',
    rating: 5,
    text: 'La base de données de fournisseurs est une mine d\'or. J\'ai trouvé des usines au Portugal qui correspondent parfaitement à mes besoins en quelques minutes.',
  },
  {
    name: 'Camille',
    role: 'Créatrice de mode durable',
    rating: 5,
    text: 'L\'analyse des tendances m\'aide à anticiper ce qui va marcher. J\'ai lancé un produit qui est devenu best-seller grâce aux insights de la plateforme.',
  },
  {
    name: 'Alexandre',
    role: 'Fondateur de marque premium',
    rating: 5,
    text: 'Le Launch Map m\'a guidé étape par étape. De l\'identité de marque au lancement Shopify, tout est pensé pour réussir. Un outil indispensable !',
  },
];

export function TestimonialsSection() {
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

    const element = document.getElementById('testimonials-section');
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
    <section id="testimonials-section" className="py-20 bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <div className="mb-16 text-center">
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-[#000000] mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-xl text-[#6e6e73] font-normal max-w-2xl mx-auto">
            Découvrez ce que nos utilisateurs disent d'OUTFITY
          </p>
        </div>

        {/* Grille de témoignages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={cn(
                'bg-white rounded-[32px] p-8 border border-[#F2F2F2]',
                'transition-all duration-500',
                'hover:scale-[1.02]',
                'animate-stagger',
                isVisible ? 'opacity-100' : 'opacity-0'
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Note */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-[#000000] text-[#000000]"
                  />
                ))}
              </div>

              {/* Témoignage */}
              <p className="text-base text-[#6e6e73] font-normal leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Auteur */}
              <div>
                <p className="font-bold text-[#000000]">
                  {testimonial.name}
                </p>
                <p className="text-sm text-[#6e6e73] font-normal">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
