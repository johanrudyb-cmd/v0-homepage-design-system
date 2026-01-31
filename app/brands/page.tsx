import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Filter, TrendingUp, ExternalLink, Search } from 'lucide-react';
import { AnalyzeBrandButton } from '@/components/brands/AnalyzeBrandButton';

// Données de démonstration pour les marques tendances
const trendingBrands = [
  {
    id: '1',
    name: 'Brand A',
    category: 'Streetwear',
    estimatedRevenue: 150000,
    growth: '+45%',
    country: 'France',
    description: 'Marque streetwear française en forte croissance',
    shopifyUrl: 'https://example-brand-a.myshopify.com',
  },
  {
    id: '2',
    name: 'Brand B',
    category: 'Minimaliste',
    estimatedRevenue: 85000,
    growth: '+32%',
    country: 'Belgique',
    description: 'Style minimaliste premium, qualité européenne',
    shopifyUrl: 'https://example-brand-b.myshopify.com',
  },
  {
    id: '3',
    name: 'Brand C',
    category: 'Y2K',
    estimatedRevenue: 120000,
    growth: '+67%',
    country: 'France',
    description: 'Retour du style Y2K, très populaire sur TikTok',
    shopifyUrl: 'https://example-brand-c.myshopify.com',
  },
  {
    id: '4',
    name: 'Brand D',
    category: 'Luxe',
    estimatedRevenue: 250000,
    growth: '+28%',
    country: 'Suisse',
    description: 'Marque luxe avec focus sur la durabilité',
    shopifyUrl: 'https://example-brand-d.myshopify.com',
  },
  {
    id: '5',
    name: 'Brand E',
    category: 'Streetwear',
    estimatedRevenue: 95000,
    growth: '+52%',
    country: 'France',
    description: 'Streetwear urbain, influenceurs actifs',
    shopifyUrl: 'https://example-brand-e.myshopify.com',
  },
  {
    id: '6',
    name: 'Brand F',
    category: 'Minimaliste',
    estimatedRevenue: 110000,
    growth: '+38%',
    country: 'Allemagne',
    description: 'Design épuré, éthique et durable',
    shopifyUrl: 'https://example-brand-f.myshopify.com',
  },
];

function formatRevenue(revenue: number): string {
  if (revenue >= 1000000) return `${(revenue / 1000000).toFixed(1)}M€`;
  if (revenue >= 1000) return `${(revenue / 1000).toFixed(0)}K€`;
  return `${revenue}€`;
}

export default async function BrandsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  const categories = Array.from(new Set(trendingBrands.map((b) => b.category)));
  const countries = Array.from(new Set(trendingBrands.map((b) => b.country)));

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Moderne - Design Jeune */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Filter className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-1">
                Marques
              </h1>
              <p className="text-muted-foreground text-sm">
                Les marques qui montent et qui performent
              </p>
            </div>
          </div>
        </div>

        {/* Filtres Moderne */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="w-5 h-5" />
                <span className="font-semibold text-sm">Filtres</span>
              </div>
              <select className="px-4 py-2.5 border-2 border-input rounded-lg text-sm font-semibold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="all">Toutes catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select className="px-4 py-2.5 border-2 border-input rounded-lg text-sm font-semibold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="all">Tous pays</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <select className="px-4 py-2.5 border-2 border-input rounded-lg text-sm font-semibold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="revenue">Trier par CA</option>
                <option value="growth">Trier par croissance</option>
                <option value="name">Trier par nom</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Grille de marques Moderne */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingBrands.map((brand) => (
            <Card key={brand.id} className="hover:scale-105 hover:border-primary/50 transition-all border-2 cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold mb-1">{brand.name}</CardTitle>
                    <CardDescription className="font-medium">
                      {brand.category} • {brand.country}
                    </CardDescription>
                  </div>
                  <span className="px-2.5 py-1 bg-success/10 text-success rounded-lg text-xs font-bold">
                    {brand.growth}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {brand.description}
                </p>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    CA estimé
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {formatRevenue(brand.estimatedRevenue)}/mois
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <AnalyzeBrandButton shopifyUrl={brand.shopifyUrl} brandName={brand.name} />
                  <a
                    href={brand.shopifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="default" className="w-full shadow-modern">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visiter
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message d'information Moderne */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                <span className="font-bold text-foreground">Note :</span> Ces données sont des estimations basées
                sur l'analyse de trafic et les tendances du marché. Utilisez Brand Spy pour obtenir une
                analyse détaillée de chaque marque.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
