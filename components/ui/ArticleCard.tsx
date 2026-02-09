import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar } from "lucide-react"

interface ArticleCardProps {
  title: string
  excerpt: string
  date: string
  category: string
  featuredImage: string
  slug: string
}

export function ArticleCard({
  title,
  excerpt,
  date,
  category,
  featuredImage,
  slug,
}: ArticleCardProps) {
  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:shadow-lg hover:shadow-gold/5 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={featuredImage || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-semibold text-black">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <time dateTime={date}>{date}</time>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-lg font-semibold leading-tight text-card-foreground line-clamp-2 group-hover:text-gold transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {excerpt}
        </p>

        {/* Link */}
        <Link
          href={`/articles/${slug}`}
          className="mt-4 inline-flex items-center text-sm font-semibold text-gold transition-colors hover:text-gold-light"
        >
          Lire plus
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  )
}
