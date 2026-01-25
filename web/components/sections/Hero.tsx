import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#D4AF37_25%,transparent_25%,transparent_75%,#D4AF37_75%,#D4AF37),linear-gradient(45deg,#D4AF37_25%,transparent_25%,transparent_75%,#D4AF37_75%,#D4AF37)] bg-[length:60px_60px] bg-[position:0_0,30px_30px]" />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28 lg:px-8 lg:py-36">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-gold">
              Le média business de la mode
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl text-balance">
            Développez votre{" "}
            <span className="text-gold">business mode</span>{" "}
            avec les bonnes ressources
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-2xl text-lg text-white/70 leading-relaxed md:text-xl text-pretty">
            Découvrez nos articles, podcasts et vidéos exclusifs pour entrepreneurs et passionnés de la mode. Conseils, tendances et stratégies pour réussir dans l&apos;industrie.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Button
              size="lg"
              className="bg-gold text-black hover:bg-gold-light font-semibold px-8 h-12 text-base"
            >
              S&apos;inscrire à la newsletter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-pink text-pink hover:bg-pink hover:text-black font-semibold px-8 h-12 text-base bg-transparent"
              asChild
            >
              <Link href="/articles">
                Découvrir les articles
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            {[
              { value: "50+", label: "Articles" },
              { value: "30+", label: "Podcasts" },
              { value: "20+", label: "Vidéos" },
              { value: "5K+", label: "Abonnés" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gold md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    </section>
  )
}
