'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function AnimatedHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setIsLoggedIn(!!data?.user))
      .catch(() => {});
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#F2F2F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 lg:h-20 flex items-center justify-between gap-2">
        <Link href={isLoggedIn ? '/dashboard' : '/'} className="shrink-0">
          <Image src="/icon.png" alt="Logo" width={96} height={96} className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 xl:h-24 xl:w-24 object-contain bg-transparent" unoptimized />
        </Link>

        {/* Navigation - liens utiles à la navigation sur la page */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          <Link
            href="#features"
            className="text-sm font-medium text-[#6e6e73] hover:text-[#007AFF] transition-colors whitespace-nowrap"
          >
            Fonctionnalités
          </Link>
          <Link
            href="#pricing-section"
            className="text-sm font-medium text-[#6e6e73] hover:text-[#007AFF] transition-colors whitespace-nowrap"
          >
            Tarifs
          </Link>
          <Link
            href="#testimonials-section"
            className="text-sm font-medium text-[#6e6e73] hover:text-[#007AFF] transition-colors whitespace-nowrap"
          >
            Témoignages
          </Link>
          <Link
            href="#faq-section"
            className="text-sm font-medium text-[#6e6e73] hover:text-[#007AFF] transition-colors whitespace-nowrap"
          >
            FAQ
          </Link>
        </div>

        {/* CTA - boutons alignés avec le reste du site */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/auth/signin"
            className="px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium border-2 border-[#E5E5E7] text-[#1D1D1F] hover:border-[#007AFF] hover:text-[#007AFF] transition-colors whitespace-nowrap"
          >
            Se connecter
          </Link>
          <Link
            href="/auth/signup"
            className="px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#007AFF] text-white hover:bg-[#0056CC] transition-colors shadow-sm whitespace-nowrap"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </nav>
  );
}
