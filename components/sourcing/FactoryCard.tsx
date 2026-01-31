'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequestQuoteModal } from './RequestQuoteModal';
import { FactoryReviews } from './FactoryReviews';
import { MessageSquare, X } from 'lucide-react';

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
  preFilledMessage?: string;
  preFilledSubject?: string;
}

export function FactoryCard({ factory, brandId, isAlreadyQuoted, preFilledMessage, preFilledSubject }: FactoryCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  return (
    <>
      <Card className="hover:border-primary/30 transition-colors">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {factory.name}
                </h3>
                {factory.rating && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-warning/10 border border-warning/20">
                    <span className="text-warning">★</span>
                    <span className="text-sm font-medium text-foreground">
                      {factory.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {factory.country}
              </div>
            </div>

            {/* Infos principales */}
            <div className="space-y-2 text-sm border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">MOQ</span>
                <span className="text-foreground font-medium">
                  {factory.moq} pièces
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Délai</span>
                <span className="text-foreground font-medium">
                  {factory.leadTime} jours
                </span>
              </div>
            </div>

            {/* Spécialités */}
            <div>
              <div className="text-xs text-muted-foreground mb-2 font-medium uppercase">
                Spécialités
              </div>
              <div className="flex flex-wrap gap-2">
                {factory.specialties.slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-primary/10 text-primary rounded font-medium border border-primary/20"
                  >
                    {specialty}
                  </span>
                ))}
                {factory.specialties.length > 3 && (
                  <span className="px-2 py-1 text-xs text-muted-foreground bg-muted rounded border border-border">
                    +{factory.specialties.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Certifications */}
            {factory.certifications.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-medium uppercase">
                  Certifications
                </div>
                <div className="flex flex-wrap gap-2">
                  {factory.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-success/10 text-success rounded font-medium border border-success/20"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-border">
              {isAlreadyQuoted ? (
                <Button
                  disabled
                  className="flex-1 bg-muted text-muted-foreground"
                >
                  Devis envoyé
                </Button>
              ) : (
                <Button
                  onClick={() => setShowModal(true)}
                  className="flex-1"
                >
                  Demander un devis
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowReviews(true)}
                title="Voir les avis"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
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
          preFilledMessage={preFilledMessage}
          preFilledSubject={preFilledSubject}
        />
      )}

      {showReviews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-xl shadow-modern-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">Avis - {factory.name}</h3>
              <button
                onClick={() => setShowReviews(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <FactoryReviews
                factoryId={factory.id}
                factoryName={factory.name}
                currentRating={factory.rating}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
