import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TendancesContent } from '@/components/trends/TendancesContent';
import { TrendsSubNav } from '@/components/trends/TrendsSubNav';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export default async function TrendsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <TrendsSubNav active="classement" />
        <TendancesContent />
      </div>
    </DashboardLayout>
  );
}
