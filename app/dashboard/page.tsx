import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardRefresh } from '@/components/dashboard/DashboardRefresh';
import { DashboardNotifications } from '@/components/dashboard/DashboardNotifications';
import { PreferencesBanner } from '@/components/dashboard/PreferencesBanner';
import { 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Palette, 
  TrendingUp, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Map as MapIcon 
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  // Récupérer ou créer une marque par défaut
  let brand = await prisma.brand.findFirst({
    where: { userId: user.id },
  });

  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        userId: user.id,
        name: 'Ma Première Marque',
      },
    });
    // Créer le Launch Map associé
    await prisma.launchMap.create({
      data: {
        brandId: brand.id,
      },
    });
  }

  // Récupérer le Launch Map pour vérifier la progression
  const launchMap = await prisma.launchMap.findUnique({
    where: { brandId: brand.id },
  });

  // Vérifier les designs créés
  const designCount = await prisma.design.count({
    where: { brandId: brand.id, status: 'completed' },
  });

  // Vérifier les devis envoyés
  const quoteCount = await prisma.quote.count({
    where: { brandId: brand.id },
  });

  // Vérifier les contenus UGC créés
  const ugcCount = await prisma.uGCContent.count({
    where: { brandId: brand.id },
  });

  // Récupérer les données pour les graphiques (30 derniers jours)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Récupérer tous les designs, devis et UGC des 30 derniers jours
  const [designs, quotes, ugcContents] = await Promise.all([
    prisma.design.findMany({
      where: {
        brandId: brand.id,
        status: 'completed',
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
    }),
    prisma.quote.findMany({
      where: {
        brandId: brand.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
    }),
    prisma.uGCContent.findMany({
      where: {
        brandId: brand.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
    }),
  ]);

  // Créer un objet pour chaque jour des 30 derniers jours
  const chartDataMap = new globalThis.Map<string, { designs: number; quotes: number; ugc: number }>();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    chartDataMap.set(dateKey, { designs: 0, quotes: 0, ugc: 0 });
  }

  // Compter par jour
  designs.forEach((design) => {
    const dateKey = new Date(design.createdAt).toISOString().split('T')[0];
    const existing = chartDataMap.get(dateKey);
    if (existing) {
      existing.designs++;
    }
  });

  quotes.forEach((quote) => {
    const dateKey = new Date(quote.createdAt).toISOString().split('T')[0];
    const existing = chartDataMap.get(dateKey);
    if (existing) {
      existing.quotes++;
    }
  });

  ugcContents.forEach((ugc) => {
    const dateKey = new Date(ugc.createdAt).toISOString().split('T')[0];
    const existing = chartDataMap.get(dateKey);
    if (existing) {
      existing.ugc++;
    }
  });

  // Convertir en array et formater les dates
  const chartData = Array.from(chartDataMap.entries()).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    designs: data.designs,
    quotes: data.quotes,
    ugc: data.ugc,
  }));

  // Calculer la progression réelle
  const steps = [
    {
      id: 1,
      title: 'Calculez la rentabilité de votre marque',
      description:
        'Définissez votre prix de vente, coût de production et frais marketing pour calculer votre marge nette.',
      completed: launchMap?.phase1 || false,
      href: '/launch-map',
    },
    {
      id: 2,
      title: 'Créez votre premier design avec l\'IA',
      description:
        'Utilisez le Design Studio IA pour générer votre premier tech pack professionnel.',
      completed: designCount > 0,
      href: '/design-studio',
    },
    {
      id: 3,
      title: 'Contactez des usines pour la production',
      description:
        'Explorez le Sourcing Hub pour trouver des fournisseurs qualifiés et obtenez des devis.',
      completed: quoteCount >= 2 || launchMap?.phase3 || false,
      href: '/sourcing',
    },
    {
      id: 4,
      title: 'Générez vos scripts marketing UGC',
      description:
        'Créez vos premiers scripts de clips UGC avec l\'IA pour promouvoir votre marque.',
      completed: ugcCount > 0 || launchMap?.phase4 || false,
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
      gradient: 'bg-primary',
    },
    {
      title: 'Tendances',
      description: 'Produits tendance scrapés & analyse photo',
      href: '/trends',
      icon: TrendingUp,
      gradient: 'bg-accent',
    },
    {
      title: 'Analyseur de tendances',
      description: 'Analyse tendances & prévisions IA',
      href: '/spy',
      icon: Search,
      gradient: 'bg-secondary',
    },
    {
      title: 'Sourcing Hub',
      description: 'Trouvez des usines qualifiées',
      href: '/sourcing',
      icon: ShoppingBag,
      gradient: 'bg-primary',
    },
    {
      title: 'UGC AI Lab',
      description: 'Créez votre contenu marketing',
      href: '/ugc',
      icon: Sparkles,
      gradient: 'bg-secondary',
    },
    {
      title: 'Créer ma marque',
      description: 'Guide complet de création',
      href: '/launch-map',
      icon: MapIcon,
      gradient: 'bg-accent',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-10">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Bienvenue, {user.name || 'Utilisateur'} 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              Créez votre marque de vêtements de A à Z avec l'intelligence artificielle.
            </p>
          </div>
          <DashboardRefresh />
        </div>

        {/* Notifications Section */}
        <DashboardNotifications />

        {/* Preferences Banner */}
        <PreferencesBanner />

        {/* Charts Section */}
        {chartData.length > 0 && (
          <DashboardCharts chartData={chartData} />
        )}

        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Designs créés</p>
                  <p className="text-2xl font-semibold text-foreground">{designCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Devis envoyés</p>
                  <p className="text-2xl font-semibold text-foreground">{quoteCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contenus UGC</p>
                  <p className="text-2xl font-semibold text-foreground">{ugcCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Progression</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {Math.round((completedSteps / steps.length) * 100)}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
                  <MapIcon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl mb-1">Votre parcours vers votre première marque</CardTitle>
                <CardDescription>
                  {completedSteps} phases sur {steps.length} complétées
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${(completedSteps / steps.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground min-w-[3rem]">
                  {Math.round((completedSteps / steps.length) * 100)}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {steps.map((step, index) => {
                const Icon = step.completed ? CheckCircle2 : Circle;
                return (
                  <Link
                    key={step.id}
                    href={step.href}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className={cn(
                      'flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center',
                      step.completed 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Create Brand CTA (if no brand or no identity) */}
        {(!brand || (!brand.logo && !brand.colorPalette)) && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-foreground">
                    {!brand ? 'Créez votre première marque' : 'Complétez l\'identité de votre marque'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {!brand 
                      ? 'Définissez votre identité (nom, logo, couleurs) et lancez votre marque'
                      : 'Définissez le nom, logo et identité visuelle de votre marque pour commencer'}
                  </p>
                </div>
                <Link href="/brands/create">
                  <Button className="ml-6">
                    {!brand ? 'Créer ma marque' : 'Créer l\'identité'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight mb-1">Accès rapide aux outils</h2>
            <p className="text-sm text-muted-foreground">
              Tous les outils dont vous avez besoin pour créer et lancer votre marque
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', action.gradient)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="text-sm">{action.description}</CardDescription>
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
