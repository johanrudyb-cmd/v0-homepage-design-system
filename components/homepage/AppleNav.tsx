'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppleNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setIsLoggedIn(!!data?.user))
      .catch(() => {});
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        <Link href={isLoggedIn ? '/dashboard' : '/'} className="shrink-0">
          <Image src="/icon.png" alt="Logo" width={96} height={96} className="h-24 w-24 object-contain bg-transparent" unoptimized />
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-medium text-[#000000] hover:text-[#007AFF] transition-colors duration-200"
          >
            Fonctionnalités
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-[#000000] hover:text-[#007AFF] transition-colors duration-200"
          >
            Tarifs
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium text-[#000000] hover:text-[#007AFF] transition-colors duration-200"
          >
            Témoignages
          </Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link
            href="/auth/signin"
            className="text-sm font-medium text-[#000000] hover:text-[#007AFF] transition-colors duration-200"
          >
            Se connecter
          </Link>
          <Link
            href="/auth/signup"
            className="px-5 py-2 bg-[#000000] text-white rounded-full text-sm font-medium hover:bg-[#1D1D1F] transition-all duration-200"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </nav>
  );
}
