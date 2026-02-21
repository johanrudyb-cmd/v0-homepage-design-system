import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TrendsPageLayout } from '@/components/trends/TrendsPageLayout';
import MarketTicker from '@/components/trends/MarketTicker';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { getHybridRadarTrends } from '@/lib/trends-data';

export const metadata = {
  title: 'Elite Radar — Analyse de Styles IA',
  description: 'Analyse prédictive des tendances mode en temps réel via Outfity Intelligence.',
};

export default async function TrendsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  // Pré-charger les tendances par défaut (18-24 Homme par exemple) pour affichage instantané
  const initialData = await getHybridRadarTrends({
    segment: 'homme',
    ageRange: '18-24',
    sortBy: 'best',
    limit: 60
  });

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Ticker Live en haut */}
        <MarketTicker />

        {/* Nouvelle Vue Catalogue Intelligent */}
        <TrendsPageLayout initialData={initialData} />
      </div>
    </DashboardLayout>
  );
}
