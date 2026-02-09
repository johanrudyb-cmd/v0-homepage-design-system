import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ContentCalendarView } from '@/components/launch-map/ContentCalendarView';
import Link from 'next/link';

export default async function LaunchMapCalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');

  const brand = await prisma.brand.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { launchMap: true },
  });

  if (!brand) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Aucune marque. Créez une marque depuis la vue d&apos;ensemble.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendrier contenu</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Créneaux de tournage, post-production, scripts et CTA vers l&apos;UGC. Planifiez votre stratégie de contenu.
          </p>
        </div>
        <Link
          href="/launch-map"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Retour à la vue d&apos;ensemble
        </Link>
      </div>
      <ContentCalendarView
        brandId={brand.id}
        brandName={brand.name}
        allPhasesDone={
          Boolean(brand.name && brand.name.trim().length >= 2) &&
          Boolean(brand.launchMap?.phase1) &&
          Boolean(brand.launchMap?.phase2) &&
          Boolean(brand.launchMap?.phase3) &&
          Boolean(brand.launchMap?.phase4) &&
          Boolean(brand.launchMap?.phase5) &&
          Boolean(brand.launchMap?.phase6)
        }
      />
    </div>
  );
}
