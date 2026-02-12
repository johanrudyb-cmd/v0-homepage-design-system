'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Tab = 'classement' | 'rapport' | 'phases' | 'analyseur';

interface TrendsSubNavProps {
  active: Tab;
}

const tabs: { id: string; label: string; href: string; badge?: string }[] = [
  { id: 'classement', label: 'Tendances', href: '/trends' },
  { id: 'analyseur', label: 'Analyseur Visuel', href: '/trends/visual' },
];

export function TrendsSubNav({ active }: TrendsSubNavProps) {
  return (
    <nav className="flex flex-wrap gap-1 p-1 rounded-lg bg-muted/60 w-fit" aria-label="Sections Tendances de la semaine">
      {tabs.map((tab) =>
        tab.id === active ? (
          <span
            key={tab.id}
            className="px-4 py-2 rounded-md bg-background text-sm font-medium shadow-sm border border-border"
          >
            {tab.label}
          </span>
        ) : (
          <button
            key={tab.id}
            type="button"
            onClick={() => tab.href !== '#' && (window.location.href = tab.href)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
              tab.href === '#' ? "text-muted-foreground/40 cursor-default" : "text-muted-foreground hover:text-foreground hover:bg-background/80"
            )}
          >
            {tab.label}
            {tab.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-bold uppercase tracking-wider">
                {tab.badge}
              </span>
            )}
          </button>
        )
      )}
    </nav>
  );
}
