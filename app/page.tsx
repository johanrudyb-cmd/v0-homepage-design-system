import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { LatestArticles } from "@/components/sections/LatestArticles"
import { LatestPodcasts } from "@/components/sections/LatestPodcasts"
import { LatestVideos } from "@/components/sections/LatestVideos"
import { Shop } from "@/components/sections/Shop"
import { Partnerships } from "@/components/sections/Partnerships"
import { Newsletter } from "@/components/sections/Newsletter"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1">
        <Hero />
        <LatestArticles />
        <LatestPodcasts />
        <LatestVideos />
        <Shop />
        <Partnerships />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
