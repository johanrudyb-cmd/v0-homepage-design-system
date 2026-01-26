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
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tendances & Hits', href: '/trends', icon: TrendingUp },
  { name: 'Marques Tendances', href: '/brands', icon: Building2 },
  { name: 'Brand Spy', href: '/spy', icon: Search, badge: 'NEW' },
];

const tools = [
  { name: 'Design Studio', href: '/design-studio', icon: Palette, badge: 'NEW' },
  { name: 'Sourcing Hub', href: '/sourcing', icon: ShoppingBag },
  { name: 'UGC AI Lab', href: '/ugc', icon: Sparkles, badge: 'NEW' },
  { name: 'Launch Map', href: '/launch-map', icon: Map },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-sidebar flex flex-col z-50 shadow-modern">
      {/* Logo Moderne */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary text-white shadow-modern">
          <span className="text-sm font-bold">SM</span>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold text-foreground">SaaS Mode</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Fashion Tools
          </span>
        </div>
      </div>

      {/* Navigation Moderne */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 mb-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Navigation
          </p>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-sidebar-accent',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive && 'text-primary')} />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-md">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="px-3 mt-6">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Outils
          </p>
          <div className="space-y-1">
            {tools.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-sidebar-accent',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive && 'text-primary')} />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-md">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Section Moderne */}
      <div className="border-t border-border p-3 space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            'hover:bg-sidebar-accent',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Paramètres</span>
        </Link>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
