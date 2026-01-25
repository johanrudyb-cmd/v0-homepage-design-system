import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-stone-50">
      <div className="z-10 max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-light tracking-wide text-stone-900 mb-4">
            SaaS Mode
          </h1>
          <p className="text-xl text-stone-600 mb-2 font-light">
            Créez votre marque de vêtements de A à Z avec l'IA
          </p>
          <p className="text-stone-500 font-light">
            Design, sourcing, marketing - Tout automatisé pour vous
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup">
            <Button variant="primary" size="lg" className="bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs px-8 py-3">
              Créer un compte
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" size="lg" className="border-stone-300 font-light tracking-wide uppercase text-xs px-8 py-3">
              Se connecter
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-12">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-xl font-light tracking-wide">Design Studio IA</CardTitle>
              <CardDescription className="font-light">
                Générez des tech packs professionnels avec l'IA
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-xl font-light tracking-wide">Sourcing Hub</CardTitle>
              <CardDescription className="font-light">
                Trouvez les meilleures usines pour votre production
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-xl font-light tracking-wide">Brand Spy</CardTitle>
              <CardDescription className="font-light">
                Analysez vos concurrents et leur stratégie
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
