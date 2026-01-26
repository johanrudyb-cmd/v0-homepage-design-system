import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DesignStudioForm } from '@/components/design-studio/DesignStudioForm';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Palette } from 'lucide-react';

export default async function DesignStudioPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  // Récupérer ou créer une marque par défaut
  let brand = await prisma.brand.findFirst({
    where: { userId: user.id },
  });

  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        userId: user.id,
        name: 'Ma Première Marque',
      },
    });
  }

  // Récupérer les designs existants
  const designs = await prisma.design.findMany({
    where: { brandId: brand.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-modern">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Design Studio IA
              </h1>
              <p className="text-muted-foreground font-medium text-lg mt-1">
                Générez votre Tech Pack professionnel avec l'IA : flat sketch et liste des composants
              </p>
            </div>
          </div>
        </div>

        <DesignStudioForm brandId={brand.id} existingDesigns={designs} />
      </div>
    </DashboardLayout>
  );
}
