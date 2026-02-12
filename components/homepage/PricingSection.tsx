'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    price: 'Gratuit',
    period: 'pour toujours',
    description: 'Parfait pour découvrir la plateforme',
    features: [
      '5 designs par mois',
      '3 analyses de tendances',
      'Accès au Sourcing Hub',
      'Support par email',
      'Calendrier de contenu',
    ],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    name: 'Créateur',
    price: '34€',
    period: '/mois',
    description: 'Pour les créateurs qui veulent percer',
    features: [
      'Designs illimités',
      '10 analyses IVS par mois',
      'Accès au Radar Elite Outfity',
      'Tech packs automatiques',
      'Génération de contenu IA',
      'Support prioritaire',
    ],
    cta: 'Commencer mon essai',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    period: '',
    description: 'Pour les marques établies',
    features: [
      'Tout du plan Pro',
      'API personnalisée',
      'Gestion multi-marques',
      'Conseiller dédié',
      'Formation personnalisée',
      'Support 24/7',
      'SLAs garantis',
    ],
    cta: 'Nous contacter',
    popular: false,
  },
];

export function PricingSection() {
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

    const element = document.getElementById('pricing-section');
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
    <section
      id="pricing-section"
      className="relative py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Titre */}
        <div
          className={cn(
            'text-center mb-20 transition-all duration-700',
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          )}
        >
          <h2 className="text-5xl lg:text-6xl font-semibold tracking-tight text-[#1D1D1F] mb-4">
            Des offres adaptées à vos besoins
          </h2>
          <p className="text-xl text-[#1D1D1F]/70 max-w-2xl mx-auto">
            Commencez gratuitement, puis évoluez selon votre croissance
          </p>
        </div>

        {/* Grille de plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                'relative bg-white rounded-3xl p-8 shadow-apple',
                'border-2 transition-all duration-500',
                plan.popular
                  ? 'border-[#007AFF] shadow-apple-lg scale-105'
                  : 'border-black/5 hover:shadow-apple-lg hover:scale-[1.02]',
                'animate-stagger',
                isVisible ? 'opacity-100' : 'opacity-0'
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Badge populaire */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-[#007AFF] text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                    Le plus populaire
                  </div>
                </div>
              )}

              {/* Nom et prix */}
              <div className="mb-6">
                <h3 className="text-2xl font-semibold tracking-tight text-[#1D1D1F] mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-[#1D1D1F]">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-lg text-[#1D1D1F]/60">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#1D1D1F]/60 mt-2">
                  {plan.description}
                </p>
              </div>

              {/* Liste de fonctionnalités */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                        plan.popular ? 'bg-[#007AFF]' : 'bg-[#34C759]'
                      )}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-[#1D1D1F]/70">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={plan.name === 'Enterprise' ? '/contact' : '/auth/signup'}>
                <Button
                  className={cn(
                    'w-full h-12 font-semibold transition-all duration-300',
                    plan.popular
                      ? 'bg-[#007AFF] hover:bg-[#0056CC] text-white'
                      : 'bg-black hover:bg-[#1D1D1F] text-white'
                  )}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Note de bas de page */}
        <div className="text-center mt-12">
          <p className="text-sm text-[#1D1D1F]/60">
            Tous les plans incluent un essai gratuit de 14 jours. Annulation à tout moment.
          </p>
        </div>
      </div>
    </section>
  );
}
