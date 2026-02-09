'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Comment fonctionne la génération de tech packs ?',
    answer: 'Vous créez votre design dans le Design Studio (flat sketch, mockup). Le tech pack est généré à partir de votre travail : matériaux, dimensions, spécifications techniques et instructions de production. Le tout est exportable en PDF pour vos fournisseurs.',
  },
  {
    question: 'Comment fonctionne le Sourcing Hub ?',
    answer: 'Notre base de données contient des usines vérifiées dans le monde entier. Vous filtrez par pays, MOQ (quantité minimum), spécialités (t-shirts, hoodies, etc.) et prix. Une fois votre tech pack créé, vous pouvez l\'envoyer directement aux usines sélectionnées pour obtenir des devis. Mettez une étoile sur un fournisseur pour l\'enregistrer parmi ceux avec qui vous travaillez.',
  },
  {
    question: 'Qu\'est-ce que le Mannequin IA et comment ça marche ?',
    answer: 'Vous uploadez une photo de votre produit (ou utilisez un mockup généré). L\'IA génère des visuels avec des mannequins virtuels dans différentes poses. Cela vous permet de créer des images professionnelles pour vos réseaux sociaux sans organiser de shooting photo coûteux.',
  },
  {
    question: 'Le Launch Map est-il obligatoire pour utiliser la plateforme ?',
    answer: 'Non, le Launch Map est un guide optionnel pour les débutants. Vous pouvez accéder directement à chaque outil (Design Studio, Sourcing Hub, UGC Lab, Calculateur de marge, Création de contenu) indépendamment. Le Launch Map vous aide à structurer votre parcours de création de marque.',
  },
  {
    question: 'Puis-je exporter mes tech packs pour les envoyer à mes fournisseurs ?',
    answer: 'Oui, tous les tech packs générés peuvent être exportés en PDF avec les spécifications techniques, les flat sketches et les détails de production. Le format est professionnel et directement utilisable par vos fournisseurs.',
  },
  {
    question: 'Y a-t-il des limites sur le plan gratuit ?',
    answer: 'Le plan gratuit vous donne accès à 3 analyses de tendances par mois et au calculateur de marge. Pour débloquer tous les outils (designs, logos, scripts marketing, shootings photo, sourcing complet, formation), passez au plan Créateur à 34 €/mois.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq-section" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-8">
        {/* Titre */}
        <div className="mb-16 text-center">
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-[#000000] mb-4">
            Questions fréquentes
          </h2>
          <p className="text-xl text-[#6e6e73] font-normal">
            Tout ce que vous devez savoir sur OUTFITY
          </p>
        </div>

        {/* Liste de FAQ */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                'bg-[#F5F5F7] rounded-[32px] border border-[#F2F2F2]',
                'transition-all duration-300',
                openIndex === index && 'bg-white'
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left"
              >
                <span className="text-lg font-bold text-[#000000] pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-[#6e6e73] flex-shrink-0 transition-transform duration-300',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <p className="text-base text-[#6e6e73] font-normal leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
