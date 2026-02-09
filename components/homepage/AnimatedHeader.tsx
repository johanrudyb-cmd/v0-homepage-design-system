'use client';

import Link from 'next/link';

export function AnimatedHeader() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#F2F2F2]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#007AFF] flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#1D1D1F]">
            OUTFITY
          </span>
        </Link>

        {/* Navigation - liens utiles à la navigation sur la page */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
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
        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="px-5 py-2.5 rounded-full text-sm font-medium border-2 border-[#E5E5E7] text-[#1D1D1F] hover:border-[#007AFF] hover:text-[#007AFF] transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/auth/signup"
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#007AFF] text-white hover:bg-[#0056CC] transition-colors shadow-sm"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </nav>
  );
}
