import Link from "next/link"
import Image from "next/image"
import { Play, Clock, Calendar } from "lucide-react"

interface PodcastCardProps {
  title: string
  description: string
  date: string
  duration: string
  thumbnail: string
  slug: string
}

export function PodcastCard({
  title,
  description,
  date,
  duration,
  thumbnail,
  slug,
}: PodcastCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg bg-black-light border border-white/10 transition-all duration-200 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/10">
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={thumbnail || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-black">
            <Play className="h-6 w-6 ml-1" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 bg-black-light">
        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-white/60">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-lg font-semibold leading-tight text-white line-clamp-2 group-hover:text-gold transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-2 flex-1 text-sm text-white/60 leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Link */}
        <Link
          href={`/podcasts/${slug}`}
          className="mt-4 inline-flex items-center text-sm font-semibold text-gold transition-colors hover:text-gold-light"
        >
          Écouter
          <Play className="ml-1 h-4 w-4" fill="currentColor" />
        </Link>
      </div>
    </article>
  )
}
