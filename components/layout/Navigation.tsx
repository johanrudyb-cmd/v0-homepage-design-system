"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/articles", label: "Articles" },
  { href: "/podcasts", label: "Podcasts" },
  { href: "/videos", label: "Vidéos" },
  { href: "/partenariats", label: "Partenariats" },
  { href: "/boutique", label: "Boutique" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-black">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white md:text-2xl">
            Média <span className="text-gold">Biangory</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/80 transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 lg:flex">
          <Button
            className="bg-gold text-black hover:bg-gold-light font-semibold"
            size="sm"
          >
            Newsletter
          </Button>
          <Link href="/boutique" className="relative">
            <ShoppingBag className="h-5 w-5 text-white transition-colors hover:text-gold" />
            <span className="sr-only">Panier</span>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-4 lg:hidden">
          <Link href="/boutique" className="relative">
            <ShoppingBag className="h-5 w-5 text-white" />
            <span className="sr-only">Panier</span>
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full bg-black border-black sm:max-w-sm">
              <div className="flex flex-col gap-6 pt-8">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">
                    Média <span className="text-gold">Biangory</span>
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-white/80 transition-colors hover:text-gold py-2"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <Button className="mt-4 bg-gold text-black hover:bg-gold-light font-semibold">
                  Newsletter
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
