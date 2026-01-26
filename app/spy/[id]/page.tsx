import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AnalysisResult } from '@/components/spy/AnalysisResult';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  const analysis = await prisma.brandSpyAnalysis.findFirst({
    where: { id, userId: user.id },
  });

  if (!analysis) {
    redirect('/spy');
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/spy">
            <Button
              variant="outline"
              className="mb-4 border-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à Brand Spy
            </Button>
          </Link>
        </div>

        <AnalysisResult analysis={analysis as any} />
      </div>
    </DashboardLayout>
  );
}
