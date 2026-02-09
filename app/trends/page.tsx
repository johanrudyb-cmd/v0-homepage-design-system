import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TendancesContent } from '@/components/trends/TendancesContent';
import { TrendsSubNav } from '@/components/trends/TrendsSubNav';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Tendances de la semaine',
  description: 'Les tendances sont mises à jour chaque semaine. Tendances par marché.',
};

export default async function TrendsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout>
      <div className="px-12 py-16 max-w-7xl mx-auto space-y-16">
        <TrendsSubNav active="classement" />
        <TendancesContent />
      </div>
    </DashboardLayout>
  );
}
