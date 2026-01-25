import Link from "next/link"
import { Button } from "@/components/ui/button"
import { VideoCard } from "@/components/ui/VideoCard"
import { ArrowRight, Video } from "lucide-react"

const videos = [
  {
    title: "Tutoriel : Créer un lookbook professionnel pour votre marque",
    views: "12.5K",
    duration: "18:24",
    thumbnail: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=450&fit=crop",
    slug: "creer-lookbook-professionnel",
  },
  {
    title: "Behind the scenes : Fashion Week Paris 2026",
    views: "8.2K",
    duration: "25:10",
    thumbnail: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=450&fit=crop",
    slug: "behind-scenes-fashion-week",
  },
  {
    title: "Comment photographier vos créations comme un pro",
    views: "15.8K",
    duration: "22:45",
    thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=450&fit=crop",
    slug: "photographier-creations-mode",
  },
]

export function LatestVideos() {
  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-pink mb-2">
              <Video className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Vidéo</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Dernières vidéos
            </h2>
            <p className="mt-2 text-muted-foreground">
              Tutoriels, coulisses et contenus exclusifs
            </p>
          </div>
          <Button
            variant="outline"
            className="border-pink text-pink hover:bg-pink hover:text-black bg-transparent"
            asChild
          >
            <Link href="/videos">
              Voir toutes les vidéos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.slug} {...video} />
          ))}
        </div>
      </div>
    </section>
  )
}
