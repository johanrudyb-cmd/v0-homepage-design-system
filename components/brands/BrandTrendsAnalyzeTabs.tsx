'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Search, TrendingUp } from 'lucide-react';
import { BrandTrendsAnalyzer } from './BrandTrendsAnalyzer';
import { TrendCheckCard } from '@/components/trends/TrendCheckCard';

const TABS = [
  { id: 'marques', label: 'Marques tendances', href: '/brands/trends/analyze', icon: TrendingUp },
  { id: 'analyzer', label: 'Analyseur de tendances', href: '/brands/trends/analyze?tab=analyzer', icon: Search },
] as const;

export function BrandTrendsAnalyzeTabs() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'analyzer' ? 'analyzer' : 'marques';

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      <div className="flex border-b border-border bg-muted/20 shrink-0">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          const Icon = t.icon;
          return (
            <Link
              key={t.id}
              href={t.href}
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

      <div className="flex-1 min-h-0 flex flex-col">
        {tab === 'marques' ? (
          <div className="flex-1 min-h-0 pt-4">
            <BrandTrendsAnalyzer />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <TrendCheckCard fullWidth />
          </div>
        )}
      </div>
    </div>
  );
}
