import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TechPackVisualView } from '@/components/design-studio/TechPackVisualView';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function DesignTechPackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');

  const { id } = await params;
  const design = await prisma.design.findFirst({
    where: {
      id,
      brand: { userId: user.id },
    },
    include: { brand: true },
  });

  if (!design) notFound();

  const designForView = {
    ...design,
    createdAt: design.createdAt?.toISOString?.() ?? undefined,
    updatedAt: design.updatedAt?.toISOString?.() ?? undefined,
    brand: {
      name: design.brand?.name ?? null,
      logo: design.brand?.logo ?? null,
    },
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <TechPackVisualView design={designForView} />
      </div>
    </DashboardLayout>
  );
}
