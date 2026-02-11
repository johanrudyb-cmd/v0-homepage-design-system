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

  const steps = [
    { id: 0, title: 'Définissez l\'identité de votre marque', description: 'Nom de la marque, produit principal et style guide.', completed: hasIdentity, href: '/launch-map' },
    { id: 1, title: 'Calquez votre stratégie marketing', description: 'Calquez les meilleures marques de votre style.', completed: !!launchMap?.phase1, href: '/launch-map' },
    { id: 3, title: 'Créez votre mockup avec l\'IA', description: 'Téléchargez votre pack de mockup professionnel.', completed: !!launchMap?.phase3, href: '/launch-map' },
    { id: 4, title: 'Générez votre Tech Pack', description: 'Transformez votre mockup en dossier technique.', completed: !!launchMap?.phase4, href: '/launch-map' },
    { id: 5, title: 'Sourcing usines', description: 'Trouvez des fournisseurs et obtenez des devis.', completed: !!launchMap?.phase5, href: '/launch-map' },
    { id: 7, title: 'Lancez votre boutique Shopify', description: 'Connectez votre boutique pour vendre.', completed: !!launchMap?.phase7, href: '/launch-map' },
  ];

  const completedSteps = steps.filter(s => s.completed).length;

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto space-y-8 sm:space-y-12">

          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 sm:pb-8 animate-slide-in-down">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-[#1D1D1F]">
                Hello, {user.name?.split(' ')[0] || 'Utilisateur'}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-[#1D1D1F]/70 font-medium">
                Voici l&apos;avancée de <span className="text-[#1D1D1F] font-bold">{brand.name}</span> aujourd&apos;hui.
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
          {user.plan !== 'free' && <StrategyUpdateBanner />}

          {/* Shopify Creation Panel */}
          {!launchMap?.shopifyShopDomain && (
            <div className="bg-gradient-to-br from-[#95BF47] to-[#5E8E3E] rounded-3xl shadow-apple-lg p-6 sm:p-10 text-white relative overflow-hidden group">
              {/* Cercle décoratif */}
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-apple p-3">
                    <Image
                      src="/shopify-logo.png"
                      alt="Shopify"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                      Créez votre boutique Shopify
                    </h3>
                    <p className="text-base sm:text-lg text-white/90 max-w-xl">
                      Lancez votre boutique en ligne et commencez à vendre vos créations. C&apos;est l&apos;étape finale pour valider votre marque.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0 mt-4 lg:mt-0">
                  <Link href="https://www.shopify.com/fr-fr/start" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button className="w-full bg-white text-[#1D1D1F] hover:bg-white/90 font-semibold h-12 px-8 text-base shadow-apple">
                      Créer mon compte Shopify
                    </Button>
                  </Link>
                  <Link href="/launch-map/phase/7" className="w-full sm:w-auto">
                    <Button variant="ghost" className="w-full text-white hover:bg-white/10 h-12 px-6 font-medium">
                      J&apos;ai déjà une boutique
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Instagram Group */}
          {process.env.NEXT_PUBLIC_INSTAGRAM_GROUP_URL && (
            <div className="bg-white rounded-3xl shadow-apple p-6 sm:p-10 border border-black/5 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F]">Le Cercle OUTFITY</h3>
                  <p className="text-base sm:text-lg text-[#1D1D1F]/70">
                    Rejoignez les autres créateurs sur Instagram pour des conseils exclusifs.
                  </p>
                </div>
                <Link href={process.env.NEXT_PUBLIC_INSTAGRAM_GROUP_URL} target="_blank" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full h-12 px-8">Rejoindre le groupe</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Journey Progress */}
          <div className="bg-white rounded-3xl shadow-apple p-6 sm:p-10 border border-black/5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-black/5">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F] mb-1">Votre Parcours</h2>
                <p className="text-base sm:text-lg text-[#1D1D1F]/70">
                  {completedSteps} phases sur {steps.length} complétées
                </p>
              </div>
              <span className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1D1D1F] text-center">
                {Math.round((completedSteps / steps.length) * 100)}%
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {steps.map((step) => (
                <Link key={step.id} href={step.href} className="group p-5 sm:p-6 rounded-2xl hover:bg-black/5 transition-colors border border-black/5 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${step.completed ? 'text-[#007AFF]' : 'text-gray-400'}`}>
                      {step.completed ? 'Complété' : 'À Faire'}
                    </span>
                    {step.completed && <div className="w-2 h-2 bg-[#007AFF] rounded-full shadow-[0_0_8px_rgba(0,122,255,0.5)]" />}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors line-clamp-1">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-[#1D1D1F]/60 mt-1 line-clamp-2">{step.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Events & Calendar */}
          <div className="bg-white rounded-3xl shadow-apple p-8 sm:p-10 border border-black/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F]">Calendrier de la semaine</h2>
              <Link href="/launch-map/calendar">
                <Button variant="ghost">Voir tout</Button>
              </Link>
            </div>
            {weekEvents.length === 0 ? (
              <p className="text-[#1D1D1F]/60 py-4">Aucun événement planifié cette semaine.</p>
            ) : (
              <div className="space-y-4">
                {weekEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-semibold">{ev.title}</p>
                      <p className="text-xs text-gray-500 uppercase font-bold">{ev.type}</p>
                    </div>
                    <Link href="/launch-map/calendar">
                      <Button variant="outline" size="sm">Détails</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/trends" className="bg-white p-6 rounded-3xl shadow-apple border border-black/5 hover:bg-[#F5F5F7] transition-all duration-300 group">
              <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors text-lg">Tendances</h4>
              <p className="text-sm text-gray-500">Nouveautés de la semaine</p>
            </Link>
            <Link href="/sourcing" className="bg-white p-6 rounded-3xl shadow-apple border border-black/5 hover:bg-[#F5F5F7] transition-all duration-300 group">
              <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors text-lg">Sourcing</h4>
              <p className="text-sm text-gray-500">Trouvez vos usines</p>
            </Link>
            <Link href="/brands/analyze" className="bg-white p-6 rounded-3xl shadow-apple border border-black/5 hover:bg-[#F5F5F7] transition-all duration-300 group">
              <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors text-lg">Spy Tool</h4>
              <p className="text-sm text-gray-500">Analysez vos concurrents</p>
            </Link>
            <Link href="/launch-map" className="bg-white p-6 rounded-3xl shadow-apple border border-black/5 hover:bg-[#F5F5F7] transition-all duration-300 group">
              <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors text-lg">Lancement</h4>
              <p className="text-sm text-gray-500">Guide complet</p>
            </Link>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
