import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Palette, 
  TrendingUp, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Map 
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  const steps = [
    {
      id: 1,
      title: 'Calculez la rentabilité de votre marque',
      description:
        'Définissez votre prix de vente, coût de production et frais marketing pour calculer votre marge nette.',
      completed: true,
      href: '/launch-map',
    },
    {
      id: 2,
      title: 'Créez votre premier design avec l\'IA',
      description:
        'Utilisez le Design Studio IA pour générer votre premier tech pack professionnel.',
      completed: true,
      href: '/design-studio',
    },
    {
      id: 3,
      title: 'Contactez des usines pour la production',
      description:
        'Explorez le Sourcing Hub pour trouver des fournisseurs qualifiés et obtenez des devis.',
      completed: false,
      href: '/sourcing',
    },
    {
      id: 4,
      title: 'Générez vos scripts marketing UGC',
      description:
        'Créez vos premiers scripts de clips UGC avec l\'IA pour promouvoir votre marque.',
      completed: false,
      href: '/ugc',
    },
  ];

  const completedSteps = steps.filter((s) => s.completed).length;

  const quickActions = [
    {
      title: 'Design Studio',
      description: 'Générez des tech packs professionnels',
      href: '/design-studio',
      icon: Palette,
      gradient: 'gradient-primary',
    },
    {
      title: 'Tendances & Hits',
      description: 'Découvrez les produits gagnants',
      href: '/trends',
      icon: TrendingUp,
      gradient: 'gradient-accent',
    },
    {
      title: 'Brand Spy',
      description: 'Analysez vos concurrents',
      href: '/spy',
      icon: Search,
      gradient: 'bg-secondary',
    },
    {
      title: 'Sourcing Hub',
      description: 'Trouvez des usines qualifiées',
      href: '/sourcing',
      icon: ShoppingBag,
      gradient: 'gradient-primary',
    },
    {
      title: 'UGC AI Lab',
      description: 'Créez votre contenu marketing',
      href: '/ugc',
      icon: Sparkles,
      gradient: 'bg-secondary',
    },
    {
      title: 'Launch Map',
      description: 'Suivez votre progression',
      href: '/launch-map',
      icon: Map,
      gradient: 'gradient-accent',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-10">
        {/* Welcome Section - Moderne */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Bienvenue, {user.name || 'Utilisateur'} 👋
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Créez votre marque de vêtements de A à Z avec l'intelligence artificielle.
          </p>
        </div>

        {/* Progress Section - Moderne */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Votre parcours vers votre première marque</CardTitle>
                <CardDescription className="text-base">
                  {completedSteps} phases sur {steps.length} complétées
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-40 h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full gradient-primary transition-all duration-700 rounded-full"
                    style={{ width: `${(completedSteps / steps.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-foreground min-w-[3rem]">
                  {Math.round((completedSteps / steps.length) * 100)}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.completed ? CheckCircle2 : Circle;
                return (
                  <Link
                    key={step.id}
                    href={step.href}
                    className="flex items-start gap-4 p-5 rounded-xl border-2 border-border hover:border-primary/50 hover:shadow-modern transition-all group bg-card"
                  >
                    <div className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                      step.completed 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-foreground mb-1.5 group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{step.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Moderne */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Accès rapide aux outils</h2>
            <p className="text-sm text-muted-foreground font-medium">
              Tous les outils dont vous avez besoin pour créer et lancer votre marque
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="hover:scale-105 hover:border-primary/50 transition-all cursor-pointer h-full border-2">
                    <CardHeader>
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-modern', action.gradient)}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Trial Banner - Moderne */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-foreground">
                  Votre essai gratuit se termine dans 3 jours
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Débloquez toutes les fonctionnalités premium : designs illimités, sourcing avancé, marketing automatisé
                </p>
              </div>
              <Button className="ml-6 shadow-modern-lg">
                Débloquer l'accès complet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
