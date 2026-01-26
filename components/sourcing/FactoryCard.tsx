'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequestQuoteModal } from './RequestQuoteModal';

interface Factory {
  id: string;
  name: string;
  country: string;
  moq: number;
  specialties: string[];
  leadTime: number;
  certifications: string[];
  contactEmail: string | null;
  contactPhone: string | null;
  rating: number | null;
}

interface FactoryCardProps {
  factory: Factory;
  brandId: string;
  isAlreadyQuoted: boolean;
}

export function FactoryCard({ factory, brandId, isAlreadyQuoted }: FactoryCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card className="border-stone-200 hover:border-stone-300 transition-colors">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-medium text-stone-900">
                  {factory.name}
                </h3>
                {factory.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-amber-600">★</span>
                    <span className="text-sm text-stone-600">
                      {factory.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-sm text-stone-600 font-light">
                {factory.country}
              </div>
            </div>

            {/* Infos principales */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-light">MOQ</span>
                <span className="text-stone-900 font-medium">
                  {factory.moq} pièces
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-light">Délai</span>
                <span className="text-stone-900 font-medium">
                  {factory.leadTime} jours
                </span>
              </div>
            </div>

            {/* Spécialités */}
            <div>
              <div className="text-xs text-stone-500 mb-2 font-light">
                Spécialités
              </div>
              <div className="flex flex-wrap gap-2">
                {factory.specialties.slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-stone-100 text-stone-700 rounded-full font-light"
                  >
                    {specialty}
                  </span>
                ))}
                {factory.specialties.length > 3 && (
                  <span className="px-2 py-1 text-xs text-stone-500 font-light">
                    +{factory.specialties.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Certifications */}
            {factory.certifications.length > 0 && (
              <div>
                <div className="text-xs text-stone-500 mb-2 font-light">
                  Certifications
                </div>
                <div className="flex flex-wrap gap-2">
                  {factory.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded-full font-light border border-amber-200"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {isAlreadyQuoted ? (
                <Button
                  disabled
                  className="flex-1 bg-stone-100 text-stone-500 font-light tracking-wide uppercase text-xs py-2"
                >
                  Devis envoyé
                </Button>
              ) : (
                <Button
                  onClick={() => setShowModal(true)}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs py-2"
                >
                  Demander un devis
                </Button>
              )}
              {factory.contactEmail && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${factory.contactEmail}`)}
                  className="border-stone-300 text-stone-700 font-light tracking-wide uppercase text-xs py-2 px-4"
                >
                  Contacter
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <RequestQuoteModal
          factory={factory}
          brandId={brandId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
