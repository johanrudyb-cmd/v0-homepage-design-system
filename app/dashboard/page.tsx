import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardRefresh } from '@/components/dashboard/DashboardRefresh';
import { DashboardNotifications } from '@/components/dashboard/DashboardNotifications';
import { getWeekEvents } from '@/lib/calendar-week-events';

export default async function DashboardPage() {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    redirect('/auth/signin');
  }
  if (!user) {
    redirect('/auth/signin');
  }

  let brand;
  try {
    // Récupérer la marque la plus récente (celle de l'onboarding ou la dernière créée)
    brand = await prisma.brand.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
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
          phase1: false,
          phase2: false,
          phase3: false,
          phase4: false,
          phase5: false,
        },
      });
    }

    // Récupérer le Launch Map pour vérifier la progression
    const launchMap = await prisma.launchMap.findUnique({
      where: { brandId: brand.id },
    });

    // Vérifier si l'identité est complète
    const hasIdentity = !!(brand.logo || brand.colorPalette || brand.typography);

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

    // Convertir en array et formater les dates (formatage déterministe pour éviter les erreurs d'hydratation)
    const chartData = Array.from(chartDataMap.entries()).map(([date, data]) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return {
        date: `${day}/${month}`,
        designs: data.designs,
        quotes: data.quotes,
        ugc: data.ugc,
      };
    });

    // Calculer la progression réelle selon le nouveau parcours
    const steps = [
    {
      id: 0,
      title: 'Définissez l\'identité de votre marque',
      description:
        'Nom de la marque, produit principal et style guide pour créer votre identité visuelle.',
      completed: hasIdentity || false,
      href: '/launch-map',
    },
    {
      id: 1,
      title: 'Calquez votre stratégie marketing',
      description:
        'Choisissez une grande marque dans votre style et calquez sa stratégie pour votre marque.',
      completed: launchMap?.phase1 || false,
      href: '/launch-map',
    },
    {
      id: 2,
      title: 'Calculez la rentabilité par vêtement',
      description:
        'Définissez votre prix de vente, coût de production et frais marketing pour calculer votre marge nette.',
      completed: launchMap?.phase2 || false,
      href: '/launch-map',
    },
    {
      id: 3,
      title: 'Créez votre mockup avec l\'IA',
      description:
        'Apprenez à créer votre design et téléchargez votre pack de mockup professionnel.',
      completed: launchMap?.phase3 || false,
      href: '/launch-map',
    },
    {
      id: 4,
      title: 'Générez votre Tech Pack',
      description:
        'Transformez votre mockup en tech pack et définissez les dimensions du vêtement.',
      completed: launchMap?.phase4 || false,
      href: '/launch-map',
    },
    {
      id: 5,
      title: 'Contactez des usines pour la production',
      description:
        'Explorez le Sourcing Hub pour trouver des fournisseurs qualifiés et obtenez des devis.',
      completed: launchMap?.phase5 || false,
      href: '/launch-map',
    },
    {
      id: 6,
      title: 'Créez votre contenu marketing',
      description:
        'Générez des posts structurés (accroche, corps, CTA, hashtags) par IA et planifiez-les dans le calendrier.',
      completed: launchMap?.phase6 || false,
      href: '/launch-map',
    },
    {
      id: 7,
      title: 'Lancez votre boutique Shopify',
      description:
        'Connectez votre compte Shopify pour créer et lancer votre boutique en ligne.',
      completed: launchMap?.phase7 || false,
      href: '/launch-map',
    },
    ];

    const completedSteps = steps.filter((s) => s.completed).length;

    const weekEvents = getWeekEvents(launchMap?.contentCalendar ?? null);

    const quickActions = [
      {
      title: 'Tendances de la semaine',
      description: 'Nouveautés chaque semaine — ne vous désabonnez pas',
      href: '/trends',
    },
    {
      title: 'Analyse de marque & tendances',
      description: 'Analyse IA de marques et analyseur de tendances',
      href: '/brands/analyze',
    },
    {
      title: 'Sourcing Hub',
      description: 'Trouvez des usines qualifiées',
      href: '/sourcing',
    },
    {
      title: 'Gérer ma marque',
      description: 'Guide complet de lancement',
      href: '/launch-map',
    },
    ];

    return (
      <DashboardLayout>
        <div className="min-h-screen">
          <div className="px-12 py-16 max-w-7xl mx-auto space-y-12" data-tour="tour-dashboard-content">
          {/* Welcome Section */}
          <div className="flex items-end justify-between pb-8 animate-slide-in-down">
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-semibold tracking-tight text-[#1D1D1F]">
                {user.name || 'Utilisateur'}
              </h1>
              <p className="text-xl text-[#1D1D1F]/70">
                Créez votre marque de vêtements de A à Z avec l'intelligence artificielle.
              </p>
            </div>
            <DashboardRefresh />
          </div>

        {/* Notifications : affichage via la cloche uniquement (DashboardNotifications ne rend rien) */}
        <DashboardNotifications />

          {/* Stats Section - Cards Squircle avec espace */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-stagger">
            <div className="bg-white rounded-3xl shadow-apple p-8">
              <div className="text-sm text-[#1D1D1F]/60 mb-3">Designs créés</div>
              <div className="text-5xl font-semibold tracking-tight text-[#1D1D1F]">{designCount}</div>
            </div>
            <div className="bg-white rounded-3xl shadow-apple p-8">
              <div className="text-sm text-[#1D1D1F]/60 mb-3">Devis envoyés</div>
              <div className="text-5xl font-semibold tracking-tight text-[#1D1D1F]">{quoteCount}</div>
            </div>
            <div className="bg-white rounded-3xl shadow-apple p-8">
              <div className="text-sm text-[#1D1D1F]/60 mb-3">Contenus UGC</div>
              <div className="text-5xl font-semibold tracking-tight text-[#1D1D1F]">{ugcCount}</div>
            </div>
            <div className="bg-white rounded-3xl shadow-apple p-8">
              <div className="text-sm text-[#1D1D1F]/60 mb-3">Progression</div>
              <div className="text-5xl font-semibold tracking-tight text-[#1D1D1F]">{completedSteps} / {steps.length}</div>
            </div>
          </div>

          {/* Groupe Instagram */}
          {process.env.NEXT_PUBLIC_INSTAGRAM_GROUP_URL && (
            <div className="bg-white rounded-3xl shadow-apple p-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-3xl font-semibold tracking-tight text-[#1D1D1F]">Rejoignez notre groupe Instagram</h3>
                  <p className="text-lg text-[#1D1D1F]/70">
                    Actus business, conseils exclusifs, tendances mode et accompagnement pour lancer votre marque.
                  </p>
                </div>
                <Link href={process.env.NEXT_PUBLIC_INSTAGRAM_GROUP_URL} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary">
                    Rejoindre le groupe
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Activité récente - Détails clairs */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-3xl shadow-apple p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] mb-2">Activité récente</h2>
                <p className="text-lg text-[#1D1D1F]/70">Vos créations et actions des 7 derniers jours</p>
              </div>
              <div className="space-y-4">
                {chartData.slice(-7).reverse().map((item, idx) => {
                  const currentValue = item.designs + item.quotes + item.ugc;
                  const hasActivity = currentValue > 0;
                  
                  if (!hasActivity) {
                    return (
                      <div key={idx} className="flex items-center justify-between py-3 border-b border-black/5 last:border-b-0">
                        <span className="text-base text-[#1D1D1F]/40">{item.date}</span>
                        <span className="text-sm text-[#1D1D1F]/40">Aucune activité</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={idx} className="flex items-center justify-between py-4 border-b border-black/5 last:border-b-0">
                      <div className="flex items-center gap-4">
                        <span className="text-base font-medium text-[#1D1D1F] min-w-[80px]">{item.date}</span>
                        <div className="flex items-center gap-4">
                          {item.designs > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#1D1D1F]/60">Designs</span>
                              <span className="text-base font-semibold text-[#1D1D1F]">{item.designs}</span>
                            </div>
                          )}
                          {item.quotes > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#1D1D1F]/60">Devis</span>
                              <span className="text-base font-semibold text-[#1D1D1F]">{item.quotes}</span>
                            </div>
                          )}
                          {item.ugc > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#1D1D1F]/60">Contenus UGC</span>
                              <span className="text-base font-semibold text-[#1D1D1F]">{item.ugc}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-[#007AFF]">
                        {currentValue} {currentValue > 1 ? 'actions' : 'action'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Événements de la semaine */}
          <div className="bg-white rounded-3xl shadow-apple p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] mb-2">Événements de la semaine</h2>
                <p className="text-lg text-[#1D1D1F]/70">Tournages, posts et contenus planifiés</p>
              </div>
              <Link href="/launch-map/calendar">
                <Button variant="outline">
                  Ouvrir le calendrier
                </Button>
              </Link>
            </div>
            {weekEvents.length === 0 ? (
              <p className="text-lg text-[#1D1D1F]/60">
                Aucun événement cette semaine. Planifiez vos tournages et posts dans le calendrier contenu.
              </p>
            ) : (
              <ul className="space-y-0 divide-y divide-black/5">
                {weekEvents.map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between gap-6 py-6">
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-[#1D1D1F] mb-1">{ev.title}</p>
                      <p className="text-sm text-[#1D1D1F]/60">
                        {ev.type === 'tournage' ? 'Tournage' : ev.type === 'post' ? 'Post-production' : 'Contenu / Script'}
                        {' · '}
                        {ev.start.includes('T') && ev.start.length >= 16
                          ? `${ev.start.slice(0, 10)} à ${ev.start.slice(11, 16).replace(':', 'h')}`
                          : ev.start.slice(0, 10)}
                      </p>
                    </div>
                    <Link href="/launch-map/calendar">
                      <Button variant="ghost">Voir</Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Shopify Account Creation Banner */}
          {!launchMap?.phase7 && (
            <div className="bg-gradient-to-br from-[#95BF47] to-[#5E8E3E] rounded-3xl shadow-apple-lg p-10">
              <div className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  {/* Logo Shopify */}
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-apple p-3">
                    <Image 
                      src="/shopify-logo.png" 
                      alt="Shopify" 
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-semibold tracking-tight text-white">
                      Créez votre boutique Shopify
                    </h3>
                    <p className="text-lg text-white/90">
                      Lancez votre boutique en ligne et commencez à vendre vos créations. Connectez votre compte Shopify pour finaliser votre marque.
                    </p>
                  </div>
                </div>
                <Link href="/launch-map">
                  <Button className="bg-white text-[#1D1D1F] hover:bg-white/90 font-semibold h-12 px-8 text-base shadow-apple">
                    Créer mon compte Shopify
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Progress Section */}
          <div className="bg-white rounded-3xl shadow-apple p-10">
            <div className="flex items-end justify-between mb-10 pb-8 border-b border-black/5">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] mb-2">Votre parcours vers votre première marque</h2>
                <p className="text-lg text-[#1D1D1F]/70">
                  {completedSteps} phases sur {steps.length} complétées
                </p>
              </div>
              <span className="text-5xl font-semibold tracking-tight text-[#1D1D1F]">
                {Math.round((completedSteps / steps.length) * 100)}%
              </span>
            </div>
            <div className="space-y-0 divide-y divide-black/5">
              {steps.map((step, index) => {
                return (
                  <Link
                    key={step.id}
                    href={step.href}
                    className="flex items-start gap-6 py-8 transition-colors hover:bg-black/5 first:rounded-t-3xl last:rounded-b-3xl -mx-10 px-10 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mt-1">
                      {step.completed ? (
                        <div className="w-3 h-3 bg-[#1D1D1F] rounded-full"></div>
                      ) : (
                        <div className="w-3 h-3 border-2 border-[#1D1D1F]/20 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-[#1D1D1F] mb-2 group-hover:text-[#007AFF] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-base text-[#1D1D1F]/70 leading-relaxed">{step.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Create Brand CTA */}
          {(!brand || (!brand.logo && !brand.colorPalette)) && (
            <div className="bg-white rounded-3xl shadow-apple p-10">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <h3 className="text-3xl font-semibold tracking-tight text-[#1D1D1F]">
                    {!brand ? 'Créez votre première marque' : 'Complétez l\'identité de votre marque'}
                  </h3>
                  <p className="text-lg text-[#1D1D1F]/70">
                    {!brand 
                      ? 'Définissez votre identité (nom, logo, couleurs) et lancez votre marque'
                      : 'Définissez le nom, logo et identité visuelle de votre marque pour commencer'}
                  </p>
                </div>
                <Link href="/brands/create">
                  <Button>
                    {!brand ? 'Gérer ma marque' : 'Compléter l\'identité'}
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions - Espacement aéré */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] mb-2">Accès rapide aux outils</h2>
              <p className="text-lg text-[#1D1D1F]/70">
                Tous les outils dont vous avez besoin pour créer et lancer votre marque
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => {
                return (
                  <Link key={action.href} href={action.href} className="bg-white rounded-3xl shadow-apple p-8 hover:shadow-apple-lg transition-all group">
                    <h3 className="text-xl font-semibold text-[#1D1D1F] mb-2 group-hover:text-[#007AFF] transition-colors">{action.title}</h3>
                    <p className="text-base text-[#1D1D1F]/70">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
    );
  } catch (err) {
    throw err;
  }
}
