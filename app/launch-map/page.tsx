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

  // Vérifier si l'identité existe
  const hasIdentity = Boolean(brand.logo && brand.colorPalette);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-1">
                Créer ma marque
              </h1>
              <p className="text-muted-foreground text-sm">
                Guidez <span className="font-medium text-primary">{brand.name}</span> de l'idée à la vente
              </p>
            </div>
          </div>
        </div>

        <LaunchMapStepper brandId={brand.id} launchMap={brand.launchMap} brand={brand} hasIdentity={hasIdentity} />
      </div>
    </DashboardLayout>
  );
}
