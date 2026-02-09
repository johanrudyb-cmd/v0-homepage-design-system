import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { BrandsContent } from '@/components/brands/BrandsContent';

export const metadata = {
  title: 'Marques tendances',
  description: 'Les marques les plus tendances de la semaine. Cliquez pour voir leurs produits ou aller sur leur site.',
};

export default async function BrandsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout>
      <div className="px-12 py-16 max-w-7xl mx-auto space-y-16">
        <BrandsContent />
      </div>
    </DashboardLayout>
  );
}
