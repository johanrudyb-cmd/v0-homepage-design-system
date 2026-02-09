'use client';

type Tab = 'classement' | 'rapport' | 'phases';

interface TrendsSubNavProps {
  active: Tab;
}

const tabs: { id: Tab; label: string; href: string }[] = [
  { id: 'classement', label: 'Classement', href: '/trends' },
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
            onClick={() => (window.location.href = tab.href)}
            className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
          >
            {tab.label}
          </button>
        )
      )}
    </nav>
  );
}
