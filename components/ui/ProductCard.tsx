import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

interface ProductCardProps {
  title: string
  price: string
  image: string
  slug: string
  badge?: string
}

export function ProductCard({
  title,
  price,
  image,
  slug,
  badge,
}: ProductCardProps) {
  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-lg bg-card border border-border transition-all duration-200 hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {badge && (
          <div className="absolute top-3 left-3">
            <span className="inline-block rounded-full bg-pink px-3 py-1 text-xs font-semibold text-black">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 group-hover:text-gold transition-colors">
          {title}
        </h3>

        {/* Price */}
        <div className="mt-2 text-lg font-bold text-gold">
          {price}
        </div>

        {/* Button */}
        <Button
          className="mt-3 w-full bg-black text-white hover:bg-gold hover:text-black transition-colors"
          size="sm"
          asChild
        >
          <Link href={`/boutique/${slug}`}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Voir le produit
          </Link>
        </Button>
      </div>
    </article>
  )
}
