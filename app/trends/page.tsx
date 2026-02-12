import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TendancesContent } from '@/components/trends/TendancesContent';
import { TrendsSubNav } from '@/components/trends/TrendsSubNav';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Tendances de la semaine',
  description: 'Les tendances sont mises à jour chaque semaine pour vous offrir une vision claire du marché.',
};

export default async function TrendsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto space-y-8 sm:space-y-12 lg:space-y-16">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] mb-4">
            Tendances de la semaine
          </h1>
          <p className="text-[#6e6e73] text-lg max-w-2xl">
            Découvrez les produits et styles qui performent actuellement sur les marchés européens.
          </p>
        </div>
        <TrendsSubNav active="classement" />
        <TendancesContent />
      </div>
    </DashboardLayout>
  );
}
