'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { SearchBar } from './SearchBar';
import { TokenDisplay } from './TokenDisplay';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : Promise.resolve(null)))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 border-b border-black/5">
      <div className="flex h-14 sm:h-16 items-center gap-3 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8">
        {/* Menu burger (mobile) */}
        {onMenuClick && (
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className="lg:hidden touch-target flex items-center justify-center -ml-1 rounded-xl text-[#1D1D1F] hover:bg-black/5 active:bg-black/10"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6 shrink-0" />
          </button>
        )}
        {/* Search - masqué sur très petit écran, raccourci sur mobile */}
        <div className="flex-1 min-w-0 max-w-xl">
          <SearchBar />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
          <TokenDisplay />
          <NotificationsDropdown />
          <div className="hidden sm:flex items-center gap-4 pl-2 lg:pl-6 lg:border-l border-black/5">
            {user && (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-semibold text-[#1D1D1F] leading-tight truncate max-w-[120px] lg:max-w-none">
                    {user.name || 'Utilisateur'}
                  </span>
                  <span className="text-xs text-[#1D1D1F]/60 leading-tight truncate max-w-[120px] lg:max-w-none hidden lg:block">
                    {user.email}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
