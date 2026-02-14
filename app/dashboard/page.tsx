import { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardRefresh } from '@/components/dashboard/DashboardRefresh';
import { DashboardNotifications } from '@/components/dashboard/DashboardNotifications';
import { DashboardStats, DashboardStatsSkeleton } from '@/components/dashboard/DashboardStats';
import { StrategyUpdateBanner } from '@/components/dashboard/StrategyUpdateBanner';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getWeekEvents } from '@/lib/calendar-week-events';
import {
  Rocket,
  Search,
  Factory,
  TrendingUp,
  CheckCircle2,
  Circle,
  LayoutDashboard,
  ArrowRight,
  Crown,
  Calendar as CalendarIcon,
  Store,
  Shirt,
  FileText,
  Palette,
  Map
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');

  // Récupérer la marque et le Launch Map en parallèle pour gagner du temps
  const [brand, initialLaunchMap] = await Promise.all([
    prisma.brand.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.launchMap.findFirst({
      where: { brand: { userId: user.id } }, // Plus robuste via lien brand
    })
  ]);

  if (!brand) redirect('/onboarding');

  // Si on a trouvé un launchMap via l'ID de marque plutôt que l'utilisateur directement
  const launchMap = initialLaunchMap || await prisma.launchMap.findUnique({
    where: { brandId: brand.id },
  });

  const hasIdentity = !!(brand.logo || brand.colorPalette || brand.typography);
  const weekEvents = getWeekEvents(launchMap?.contentCalendar ?? null);
  const isFree = user.plan === 'free';

  const steps = [
    { id: 0, title: 'Identité de marque', description: 'ADN & Style', completed: hasIdentity, href: '/launch-map', icon: LayoutDashboard },
    { id: 1, title: 'Stratégie Marketing', description: 'Positionnement & Cible', completed: !!launchMap?.phase1, href: '/launch-map', icon: Rocket },
    { id: 3, title: 'Mockups IA', description: 'Création visuelle', completed: !!launchMap?.phase3, href: '/launch-map', icon: Shirt },
    { id: 4, title: 'Tech Pack', description: 'Dossier technique', completed: !!launchMap?.phase4, href: '/launch-map', icon: FileText },
    { id: 5, title: 'Sourcing Usines', description: 'Fournisseurs', completed: !!launchMap?.phase5, href: '/launch-map', icon: Factory },
    { id: 7, title: 'Boutique Shopify', description: 'Vente en ligne', completed: !!launchMap?.phase7, href: '/launch-map', icon: Store },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto space-y-8 sm:space-y-12">

          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-6 animate-in slide-in-from-top-4 duration-500">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                  Hello, {user.name?.split(' ')[0] || 'Créateur'}
                </h1>
                {isFree ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    Free
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    <Crown className="w-3 h-3" /> Pro
                  </span>
                )}
              </div>
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                Voici l'avancée de <span className="font-semibold text-foreground">{brand.name}</span>.
                {!isFree && <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md">Succès en vue 🚀</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DashboardNotifications />
              <DashboardRefresh />
            </div>
          </div>

          {/* Stats Section with Suspense & Skeletons */}
          <Suspense fallback={<DashboardStatsSkeleton />}>
            <DashboardStats brandId={brand.id} />
          </Suspense>

          {/* Strategy Update Banner - Only for premium users */}
          {!isFree && <StrategyUpdateBanner />}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Journey + Quick Actions) */}
            <div className="lg:col-span-2 space-y-8">

              {/* Journey Progress */}
              <div className="bg-white rounded-3xl shadow-sm border border-border/50 p-6 sm:p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Map className="w-32 h-32" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">Votre Launch Map</h2>
                    <p className="text-muted-foreground">
                      {completedSteps} phases complétées sur {steps.length}
                    </p>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-foreground">{progress}%</span>
                    <span className="text-sm text-muted-foreground mb-1.5">prêt</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-gray-100 rounded-full mb-8 overflow-hidden relative z-10">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                  {steps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <Link
                        key={step.id}
                        href={step.href}
                        className={cn(
                          "group p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4",
                          step.completed
                            ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                            : "bg-white border-border hover:border-primary/30 hover:shadow-md"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          step.completed ? "bg-primary text-primary-foreground" : "bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className="font-semibold text-foreground text-sm truncate">{step.title}</h3>
                            {step.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{step.description}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-4 px-1">Accès rapide</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { title: 'Tendances', subtitle: 'Nouveautés', href: '/trends', icon: TrendingUp },
                    { title: 'Sourcing', subtitle: 'Usines', href: '/sourcing', icon: Factory },
                    { title: 'Spy Tool', subtitle: 'Concurrents', href: '/brands/analyze', icon: Search },
                    { title: 'Guide', subtitle: 'Lancement', href: '/launch-map', icon: Rocket },
                  ].map((action) => (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 group flex flex-col items-center text-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/5 group-hover:text-primary">
                        <action.icon className="w-6 h-6 text-gray-600 group-hover:text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{action.title}</h4>
                        <p className="text-xs text-muted-foreground">{action.subtitle}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Community & Calendar & Shopify) */}
            <div className="space-y-8">
              {/* Shopify / Next Step */}
              {!launchMap?.shopifyShopDomain && (
                <div className="bg-gradient-to-br from-[#95BF47] to-[#5E8E3E] rounded-3xl shadow-lg p-6 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg">Boutique Shopify</h3>
                    </div>
                    <p className="text-sm text-white/90">
                      Connectez votre boutique pour commencer à vendre.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link href="https://www.shopify.com/fr-fr/start" target="_blank">
                        <Button className="w-full bg-white text-[#5E8E3E] hover:bg-white/90 border-none font-semibold shadow-sm">
                          Créer mon compte
                        </Button>
                      </Link>
                      <Link href="/launch-map/phase/7">
                        <Button variant="ghost" className="w-full text-white hover:bg-white/10 h-9">
                          Déjà un compte ?
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Calendar */}
              <div className="bg-white rounded-3xl shadow-sm border border-border/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Cette semaine
                  </h2>
                  <Link href="/launch-map/calendar" className="text-xs text-primary font-medium hover:underline">
                    Voir tout
                  </Link>
                </div>

                {weekEvents.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-muted-foreground">Rien de prévu 😴</p>
                    <Button variant="ghost" className="text-xs h-auto p-0 mt-1 underline">Ajouter un post</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {weekEvents.map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/20 transition-colors">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{ev.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{ev.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instagram Community */}
              {process.env.NEXT_PUBLIC_INSTAGRAM_GROUP_URL && (
                <div className="bg-gradient-to-tr from-purple-600 to-pink-600 rounded-3xl shadow-lg p-6 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-1">Le Cercle OUTFITY</h3>
                    <p className="text-sm text-white/90 mb-4">Rejoignez l'élite des créateurs.</p>
                    <Link href={process.env.NEXT_PUBLIC_INSTAGRAM_GROUP_URL} target="_blank">
                      <Button size="sm" variant="secondary" className="w-full bg-white text-purple-600 hover:bg-gray-100 border-none">
                        Rejoindre maintenant
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
