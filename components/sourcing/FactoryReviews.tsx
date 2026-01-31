'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, StarHalf, MessageSquare, Image as ImageIcon, X } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  photos: string[];
  verified: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface FactoryReviewsProps {
  factoryId: string;
  factoryName: string;
  currentRating?: number | null;
}

export function FactoryReviews({ factoryId, factoryName, currentRating }: FactoryReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(currentRating || null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    photos: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [factoryId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/factories/${factoryId}/reviews`);
      const data = await response.json();
      if (response.ok) {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews || 0);
      }
    } catch (error) {
      console.error('Erreur chargement reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (formData.rating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/factories/${factoryId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: formData.rating,
          comment: formData.comment.trim() || null,
          photos: formData.photos,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setFormData({ rating: 0, comment: '', photos: [] });
        setShowForm(false);
        fetchReviews(); // Recharger les reviews
      } else {
        alert(data.error || 'Erreur lors de l\'envoi de l\'avis');
      }
    } catch (error) {
      console.error('Erreur envoi review:', error);
      alert('Erreur lors de l\'envoi de l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
        ))}
        {hasHalfStar && (
          <StarHalf className="w-4 h-4 fill-primary text-primary" />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-muted-foreground" />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground font-medium text-center py-4">
            Chargement des avis...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Avis clients</CardTitle>
            <CardDescription className="font-medium">
              {totalReviews > 0 ? (
                <>
                  {averageRating && (
                    <span className="font-bold text-foreground">
                      {averageRating.toFixed(1)}/5
                    </span>
                  )}{' '}
                  ({totalReviews} avis{totalReviews > 1 ? 's' : ''})
                </>
              ) : (
                'Aucun avis pour le moment'
              )}
            </CardDescription>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} size="sm" className="shadow-modern">
              <MessageSquare className="w-4 h-4 mr-2" />
              Laisser un avis
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulaire d'avis */}
        {showForm && (
          <div className="p-4 bg-muted/30 rounded-lg border-2 border-border space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Votre avis</h4>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ rating: 0, comment: '', photos: [] });
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Note (1-5 étoiles)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Partagez votre expérience avec cette usine..."
                className="w-full px-4 py-3 border-2 border-input rounded-lg bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting || formData.rating === 0}
                className="shadow-modern"
              >
                {submitting ? 'Envoi...' : 'Publier l\'avis'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ rating: 0, comment: '', photos: [] });
                }}
                className="border-2"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Liste des avis */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 border-2 border-border rounded-lg bg-card space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-semibold text-sm text-foreground">
                        {review.user.name || review.user.email.split('@')[0]}
                      </div>
                      {review.verified && (
                        <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-bold rounded">
                          ✓ Vérifié
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-xs text-muted-foreground font-medium">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-foreground font-medium leading-relaxed">
                    {review.comment}
                  </p>
                )}

                {review.photos && review.photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {review.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-border"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <p className="text-sm text-muted-foreground font-medium text-center py-4">
              Soyez le premier à laisser un avis sur cette usine !
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}
