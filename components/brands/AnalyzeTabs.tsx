'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Search, BarChart3, Clock } from 'lucide-react';
import { BrandAnalyzer } from './BrandAnalyzer';
import { Card, CardContent } from '@/components/ui/card';

const TABS = [
  { id: 'marque', label: 'Analyse de marque', icon: BarChart3 },
  { id: 'tendances', label: 'Analyseur de tendances', icon: Search },
] as const;

export function AnalyzeTabs() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'tendances' ? 'tendances' : 'marque';
  const initialBrand = searchParams.get('brand') ?? '';

  return (
    <div className="flex flex-col min-h-[500px]">
      <div className="flex border-b border-border bg-muted/20 shrink-0">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          const href = t.id === 'marque' ? '/brands/analyze' : '/brands/analyze?tab=tendances';
          const Icon = t.icon;
          return (
            <Link
              key={t.id}
              href={href}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="flex-1 pt-6">
        {tab === 'marque' ? (
          <BrandAnalyzer initialBrand={initialBrand} />
        ) : (
          <div className="flex items-center justify-center p-6 min-h-[400px]">
            <Card className="max-w-md border-2 border-dashed">
              <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Bientôt disponible</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  L&apos;analyseur de tendances et prévisions IA est en cours de développement. Vous pourrez bientôt analyser des images de produits et obtenir des recommandations personnalisées.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>En cours de préparation</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
