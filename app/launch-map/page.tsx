import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LaunchMapStepper } from '@/components/launch-map/LaunchMapStepper';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Map } from 'lucide-react';

export default async function LaunchMapPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  // Récupérer ou créer une marque par défaut pour l'utilisateur
  let brand = await prisma.brand.findFirst({
    where: { userId: user.id },
    include: { launchMap: true },
  });

  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        userId: user.id,
        name: 'Ma Première Marque',
        launchMap: {
          create: {
            phase1: false,
            phase2: false,
            phase3: false,
            phase4: false,
          },
        },
      },
      include: { launchMap: true },
    });
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-modern">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Launch Map
              </h1>
              <p className="text-muted-foreground font-medium text-lg mt-1">
                Guidez votre marque <span className="font-bold text-primary">{brand.name}</span> de l'idée à la vente
              </p>
            </div>
          </div>
        </div>

        <LaunchMapStepper brandId={brand.id} launchMap={brand.launchMap} />
      </div>
    </DashboardLayout>
  );
}
