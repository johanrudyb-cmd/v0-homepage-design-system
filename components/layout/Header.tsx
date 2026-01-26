'use client';

import { useEffect, useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Search Moderne */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
        </div>

        {/* Right Section Moderne */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
          </Button>

          {/* User Moderne */}
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-primary text-white text-sm font-semibold shadow-modern">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {user.name || 'Utilisateur'}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
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
