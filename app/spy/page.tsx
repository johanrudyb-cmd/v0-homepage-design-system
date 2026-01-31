import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrandSpy } from '@/components/spy/BrandSpy';
import { TrendCheckCard } from '@/components/trends/TrendCheckCard';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Search } from 'lucide-react';

export default async function SpyPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  // Récupérer l'historique des analyses
  const analyses = await prisma.brandSpyAnalysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      shopifyUrl: true,
      storeName: true,
      category: true,
      estimatedRevenue: true,
      estimatedMonthlyRevenue: true,
      productCount: true,
      country: true,
      createdAt: true,
      stack: true,
      theme: true,
      adStrategy: true,
    },
  });

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-1">
                Analyseur de tendances
              </h1>
              <p className="text-muted-foreground text-sm">
                Analyse tendances & prévisions IA — stratégies des marques qui performent
              </p>
            </div>
          </div>
        </div>

        <TrendCheckCard />

        <BrandSpy 
          userId={user.id} 
          analyses={analyses.map(a => ({
            ...a,
            theme: typeof a.theme === 'string' ? a.theme : (a.theme as any)?.name || null,
            stack: a.stack || {},
            adStrategy: a.adStrategy || {},
          }))} 
        />
      </div>
    </DashboardLayout>
  );
}
