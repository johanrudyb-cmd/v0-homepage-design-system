'use client';

import Link from 'next/link';
import { Instagram } from 'lucide-react';

const SOCIAL_LINKS = [
  { name: 'Instagram', href: 'https://www.instagram.com/biangory/', icon: 'instagram' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@biangory', icon: 'tiktok' },
] as const;

const footerLinks = {
  produit: [
    { name: 'Fonctionnalités', href: '#features' },
    { name: 'Tarifs', href: '#pricing-section' },
    { name: 'Témoignages', href: '#testimonials-section' },
  ],
  ressources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '#faq-section' },
  ],
  entreprise: [
    { name: 'À propos', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Support', href: '/support' },
  ],
  légal: [
    { name: 'CGV et CGU', href: '/legal/terms' },
    { name: 'Confidentialité', href: '/legal/privacy' },
    { name: 'Mentions légales', href: '/legal/mentions' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#F2F2F2] py-10 sm:py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-12">
          {/* Produit */}
          <div>
            <h3 className="text-sm font-bold text-[#000000] mb-4 uppercase tracking-wide">
              Produit
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.produit.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="inline-block min-h-[44px] py-2 flex items-center text-sm text-[#6e6e73] font-normal hover:text-[#007AFF] transition-colors touch-manipulation"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h3 className="text-sm font-bold text-[#000000] mb-4 uppercase tracking-wide">
              Ressources
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.ressources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="inline-block min-h-[44px] py-2 flex items-center text-sm text-[#6e6e73] font-normal hover:text-[#007AFF] transition-colors touch-manipulation"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h3 className="text-sm font-bold text-[#000000] mb-4 uppercase tracking-wide">
              Entreprise
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.entreprise.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="inline-block min-h-[44px] py-2 flex items-center text-sm text-[#6e6e73] font-normal hover:text-[#007AFF] transition-colors touch-manipulation"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-sm font-bold text-[#000000] mb-4 uppercase tracking-wide">
              Légal
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.légal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="inline-block min-h-[44px] py-2 flex items-center text-sm text-[#6e6e73] font-normal hover:text-[#007AFF] transition-colors touch-manipulation"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Réseaux sociaux - BIANGORY */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-6 sm:py-8 border-t border-[#F2F2F2]">
          {SOCIAL_LINKS.map((social) => (
            <Link
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 min-h-[44px] py-2 text-sm font-medium text-[#6e6e73] hover:text-[#007AFF] transition-colors touch-manipulation"
              aria-label={social.name + ' - BIANGORY'}
            >
              {social.icon === 'instagram' ? (
                <Instagram className="w-5 h-5" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              )}
              <span>{social.name}</span>
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-[#F2F2F2]">
          <p className="text-sm text-[#6e6e73] font-normal text-center">
            © 2026 OUTFITY. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
