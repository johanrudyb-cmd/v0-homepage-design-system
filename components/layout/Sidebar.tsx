'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard' },
  { name: 'Tendances & Hits', href: '/trends' },
  { name: 'Mes Marques', href: '/brands' },
  { name: 'Brand Spy', href: '/spy' },
];

const tools = [
  { name: 'Design Studio IA', href: '/brands/new', badge: 'NEW' },
  { name: 'Sourcing Hub', href: '/sourcing' },
  { name: 'UGC AI Lab', href: '/ugc' },
  { name: 'Launch Map', href: '/launch-map' },
];

const resources = [
  { name: 'Fournisseurs', href: '/sourcing' },
  { name: 'Documentation', href: '/docs' },
  { name: 'FAQ', href: '/faq' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-stone-900 text-white flex flex-col border-r border-stone-800">
      {/* Logo & Settings */}
      <div className="flex items-center justify-between p-8 border-b border-stone-800">
        <div className="flex flex-col">
          <span className="text-3xl font-light tracking-wider text-stone-100">
            SaaS
          </span>
          <span className="text-3xl font-light tracking-wider text-amber-200">
            Mode
          </span>
        </div>
        <button className="text-stone-400 hover:text-stone-200 transition-colors p-2 rounded hover:bg-stone-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-5 py-3.5 rounded-md transition-all text-sm font-light tracking-wide uppercase text-xs',
                isActive
                  ? 'bg-amber-900/30 text-amber-200 border-l-2 border-amber-400'
                  : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
              )}
            >
              <span className="w-1 h-1 rounded-full bg-current opacity-60" />
              {item.name}
            </Link>
          );
        })}

        {/* OUTILS Section */}
        <div className="mt-10 mb-6">
          <h3 className="px-5 text-xs font-light text-stone-500 uppercase tracking-widest mb-4">
            Outils
          </h3>
          <div className="space-y-2">
            {tools.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between gap-3 px-5 py-3 rounded-md transition-all text-sm font-light relative group',
                    isActive
                      ? 'bg-amber-900/30 text-amber-200'
                      : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="text-xs bg-amber-600/20 text-amber-300 px-2.5 py-0.5 rounded-full font-medium border border-amber-600/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* RESSOURCES Section */}
        <div className="mt-6 mb-6">
          <h3 className="px-5 text-xs font-light text-stone-500 uppercase tracking-widest mb-4">
            Ressources
          </h3>
          <div className="space-y-2">
            {resources.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3 rounded-md transition-all text-sm font-light',
                    isActive
                      ? 'bg-amber-900/30 text-amber-200'
                      : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
                  )}
                >
                  <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-6 border-t border-stone-800 space-y-4 bg-stone-950/50">
        <Button
          variant="primary"
          className="w-full bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 font-light tracking-wide uppercase text-xs py-3"
        >
          Guide de démarrage
        </Button>

        <div className="bg-stone-800/50 rounded-lg p-5 space-y-4 border border-stone-700/50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-400 font-light">
              Essai gratuit
            </p>
            <p className="text-sm text-amber-200 font-medium">
              3 jours restants
            </p>
          </div>
          <div className="w-full h-1 bg-stone-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400" style={{ width: '60%' }} />
          </div>
          <Button
            variant="primary"
            className="w-full bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-600/30 text-xs font-light tracking-wide uppercase py-2.5"
          >
            Débloquer l'accès complet
          </Button>
        </div>
      </div>
    </aside>
  );
}
