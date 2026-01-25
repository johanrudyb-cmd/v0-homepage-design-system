'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-stone-50 border-b border-stone-200 px-10 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </Link>
          <span className="text-stone-300 font-light">/</span>
          <span className="text-stone-900 font-light tracking-wide">Tableau de bord</span>
        </div>
        <div className="flex items-center gap-3">
          {session?.user && (
            <span className="text-sm text-stone-600 font-light">
              {session.user.name || session.user.email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-stone-600 hover:text-stone-900 font-light text-xs"
          >
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  );
}
