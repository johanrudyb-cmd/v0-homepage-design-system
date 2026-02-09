import { AnimatedHeader } from '@/components/homepage/AnimatedHeader';
import { TrendsHero } from '@/components/homepage/TrendsHero';
import { StatsSection } from '@/components/homepage/StatsSection';
import { TrendsByMarket } from '@/components/homepage/TrendsByMarket';
import { FashionGallery } from '@/components/homepage/FashionGallery';
import { FoundationGrid } from '@/components/homepage/FoundationGrid';
import { CreativeGrid } from '@/components/homepage/CreativeGrid';
import { MarginCalculator } from '@/components/homepage/MarginCalculator';
import { TechPackShowcase } from '@/components/homepage/TechPackShowcase';
import { TestimonialsSection } from '@/components/homepage/TestimonialsSection';
import { SalesPricing } from '@/components/homepage/SalesPricing';
import { FAQSection } from '@/components/homepage/FAQSection';
import { CTASection } from '@/components/homepage/CTASection';
import { Footer } from '@/components/homepage/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F5F7]">
      <AnimatedHeader />
      <TrendsHero />
      <TrendsByMarket />
      <StatsSection />
      <FashionGallery />
      <TechPackShowcase />
      <FoundationGrid />
      <CreativeGrid />
      <MarginCalculator />
      <TestimonialsSection />
      <SalesPricing />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
