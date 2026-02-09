import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ui/ProductCard"
import { ArrowRight, ShoppingBag } from "lucide-react"

const products = [
  {
    title: "Guide complet : Lancer sa marque de mode",
    price: "49,00 €",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop",
    slug: "guide-lancer-marque-mode",
    badge: "Bestseller",
  },
  {
    title: "Template Business Plan Mode",
    price: "29,00 €",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=600&fit=crop",
    slug: "template-business-plan",
  },
  {
    title: "Masterclass : E-commerce Mode",
    price: "199,00 €",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=600&fit=crop",
    slug: "masterclass-ecommerce",
    badge: "Nouveau",
  },
  {
    title: "Pack Templates Réseaux Sociaux",
    price: "39,00 €",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=600&fit=crop",
    slug: "pack-templates-social",
  },
]

export function Shop() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-gold mb-2">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Boutique</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Nos ressources
            </h2>
            <p className="mt-2 text-muted-foreground">
              Guides, templates et formations pour accélérer votre croissance
            </p>
          </div>
          <Button
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-black bg-transparent"
            asChild
          >
            <Link href="/boutique">
              Voir la boutique
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="mt-10 grid min-w-0 grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
        </div>
      </div>
    </section>
  )
}
