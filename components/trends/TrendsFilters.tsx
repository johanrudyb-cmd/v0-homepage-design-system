'use client';

import { Card, CardContent } from '@/components/ui/card';

interface Filters {
  category: string;
  style: string;
  material: string;
  sortBy: string;
}

interface TrendsFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function TrendsFilters({ filters, onFiltersChange }: TrendsFiltersProps) {
  const categories = ['', 'Hoodie', 'T-shirt', 'Cargo', 'Accessoires'];
  const styles = ['', 'Minimaliste', 'Streetwear', 'Luxe', 'Y2K'];
  const materials = ['', 'Coton GSM élevé', 'Denim', 'Synthétique'];
  const sortOptions = [
    { value: 'saturability', label: 'Moins saturé (meilleur)' },
    { value: 'trendScore', label: 'Plus tendance' },
    { value: 'price', label: 'Prix croissant' },
  ];

  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="border-stone-200">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Catégorie */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-2 uppercase tracking-wide">
              Catégorie
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat || 'Toutes'}
                </option>
              ))}
            </select>
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-2 uppercase tracking-wide">
              Style
            </label>
            <select
              value={filters.style}
              onChange={(e) => updateFilter('style', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {styles.map((style) => (
                <option key={style} value={style}>
                  {style || 'Tous'}
                </option>
              ))}
            </select>
          </div>

          {/* Matière */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-2 uppercase tracking-wide">
              Matière
            </label>
            <select
              value={filters.material}
              onChange={(e) => updateFilter('material', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {materials.map((mat) => (
                <option key={mat} value={mat}>
                  {mat || 'Toutes'}
                </option>
              ))}
            </select>
          </div>

          {/* Tri */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-2 uppercase tracking-wide">
              Trier par
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
