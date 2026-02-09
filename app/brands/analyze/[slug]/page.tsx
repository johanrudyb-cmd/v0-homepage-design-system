import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { BrandAnalysisView } from '@/components/brands/BrandAnalysisView';

export const metadata = {
  title: 'Analyse de marque',
  description: 'Rapport d\'analyse IA : positionnement, cible, canaux, pricing, opportunités.',
};

export default async function BrandAnalyzeSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  const { slug } = await params;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <BrandAnalysisView slug={slug} />
      </div>
    </DashboardLayout>
  );
}
