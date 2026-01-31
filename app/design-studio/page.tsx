import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DesignStudioForm } from '@/components/design-studio/DesignStudioForm';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Palette } from 'lucide-react';

export default async function DesignStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; cut?: string; material?: string; prompt?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  const params = await searchParams;

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

  // Récupérer les designs existants avec leurs collections
  const designs = await prisma.design.findMany({
    where: { brandId: brand.id },
    include: {
      collection: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50, // Augmenter pour permettre filtrage par collection
  });

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-1">
                Design Studio
              </h1>
              <p className="text-muted-foreground text-sm">
                Créez vos tech packs professionnels avec l'intelligence artificielle
              </p>
            </div>
          </div>
        </div>

        <DesignStudioForm 
          brandId={brand.id} 
          brand={brand} 
          existingDesigns={designs}
          initialData={params.type ? {
            type: params.type,
            cut: params.cut || '',
            material: params.material || '',
            customPrompt: params.prompt ? decodeURIComponent(params.prompt) : '',
          } : undefined}
        />
      </div>
    </DashboardLayout>
  );
}
