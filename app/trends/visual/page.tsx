import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TrendsSubNav } from '@/components/trends/TrendsSubNav';
import { VisualTrendScanner } from '@/components/trends/VisualTrendScanner';
import MarketTicker from '@/components/trends/MarketTicker';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Analyseur de tendances visuel',
    description: 'Analysez n’importe quel vêtement par image grâce à l’IA Vision et découvrez son potentiel commercial.',
};

export default async function VisualTrendPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/auth/signin');
    }

    return (
        <DashboardLayout>
            <MarketTicker />
            <div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto space-y-8">
                <TrendsSubNav active="analyseur" />
                <VisualTrendScanner />
            </div>
        </DashboardLayout>
    );
}
