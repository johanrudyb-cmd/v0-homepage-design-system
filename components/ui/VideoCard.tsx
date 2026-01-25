import Link from "next/link"
import Image from "next/image"
import { Play, Clock, Eye } from "lucide-react"

interface VideoCardProps {
  title: string
  views: string
  duration: string
  thumbnail: string
  slug: string
}

export function VideoCard({
  title,
  views,
  duration,
  thumbnail,
  slug,
}: VideoCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg bg-card border border-border transition-all duration-200 hover:shadow-lg hover:shadow-pink/10 hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={thumbnail || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
          {duration}
        </div>
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink text-black">
            <Play className="h-7 w-7 ml-1" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="text-base font-semibold leading-tight text-card-foreground line-clamp-2 group-hover:text-pink transition-colors">
          {title}
        </h3>

        {/* Meta */}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {views} vues
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}
          </span>
        </div>

        {/* Link */}
        <Link
          href={`/videos/${slug}`}
          className="mt-3 inline-flex items-center text-sm font-semibold text-pink transition-colors hover:text-pink-light"
        >
          Regarder
          <Play className="ml-1 h-4 w-4" fill="currentColor" />
        </Link>
      </div>
    </article>
  )
}
