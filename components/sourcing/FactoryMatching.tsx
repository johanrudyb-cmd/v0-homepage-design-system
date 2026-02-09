'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, Factory } from 'lucide-react';
import { FactoryCard } from './FactoryCard';

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
  website?: string | null;
  rating: number | null;
}

interface FactoryMatchingProps {
  brandId: string;
  sentQuotes: any[];
}

export function FactoryMatching({ brandId, sentQuotes }: FactoryMatchingProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matchedFactories, setMatchedFactories] = useState<Factory[]>([]);
  const [formData, setFormData] = useState({
    productType: '',
    quantity: '',
    budget: '',
    preferredCountry: '',
    specialties: '',
  });

  const handleMatch = async () => {
    if (!formData.productType.trim()) {
      alert('Veuillez spécifier le type de produit');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/factories/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: formData.productType.trim(),
          quantity: formData.quantity ? parseInt(formData.quantity) : null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          preferredCountry: formData.preferredCountry.trim() || null,
          specialties: formData.specialties
            ? formData.specialties.split(',').map((s) => s.trim())
            : [],
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMatchedFactories(data.factories || []);
        setShowForm(false);
      } else {
        alert(data.error || 'Erreur lors du matching');
      }
    } catch (error) {
      console.error('Erreur matching:', error);
      alert('Erreur lors du matching');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* CTA Matching */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-xl text-foreground">
                  Trouvez l'usine idéale avec l'IA
                </h3>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Décrivez votre projet et l'IA vous suggère les meilleures usines
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="shadow-modern-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Lancer le matching IA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire matching */}
      {showForm && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Matching IA</CardTitle>
            <CardDescription className="font-medium">
              Décrivez votre projet pour trouver l'usine idéale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Type de produit *
              </label>
              <Input
                type="text"
                value={formData.productType}
                onChange={(e) =>
                  setFormData({ ...formData, productType: e.target.value })
                }
                placeholder="Ex: T-shirt, Hoodie, Pantalon..."
                className="border-2"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Quantité (MOQ)
                </label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="Ex: 500"
                  className="border-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Budget estimé (€)
                </label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  placeholder="Ex: 10000"
                  className="border-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Pays préféré
              </label>
              <select
                value={formData.preferredCountry}
                onChange={(e) =>
                  setFormData({ ...formData, preferredCountry: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-input rounded-lg bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">Aucune préférence</option>
                <option value="France">France</option>
                <option value="Portugal">Portugal</option>
                <option value="Turquie">Turquie</option>
                <option value="Chine">Chine</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Inde">Inde</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Spécialités (séparées par des virgules)
              </label>
              <Input
                type="text"
                value={formData.specialties}
                onChange={(e) =>
                  setFormData({ ...formData, specialties: e.target.value })
                }
                placeholder="Ex: Jersey, Denim, Coton"
                className="border-2"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleMatch}
                disabled={loading || !formData.productType.trim()}
                className="shadow-modern-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Trouver les usines
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    productType: '',
                    quantity: '',
                    budget: '',
                    preferredCountry: '',
                    specialties: '',
                  });
                  setMatchedFactories([]);
                }}
                className="border-2"
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats matching */}
      {matchedFactories.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl font-bold">
                Usines recommandées par l'IA
              </CardTitle>
            </div>
            <CardDescription className="font-medium">
              {matchedFactories.length} usine{matchedFactories.length > 1 ? 's' : ''} correspondant à vos critères
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {matchedFactories.map((factory, index) => {
                return (
                  <div key={factory.id} className="relative">
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 z-10 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-modern">
                        ⭐ Meilleur match
                      </div>
                    )}
                    <FactoryCard factory={factory} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
