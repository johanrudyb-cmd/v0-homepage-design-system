'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Search,
  Palette,
  ShoppingBag,
  Sparkles,
  Map,
  Settings,
  LogOut,
} from 'lucide-react';

const navigation = [
  { 
    name: 'Dashboard', 
    description: 'Vue d\'ensemble',
    href: '/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Tendances', 
    description: 'Produits tendance scrapés & analyse photo',
    href: '/trends', 
    icon: TrendingUp 
  },
  { 
    name: 'Marques', 
    description: 'Les marques qui montent',
    href: '/brands', 
    icon: Building2 
  },
  { 
    name: 'Analyseur de tendances', 
    description: 'Analyse tendances & prévisions IA',
    href: '/spy', 
    icon: Search, 
    badge: 'NEW' 
  },
];

const tools = [
  { 
    name: 'Design Studio', 
    description: 'Tech packs avec IA',
    href: '/design-studio', 
    icon: Palette, 
    badge: 'NEW' 
  },
  { 
    name: 'Sourcing', 
    description: 'Trouver des usines',
    href: '/sourcing', 
    icon: ShoppingBag 
  },
  { 
    name: 'UGC Lab', 
    description: 'Contenus marketing IA',
    href: '/ugc', 
    icon: Sparkles, 
    badge: 'NEW' 
  },
  { 
    name: 'Créer ma marque', 
    description: 'Guide de lancement',
    href: '/launch-map', 
    icon: Map 
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 border-r border-border bg-sidebar flex flex-col z-50 shadow-modern">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
          <span className="text-sm font-semibold">SM</span>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold text-foreground">SaaS Mode</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            Fashion Tools
          </span>
        </div>
      </div>

      {/* Navigation Moderne - Design Jeune & Confiant */}
      <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-2">
        <div className="mb-6">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">
            Navigation
          </p>
          <div className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                    'hover:bg-muted/50',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground'
                  )}
                  title={item.description}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'text-sm font-medium leading-tight',
                      isActive ? 'text-primary' : 'text-foreground'
                    )}>
                      {item.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-tight line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-white rounded flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">
            Outils Création
          </p>
          <div className="space-y-1.5">
            {tools.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                    'hover:bg-muted/50',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground'
                  )}
                  title={item.description}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'text-sm font-medium leading-tight',
                      isActive ? 'text-primary' : 'text-foreground'
                    )}>
                      {item.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-tight line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-white rounded flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-3 space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            'hover:bg-muted/50',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-foreground'
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Paramètres</span>
        </Link>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-muted/50 text-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
