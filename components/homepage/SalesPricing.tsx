'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const plans = [
    {
      name: 'Gratuit',
      price: 0,
      period: 'Gratuit',
      description: 'Parfait pour tester la plateforme et créer vos premiers designs',
      features: [
        '3 analyses de tendances par mois',
        'Calculateur de marge',
      ],
      cta: 'Commencer gratuitement',
      ctaStyle: 'border',
      popular: false,
    },
    {
      name: 'Créateur',
      price: 34,
      period: '/mois',
      description: 'Tout ce dont vous avez besoin pour créer et lancer votre marque',
      features: [
        'Accès à l\'intégralité des fonctionnalités de l\'app',
        '10 analyses de tendances par mois',
        '10 stratégies de marque par mois',
        'Générateur de logo',
        'Packs de mockup',
        'Génération de tech pack',
        '10 lots de scripts marketing IA (5 scripts/lot)',
        '5 shootings photo par mois',
        '1 shooting produit par mois (4 images)',
        'Sourcing Hub complet (envoi de devis)',
        'Formation',
        'Support prioritaire',
      ],
      cta: 'S\'abonner',
      ctaStyle: 'solid',
      popular: true,
    },
];

export function SalesPricing() {
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
    <section id="pricing-section" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <div className="mb-16 text-center">
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-[#000000] mb-4">
            Choisissez votre plan
          </h2>
          <p className="text-xl text-[#6e6e73] font-normal max-w-2xl mx-auto">
            Commencez gratuitement, puis évoluez selon votre croissance
          </p>
        </div>

        {/* Grille de plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                'relative bg-white rounded-[32px] p-10 border',
                plan.popular
                  ? 'border-[#000000]'
                  : 'border-[#F2F2F2]',
                'transition-all duration-500',
                'hover:scale-[1.01]',
                'animate-stagger',
                isVisible ? 'opacity-100' : 'opacity-0'
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Badge populaire discret */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-[#000000] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Plus Populaire
                  </div>
                </div>
              )}

              {/* Nom et prix */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-[#000000] mb-4">
                  {plan.name}
                </h3>
                {plan.price !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-[#000000]">
                      {plan.price}€
                    </span>
                    <span className="text-lg text-[#6e6e73] font-normal">
                      {plan.period}
                    </span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-[#000000]">
                    {plan.period}
                  </div>
                )}
                <p className="text-sm text-[#6e6e73] font-normal mt-3">
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
                    <div className="w-5 h-5 rounded-full bg-[#000000] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-[#6e6e73] font-normal">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/auth/signup"
                className={cn(
                  'block w-full text-center py-4 rounded-xl text-base font-semibold transition-all duration-200',
                  plan.ctaStyle === 'solid'
                    ? 'bg-[#000000] text-white hover:bg-[#1D1D1F]'
                    : 'bg-white text-[#000000] border-2 border-[#F2F2F2] hover:border-[#000000]'
                )}
              >
                {plan.cta}
              </Link>
              
              {/* Note pour plan gratuit */}
              {plan.price === 0 && (
                <p className="text-xs text-[#6e6e73] font-normal text-center mt-3">
                  Sans carte bancaire
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Note de bas de page */}
        <div className="text-center mt-12">
          <p className="text-sm text-[#6e6e73] font-normal">
            Abonnement annulable à tout moment.
          </p>
        </div>
      </div>
    </section>
  );
}
