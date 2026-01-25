import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArticleCard } from "@/components/ui/ArticleCard"
import { ArrowRight } from "lucide-react"

const articles = [
  {
    title: "Comment lancer sa marque de mode en 2026 : Guide complet",
    excerpt: "Découvrez les étapes essentielles pour créer votre marque de mode, du concept initial à la première collection.",
    date: "20 janvier 2026",
    category: "Business",
    featuredImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
    slug: "lancer-marque-mode-2026",
  },
  {
    title: "Les tendances mode printemps-été 2026 à connaître",
    excerpt: "Analyse des tendances qui vont dominer la saison et comment les intégrer dans votre collection.",
    date: "18 janvier 2026",
    category: "Tendances",
    featuredImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=500&fit=crop",
    slug: "tendances-mode-printemps-ete-2026",
  },
  {
    title: "Marketing digital pour marques de mode : Stratégies gagnantes",
    excerpt: "Les meilleures pratiques pour promouvoir votre marque sur les réseaux sociaux et développer votre audience.",
    date: "15 janvier 2026",
    category: "Marketing",
    featuredImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop",
    slug: "marketing-digital-mode",
  },
]

export function LatestArticles() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Derniers articles
            </h2>
            <p className="mt-2 text-muted-foreground">
              Conseils, analyses et actualités du monde de la mode
            </p>
          </div>
          <Button
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-black bg-transparent"
            asChild
          >
            <Link href="/articles">
              Voir tous les articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      </div>
    </section>
  )
}
