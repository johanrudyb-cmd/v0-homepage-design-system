import Link from "next/link"
import { Instagram, Youtube } from "lucide-react"

const footerLinks = {
  navigation: [
    { href: "/articles", label: "Articles" },
    { href: "/podcasts", label: "Podcasts" },
    { href: "/videos", label: "Vidéos" },
    { href: "/boutique", label: "Boutique" },
    { href: "/partenariats", label: "Partenariats" },
  ],
  legal: [
    { href: "/cgv", label: "CGV" },
    { href: "/cgu", label: "CGU" },
    { href: "/confidentialite", label: "Politique de confidentialité" },
    { href: "/mentions-legales", label: "Mentions légales" },
  ],
  social: [
    { href: "https://instagram.com", label: "Instagram", icon: Instagram },
    { href: "https://youtube.com", label: "YouTube", icon: Youtube },
    { href: "https://spotify.com", label: "Spotify", icon: SpotifyIcon },
  ],
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold">
                Média <span className="text-gold">Biangory</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              Le média business de la mode. Découvrez nos articles, podcasts et vidéos pour développer votre activité dans le secteur de la mode.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              Navigation
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              Informations
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              Suivez-nous
            </h3>
            <div className="mt-4 flex gap-4">
              {footerLinks.social.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 transition-colors hover:text-gold"
                  aria-label={link.label}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-sm text-white/70">Contact</p>
              <a
                href="mailto:contact@mediabiangory.com"
                className="text-sm text-gold hover:text-gold-light transition-colors"
              >
                contact@mediabiangory.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-center text-sm text-white/50">
            © {new Date().getFullYear()} Média Biangory. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
