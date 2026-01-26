import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="z-10 max-w-6xl w-full space-y-16">
        {/* Hero Section - Moderne & Jeune */}
        <div className="text-center space-y-6">
          <div className="inline-block">
            <h1 className="text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              SaaS Mode
            </h1>
          </div>
          <p className="text-2xl text-foreground font-semibold max-w-2xl mx-auto">
            Créez votre marque de vêtements de A à Z avec l'IA
          </p>
          <p className="text-muted-foreground text-lg font-medium max-w-xl mx-auto">
            Design, sourcing, marketing - Tout automatisé pour vous
          </p>
        </div>

        {/* CTA Buttons - Moderne */}
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup">
            <Button variant="default" size="lg" className="px-8 shadow-modern-lg hover:scale-105 transition-transform">
              Créer un compte
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" size="lg" className="px-8 border-2 hover:scale-105 transition-transform">
              Se connecter
            </Button>
          </Link>
        </div>

        {/* Features Cards - Moderne */}
        <div className="grid gap-6 md:grid-cols-3 mt-20">
          <Card className="hover:scale-105 transition-transform duration-200 border-2 hover:border-primary/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-modern">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <CardTitle>Design Studio IA</CardTitle>
              <CardDescription>
                Générez des tech packs professionnels avec l'IA
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:scale-105 transition-transform duration-200 border-2 hover:border-primary/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4 shadow-modern">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <CardTitle>Sourcing Hub</CardTitle>
              <CardDescription>
                Trouvez les meilleures usines pour votre production
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:scale-105 transition-transform duration-200 border-2 hover:border-primary/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 shadow-modern">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <CardTitle>Brand Spy</CardTitle>
              <CardDescription>
                Analysez vos concurrents et leur stratégie
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
