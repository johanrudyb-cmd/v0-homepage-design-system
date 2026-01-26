import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrandSpy } from '@/components/spy/BrandSpy';
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
  });

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-modern">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Brand Spy
              </h1>
              <p className="text-muted-foreground font-medium text-lg mt-1">
                Analysez les marques concurrentes pour comprendre leur stratégie
              </p>
            </div>
          </div>
        </div>

        <BrandSpy userId={user.id} analyses={analyses} />
      </div>
    </DashboardLayout>
  );
}
