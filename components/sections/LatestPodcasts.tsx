import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PodcastCard } from "@/components/ui/PodcastCard"
import { ArrowRight, Headphones } from "lucide-react"

const podcasts = [
  {
    title: "Comment j'ai créé ma marque de streetwear en partant de zéro",
    description: "Interview exclusive avec Sarah M., fondatrice de URBN Paris, qui partage son parcours entrepreneurial.",
    date: "19 janvier 2026",
    duration: "45 min",
    thumbnail: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=600&fit=crop",
    slug: "creer-marque-streetwear",
  },
  {
    title: "Les secrets du sourcing éthique en mode",
    description: "Comment trouver des fournisseurs responsables et construire une chaîne d'approvisionnement durable.",
    date: "12 janvier 2026",
    duration: "38 min",
    thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=600&fit=crop",
    slug: "sourcing-ethique-mode",
  },
  {
    title: "E-commerce mode : Optimiser son taux de conversion",
    description: "Techniques et stratégies pour augmenter les ventes de votre boutique en ligne de mode.",
    date: "5 janvier 2026",
    duration: "52 min",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop",
    slug: "ecommerce-mode-conversion",
  },
]

export function LatestPodcasts() {
  return (
    <section className="bg-black py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-gold mb-2">
              <Headphones className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Audio</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Derniers podcasts
            </h2>
            <p className="mt-2 text-white/60">
              Interviews et conseils d&apos;experts du secteur
            </p>
          </div>
          <Button
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-black bg-transparent"
            asChild
          >
            <Link href="/podcasts">
              Voir tous les podcasts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="mt-10 grid min-w-0 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {podcasts.map((podcast) => (
            <PodcastCard key={podcast.slug} {...podcast} />
          ))}
        </div>
      </div>
    </section>
  )
}
