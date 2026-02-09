import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Handshake, Target, Users, TrendingUp } from "lucide-react"

const benefits = [
  {
    icon: Users,
    title: "Audience qualifiée",
    description: "Touchez des entrepreneurs et professionnels de la mode",
  },
  {
    icon: Target,
    title: "Visibilité ciblée",
    description: "Positionnez votre marque auprès d'un public engagé",
  },
  {
    icon: TrendingUp,
    title: "Croissance mutuelle",
    description: "Développons ensemble des projets à forte valeur ajoutée",
  },
]

export function Partnerships() {
  return (
    <section className="relative overflow-hidden bg-black py-16 md:py-24">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid min-w-0 grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Content */}
          <div>
            <div className="flex items-center gap-2 text-gold mb-4">
              <Handshake className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Partenariats</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl text-balance">
              Collaborons pour créer de la{" "}
              <span className="text-gold">valeur ensemble</span>
            </h2>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">
              Vous êtes une marque, un créateur ou un professionnel du secteur de la mode ? 
              Découvrez nos opportunités de partenariats : sponsoring, contenus sponsorisés, 
              collaborations produits et bien plus.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-gold text-black hover:bg-gold-light font-semibold"
                asChild
              >
                <Link href="/partenariats">
                  Découvrir les opportunités
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                asChild
              >
                <Link href="/contact">
                  Nous contacter
                </Link>
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-4 rounded-lg border border-white/10 bg-white/5 p-6 transition-colors hover:border-gold/30 hover:bg-gold/5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                  <benefit.icon className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{benefit.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
