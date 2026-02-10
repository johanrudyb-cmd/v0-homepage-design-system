'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { TokenDisplay } from './TokenDisplay';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Dashboard', description: 'Vue d\'ensemble', href: '/dashboard', tourId: 'tour-dashboard' },
  { name: 'Tendances de la semaine', description: 'Nouveautés chaque semaine — ne vous désabonnez pas', href: '/trends', tourId: 'tour-trends' },
  { name: 'Marques tendances', description: 'Les marques les plus tendances de la semaine', href: '/brands', tourId: 'tour-brands' },
  { name: 'Analyse de marque & tendances', description: 'Analyse IA de marques et analyseur de tendances', href: '/brands/analyze', badge: 'NEW', tourId: 'tour-analyze-brand' },
];

const tools = [
  { name: 'Gérer ma marque', description: 'Guide de lancement — identité, stratégie, design, sourcing', href: '/launch-map', tourId: 'tour-launch-map', featured: true },
  { name: 'Calculateur de marge', description: 'Calculez votre marge bénéficiaire par vêtement', href: '/launch-map/phase/2', tourId: 'tour-calculator' },
  { name: 'Création de contenu', description: 'Générez des posts structurés par IA et planifiez-les', href: '/launch-map/phase/6', tourId: 'tour-content-creation' },
  { name: 'Formation', description: 'Personal branding — mini formation gratuite + coaching 59€/mois', href: '/launch-map/formation', tourId: 'tour-formation' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 backdrop-blur-xl bg-white/80 flex flex-col z-50">
      {/* Header avec logo */}
      <div className="px-6 py-5 border-b border-black/5 flex justify-center">
        <Link href="/dashboard" className="block group">
          <Image src="/icon.png" alt="Logo" width={96} height={96} className="h-24 w-24 shrink-0 object-contain bg-transparent" unoptimized />
        </Link>
      </div>

      {/* Navigation Apple - Glassmorphism */}
      <nav className="flex-1 overflow-y-auto pt-6 pb-6 px-6 space-y-8">
        {/* Section Navigation */}
        <div>
          <h2 className="px-4 mb-3 text-xs font-semibold text-[#1D1D1F]/40 uppercase tracking-wider">
            Navigation
          </h2>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  data-tour={item.tourId}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200',
                    isActive
                      ? 'bg-black/5 text-[#007AFF]'
                      : 'text-[#1D1D1F]/60 hover:bg-black/5 hover:text-[#007AFF]'
                  )}
                  title={item.description}
                >
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge variant={item.badge === 'NEW' ? 'secondary' : 'default'} className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section Outils de création */}
        <div>
          <h2 className="px-4 mb-3 text-xs font-semibold text-[#1D1D1F]/40 uppercase tracking-wider">
            Outils de création
          </h2>
          <div className="space-y-1">
            {tools.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  data-tour={item.tourId}
                  className={cn(
                    'block px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200',
                    isActive
                      ? 'bg-black/5 text-[#007AFF]'
                      : 'text-[#1D1D1F]/60 hover:bg-black/5 hover:text-[#007AFF]'
                  )}
                  title={item.description}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-6 space-y-1 border-t border-black/5">
        <Link
          href="/usage"
          className={cn(
            'block px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200',
            pathname === '/usage'
              ? 'bg-black/5 text-[#007AFF]'
              : 'text-[#1D1D1F]/60 hover:bg-black/5 hover:text-[#007AFF]'
          )}
          title="Gérer mes quotas et crédits"
        >
          Mes quotas
        </Link>
        <Link
          href="/settings"
          className={cn(
            'block px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200',
            pathname === '/settings'
              ? 'bg-black/5 text-[#007AFF]'
              : 'text-[#1D1D1F]/60 hover:bg-black/5 hover:text-[#007AFF]'
          )}
        >
          Paramètres
        </Link>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
          }}
          className="w-full text-left px-4 py-3 rounded-2xl text-base font-medium text-[#1D1D1F]/60 hover:bg-black/5 hover:text-[#007AFF] transition-all duration-200"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
