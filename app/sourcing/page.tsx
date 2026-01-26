import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SourcingHub } from '@/components/sourcing/SourcingHub';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShoppingBag } from 'lucide-react';

export default async function SourcingPage() {
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

  // Récupérer les devis envoyés
  const quotes = await prisma.quote.findMany({
    where: { brandId: brand.id },
    include: { factory: true },
  });

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-modern">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Sourcing Hub
              </h1>
              <p className="text-muted-foreground font-medium text-lg mt-1">
                Trouvez les usines qualifiées pour produire vos vêtements
              </p>
            </div>
          </div>
        </div>

        <SourcingHub brandId={brand.id} sentQuotes={quotes} />
      </div>
    </DashboardLayout>
  );
}
