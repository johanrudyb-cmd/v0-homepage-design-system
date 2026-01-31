'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, TrendingUp, ShoppingBag, Search, Save, CheckCircle2 } from 'lucide-react';
import { FASHION_STYLES } from '@/lib/constants/fashion-styles';

const COUNTRIES = [
  'France', 'Belgique', 'Suisse', 'Allemagne', 'Espagne', 'Italie', 
  'Royaume-Uni', 'États-Unis', 'Canada', 'Portugal', 'Pays-Bas'
];

const CATEGORIES = [
  'Hoodie', 'T-shirt', 'Sweat', 'Pantalon', 'Cargo', 'Short', 
  'Veste', 'Accessoires', 'Chaussures', 'Sous-vêtements'
];

const STYLES = [...FASHION_STYLES];

const SOURCING_COUNTRIES = [
  'France', 'Portugal', 'Italie', 'Turquie', 'Chine', 
  'Bangladesh', 'Vietnam', 'Inde', 'Maroc', 'Tunisie'
];

interface UserPreferences {
  id: string;
  preferredCountry: string | null;
  preferredCountries: string[];
  preferredCategories: string[];
  preferredStyles: string[];
  priceRangeMin: number | null;
  priceRangeMax: number | null;
  preferredSourcingCountries: string[];
  preferredMOQ: number | null;
  maxLeadTime: number | null;
  preferredMarkets: string[];
  language: string;
  currency: string;
  timezone: string | null;
}

export function PreferencesForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    preferredCountry: 'France',
    preferredCountries: ['France'],
    preferredCategories: [],
    preferredStyles: [],
    priceRangeMin: null,
    priceRangeMax: null,
    preferredSourcingCountries: [],
    preferredMOQ: null,
    maxLeadTime: null,
    preferredMarkets: [],
    language: 'fr',
    currency: 'EUR',
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des préférences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Erreur lors de la sauvegarde des préférences');
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Préférences Géographiques */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <CardTitle>Préférences Géographiques</CardTitle>
          </div>
          <CardDescription>
            Définissez vos pays d'intérêt pour les tendances et analyses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pays principal</label>
            <select
              value={preferences.preferredCountry || ''}
              onChange={(e) => setPreferences({ ...preferences, preferredCountry: e.target.value })}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Sélectionner un pays</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Pays d'intérêt (plusieurs)</label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map(country => (
                <button
                  key={country}
                  type="button"
                  onClick={() => setPreferences({
                    ...preferences,
                    preferredCountries: toggleArrayItem(preferences.preferredCountries || [], country)
                  })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    preferences.preferredCountries?.includes(country)
                      ? 'bg-primary text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Préférences Tendances */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>Préférences Tendances</CardTitle>
          </div>
          <CardDescription>
            Personnalisez les tendances selon vos intérêts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Catégories préférées</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setPreferences({
                    ...preferences,
                    preferredCategories: toggleArrayItem(preferences.preferredCategories || [], category)
                  })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    preferences.preferredCategories?.includes(category)
                      ? 'bg-primary text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Styles préférés</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setPreferences({
                    ...preferences,
                    preferredStyles: toggleArrayItem(preferences.preferredStyles || [], style)
                  })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    preferences.preferredStyles?.includes(style)
                      ? 'bg-primary text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prix minimum (€)</label>
              <Input
                type="number"
                value={preferences.priceRangeMin || ''}
                onChange={(e) => setPreferences({
                  ...preferences,
                  priceRangeMin: e.target.value ? parseFloat(e.target.value) : null
                })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Prix maximum (€)</label>
              <Input
                type="number"
                value={preferences.priceRangeMax || ''}
                onChange={(e) => setPreferences({
                  ...preferences,
                  priceRangeMax: e.target.value ? parseFloat(e.target.value) : null
                })}
                placeholder="1000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Préférences Sourcing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <CardTitle>Préférences Sourcing</CardTitle>
          </div>
          <CardDescription>
            Configurez vos critères pour trouver des usines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pays de sourcing préférés</label>
            <div className="flex flex-wrap gap-2">
              {SOURCING_COUNTRIES.map(country => (
                <button
                  key={country}
                  type="button"
                  onClick={() => setPreferences({
                    ...preferences,
                    preferredSourcingCountries: toggleArrayItem(preferences.preferredSourcingCountries || [], country)
                  })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    preferences.preferredSourcingCountries?.includes(country)
                      ? 'bg-primary text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">MOQ préféré</label>
              <Input
                type="number"
                value={preferences.preferredMOQ || ''}
                onChange={(e) => setPreferences({
                  ...preferences,
                  preferredMOQ: e.target.value ? parseInt(e.target.value) : null
                })}
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Délai maximum (jours)</label>
              <Input
                type="number"
                value={preferences.maxLeadTime || ''}
                onChange={(e) => setPreferences({
                  ...preferences,
                  maxLeadTime: e.target.value ? parseInt(e.target.value) : null
                })}
                placeholder="60"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex items-center justify-between">
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="w-4 h-4" />
            Préférences sauvegardées avec succès
          </div>
        )}
        <Button onClick={handleSave} disabled={saving} className="ml-auto">
          {saving ? 'Sauvegarde...' : 'Enregistrer les préférences'}
        </Button>
      </div>
    </div>
  );
}
