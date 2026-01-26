'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FactoryCard } from './FactoryCard';
import { QuoteList } from './QuoteList';

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

interface Quote {
  id: string;
  factoryId: string;
  status: string;
  factory: Factory;
  createdAt: Date;
}

interface SourcingHubProps {
  brandId: string;
  sentQuotes: Quote[];
}

export function SourcingHub({ brandId, sentQuotes }: SourcingHubProps) {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [filteredFactories, setFilteredFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: '',
    moqMax: '',
    specialty: '',
    leadTimeMax: '',
    search: '',
  });

  useEffect(() => {
    fetchFactories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, factories]);

  const fetchFactories = async () => {
    try {
      const response = await fetch('/api/factories');
      const data = await response.json();
      setFactories(data.factories || []);
      setFilteredFactories(data.factories || []);
    } catch (error) {
      console.error('Erreur lors du chargement des usines:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...factories];

    if (filters.country) {
      filtered = filtered.filter((f) => f.country === filters.country);
    }

    if (filters.moqMax) {
      const moqMax = parseInt(filters.moqMax);
      filtered = filtered.filter((f) => f.moq <= moqMax);
    }

    if (filters.specialty) {
      filtered = filtered.filter((f) =>
        f.specialties.some((s) =>
          s.toLowerCase().includes(filters.specialty.toLowerCase())
        )
      );
    }

    if (filters.leadTimeMax) {
      const leadTimeMax = parseInt(filters.leadTimeMax);
      filtered = filtered.filter((f) => f.leadTime <= leadTimeMax);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(searchLower) ||
          f.country.toLowerCase().includes(searchLower)
      );
    }

    setFilteredFactories(filtered);
  };

  const countries = Array.from(new Set(factories.map((f) => f.country))).sort();
  const allSpecialties = Array.from(
    new Set(factories.flatMap((f) => f.specialties))
  ).sort();

  return (
    <div className="space-y-8">
      {/* Filtres */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Recherche
              </label>
              <Input
                type="text"
                placeholder="Nom, pays..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Pays
              </label>
              <select
                value={filters.country}
                onChange={(e) =>
                  setFilters({ ...filters, country: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-input rounded-lg bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">Tous les pays</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                MOQ max
              </label>
              <Input
                type="number"
                placeholder="Ex: 100"
                value={filters.moqMax}
                onChange={(e) =>
                  setFilters({ ...filters, moqMax: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Spécialité
              </label>
              <select
                value={filters.specialty}
                onChange={(e) =>
                  setFilters({ ...filters, specialty: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-input rounded-lg bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">Toutes les spécialités</option>
                {allSpecialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Délai max (jours)
              </label>
              <Input
                type="number"
                placeholder="Ex: 30"
                value={filters.leadTimeMax}
                onChange={(e) =>
                  setFilters({ ...filters, leadTimeMax: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des usines */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {filteredFactories.length} usine{filteredFactories.length > 1 ? 's' : ''} trouvée{filteredFactories.length > 1 ? 's' : ''}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground font-medium">
            Chargement des usines...
          </div>
        ) : filteredFactories.length === 0 ? (
          <Card className="border-2">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground font-medium py-8">
                Aucune usine ne correspond à vos critères
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFactories.map((factory) => (
              <FactoryCard
                key={factory.id}
                factory={factory}
                brandId={brandId}
                isAlreadyQuoted={sentQuotes.some((q) => q.factoryId === factory.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Devis envoyés */}
      {sentQuotes.length > 0 && (
        <QuoteList quotes={sentQuotes} />
      )}
    </div>
  );
}
