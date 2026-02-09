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

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <TechPackVisualView design={design} />
      </div>
    </DashboardLayout>
  );
}
