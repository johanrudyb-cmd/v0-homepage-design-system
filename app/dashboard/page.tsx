import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

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
        'Définissez votre prix de vente, coût de production et frais marketing pour calculer votre marge nette et valider la viabilité de votre projet.',
      completed: true,
      action: null,
    },
    {
      id: 2,
      title: 'Créez votre premier design avec l\'IA',
      description:
        'Utilisez le Design Studio IA pour générer votre premier tech pack professionnel : flat sketch et liste des composants (tissu, bord-côte, étiquettes, etc.).',
      completed: true,
      action: null,
    },
    {
      id: 3,
      title: 'Contactez des usines pour la production',
      description:
        'Explorez le Sourcing Hub pour trouver des fournisseurs qualifiés et envoyez votre tech pack à au moins 2 usines pour obtenir des devis.',
      completed: false,
      action: { label: 'Explorer les usines', href: '/sourcing' },
    },
    {
      id: 4,
      title: 'Générez vos scripts marketing UGC',
      description:
        'Créez vos premiers scripts de clips UGC avec l\'IA pour promouvoir votre marque sur TikTok et Instagram.',
      completed: false,
      action: { label: 'Générer des scripts', href: '/ugc' },
    },
  ];

  const completedSteps = steps.filter((s) => s.completed).length;

  const quickActions = [
    {
      title: 'Design Studio IA',
      description: 'Générez des tech packs professionnels',
      href: '/brands/new',
      icon: 'design',
    },
    {
      title: 'Tendances & Hits',
      description: 'Découvrez les produits gagnants du moment',
      href: '/trends',
      icon: 'trends',
    },
    {
      title: 'Brand Spy',
      description: 'Analysez vos concurrents',
      href: '/spy',
      icon: 'spy',
    },
    {
      title: 'Sourcing Hub',
      description: 'Trouvez des usines qualifiées',
      href: '/sourcing',
      icon: 'sourcing',
    },
    {
      title: 'UGC AI Lab',
      description: 'Créez votre contenu marketing',
      href: '/ugc',
      icon: 'ugc',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl space-y-12">
        {/* Welcome Section - Style Mode */}
        <div className="space-y-3">
          <h1 className="text-4xl font-light tracking-wide text-stone-900">
            Bienvenue sur SaaS Mode
          </h1>
          <p className="text-lg text-stone-600 font-light max-w-2xl">
            Créez votre marque de vêtements de A à Z avec l'intelligence artificielle. 
            Design, sourcing, marketing - tout automatisé pour vous.
          </p>
        </div>

        {/* Action Plan - Launch Map selon PRD */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light tracking-wide text-stone-900 mb-2">
                Votre parcours vers votre première marque
              </h2>
              <p className="text-stone-500 text-sm font-light">
                {completedSteps} phases sur {steps.length} complétées
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-40 h-1 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700"
                  style={{ width: `${(completedSteps / steps.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-light text-stone-600 min-w-[3rem]">
                {Math.round((completedSteps / steps.length) * 100)}%
              </span>
            </div>
          </div>

          {/* Steps - Disposition Verticale Élégante */}
          <div className="grid gap-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="relative flex items-start gap-6 p-8 bg-white border border-stone-200 rounded-lg hover:border-amber-300 hover:shadow-lg transition-all group"
              >
                {/* Ligne de connexion verticale */}
                {index < steps.length - 1 && (
                  <div className="absolute left-11 top-20 w-px h-full bg-stone-200 group-hover:bg-amber-200 transition-colors" />
                )}

                {/* Indicateur d'étape */}
                <div className="flex-shrink-0 relative z-10">
                  {step.completed ? (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md border-2 border-white">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-stone-300 flex items-center justify-center bg-stone-50 group-hover:border-amber-400 transition-colors">
                      <div className="w-6 h-6 rounded-full border-2 border-stone-400 group-hover:border-amber-500" />
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="font-light text-lg text-stone-900 mb-2 tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-sm text-stone-600 font-light leading-relaxed mb-4">
                    {step.description}
                  </p>
                  {step.action && (
                    <Link href={step.action.href}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs px-6 py-2.5 border border-stone-800"
                      >
                        {step.action.label}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Modules selon PRD */}
        <div className="space-y-4">
          <h2 className="text-xl font-light tracking-wide text-stone-900">
            Accès rapide aux outils
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="hover:shadow-xl transition-all border border-stone-200 hover:border-amber-300 bg-white h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-light tracking-wide text-stone-900">
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-stone-500 text-sm font-light">
                      {action.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Trial Banner - Style Mode Minimaliste */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-lg p-8 flex items-center justify-between border border-stone-700 shadow-xl">
          <div className="space-y-1">
            <p className="font-light text-xl tracking-wide">
              Votre essai gratuit se termine dans 3 jours
            </p>
            <p className="text-stone-300 text-sm font-light">
              Débloquez toutes les fonctionnalités premium : designs illimités, sourcing avancé, marketing automatisé
            </p>
          </div>
          <Button
            variant="primary"
            className="bg-amber-600 hover:bg-amber-700 text-white font-light tracking-wide uppercase text-xs px-8 py-3 border-0 shadow-lg"
          >
            Débloquer l'accès complet
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
