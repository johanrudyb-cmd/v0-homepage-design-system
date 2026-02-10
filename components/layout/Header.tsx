'use client';

import { useEffect, useState } from 'react';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { SearchBar } from './SearchBar';
import { TokenDisplay } from './TokenDisplay';

export function Header() {
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
      <div className="flex h-16 items-center gap-8 px-8">
        {/* Search */}
        <SearchBar />

        {/* Right Section */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Générations restantes */}
          <TokenDisplay />
          {/* Notifications */}
          <NotificationsDropdown />

          {/* User */}
          <div className="flex items-center gap-4 pl-6 border-l border-black/5">
            {user && (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-semibold text-[#1D1D1F] leading-tight">
                    {user.name || 'Utilisateur'}
                  </span>
                  <span className="text-xs text-[#1D1D1F]/60 leading-tight">
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
