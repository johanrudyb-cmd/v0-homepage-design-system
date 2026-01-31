'use client';

import { useEffect, useState } from 'react';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { SearchBar } from './SearchBar';

export function Header() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Search */}
        <SearchBar />

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* User */}
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white text-sm font-semibold">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-medium text-foreground leading-tight">
                    {user.name || 'Utilisateur'}
                  </span>
                  <span className="text-xs text-muted-foreground leading-tight">
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
