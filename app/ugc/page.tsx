import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UGCLab } from '@/components/ugc/UGCLab';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Sparkles } from 'lucide-react';

export default async function UGCPage() {
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

  // Récupérer les designs pour Virtual Try-On
  const designs = await prisma.design.findMany({
    where: { brandId: brand.id, status: 'completed' },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shadow-modern">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                UGC AI Lab
              </h1>
              <p className="text-muted-foreground font-medium text-lg mt-1">
                Générez votre contenu marketing avec l'IA : Virtual Try-On et scripts UGC
              </p>
            </div>
          </div>
        </div>

        <UGCLab brandId={brand.id} brandName={brand.name} designs={designs} />
      </div>
    </DashboardLayout>
  );
}
