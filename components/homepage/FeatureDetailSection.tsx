'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Factory,
  TrendingUp,
  Calendar,
  Store,
  FileText,
  Target,
  Megaphone,
} from 'lucide-react';

const detailedFeatures = [
  {
    icon: Sparkles,
    title: 'Design Studio IA',
    description: 'Créez des designs professionnels en quelques clics avec notre IA avancée. Générez des mockups réalistes et des tech packs complets pour vos fournisseurs.',
    benefits: [
      'Génération de designs en quelques secondes',
      'Mockups haute qualité',
      'Tech packs automatiques',
      'Personnalisation illimitée',
    ],
    color: '#007AFF',
    image: '🎨',
  },
  {
    icon: Factory,
    title: 'Sourcing Hub',
    description: 'Trouvez les meilleures usines qualifiées dans le monde entier. Obtenez des devis rapidement et comparez les options pour votre production.',
    benefits: [
      'Base de données d\'usines vérifiées',
      'Devis rapides',
      'Filtres avancés',
      'Avis vérifiés',
    ],
    color: '#34C759',
    image: '🏭',
  },
  {
    icon: TrendingUp,
    title: 'Radar Intelligence',
    description: 'Découvrez les tendances émergentes avant vos concurrents. Notre radar IA analyse le marché en temps réel pour identifier les opportunités.',
    benefits: [
      'Actualisation en temps réel',
      'Détection de pépites virales',
      'Prévisions de cycle de vie',
      'Analyses régionales (EU/US/ASIA)',
    ],
    color: '#FF9500',
    image: '📈',
  },
  {
    icon: Calendar,
    title: 'Calendrier de contenu',
    description: 'Planifiez vos posts marketing et générez du contenu structuré avec l\'IA. Optimisez votre présence sur les réseaux sociaux.',
    benefits: [
      'Génération de posts IA',
      'Planification automatique',
      'Hashtags optimisés',
      'Analytics intégrés',
    ],
    color: '#FF3B30',
    image: '📅',
  },
];

export function FeatureDetailSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

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

    const element = document.getElementById('feature-detail-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const feature = detailedFeatures[activeFeature];
  const Icon = feature.icon;

  return (
    <section
      id="feature-detail-section"
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
            Des fonctionnalités puissantes
          </h2>
          <p className="text-xl text-[#1D1D1F]/70 max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour créer et lancer votre marque
          </p>
        </div>

        {/* Navigation des fonctionnalités */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {detailedFeatures.map((feat, index) => {
            const FeatIcon = feat.icon;
            return (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 rounded-2xl',
                  'transition-all duration-300',
                  'border-2',
                  activeFeature === index
                    ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-apple-lg'
                    : 'bg-white text-[#1D1D1F] border-black/10 hover:border-[#007AFF]/30'
                )}
              >
                <FeatIcon className="w-5 h-5" />
                <span className="font-medium">{feat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Détail de la fonctionnalité active */}
        <div
          className={cn(
            'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center',
            'transition-all duration-500',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Image/Visual */}
          <div
            className={cn(
              'relative aspect-square rounded-3xl',
              'flex items-center justify-center',
              'shadow-apple-lg transition-all duration-500',
              'bg-gradient-to-br from-white to-[#F5F5F7]',
              'border border-black/5'
            )}
            style={{
              background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}05 100%)`,
            }}
          >
            <div className="text-9xl">{feature.image}</div>

            {/* Icône flottante */}
            <div
              className="absolute top-8 right-8 w-16 h-16 rounded-2xl flex items-center justify-center shadow-apple"
              style={{
                backgroundColor: `${feature.color}15`,
              }}
            >
              <Icon
                className="w-8 h-8"
                style={{
                  color: feature.color,
                }}
              />
            </div>
          </div>

          {/* Contenu */}
          <div className="space-y-6">
            <div>
              <h3 className="text-4xl font-semibold tracking-tight text-[#1D1D1F] mb-4">
                {feature.title}
              </h3>
              <p className="text-lg text-[#1D1D1F]/70 leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Liste de bénéfices */}
            <ul className="space-y-4">
              {feature.benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${feature.color}15`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: feature.color,
                      }}
                    />
                  </div>
                  <span className="text-base text-[#1D1D1F]/80">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
