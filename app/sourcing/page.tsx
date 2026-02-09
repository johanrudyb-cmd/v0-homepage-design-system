import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SourcingHub } from '@/components/sourcing/SourcingHub';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShoppingBag } from 'lucide-react';

export default async function SourcingPage({
  searchParams,
}: {
  searchParams: Promise<{ trend?: string; productType?: string; material?: string; autoFilter?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  const params = await searchParams;
  let trendData = null;
  let autoFilterData = null;
  
  if (params.trend) {
    try {
      trendData = JSON.parse(decodeURIComponent(params.trend));
    } catch (error) {
      console.error('Erreur parsing trend data:', error);
    }
  }

  if (params.autoFilter === 'true' && (params.productType || params.material)) {
    autoFilterData = {
      productType: params.productType || null,
      material: params.material || null,
    };
  }

  // Récupérer la marque la plus récente
  let brand = await prisma.brand.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
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

  // Fournisseurs favoris (après prisma generate + db push)
  let favoriteFactoryIds: string[] = [];
  try {
    const favoriteFactories = await prisma.brandFavoriteFactory.findMany({
      where: { brandId: brand.id },
      select: { factoryId: true },
    });
    favoriteFactoryIds = favoriteFactories.map((f) => f.factoryId);
  } catch (e) {
    console.warn('Favorite factories not available (run: npx prisma generate && npx prisma db push):', e);
  }

  // Récupérer les préférences utilisateur
  let preferences = null;
  try {
    preferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });
  } catch (error) {
    console.warn('UserPreferences not available yet:', error);
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-1">
                Sourcing
              </h1>
              <p className="text-muted-foreground text-sm">
                Trouvez les meilleures usines pour produire vos créations
              </p>
            </div>
          </div>
        </div>

        <SourcingHub 
          brandId={brand.id} 
          sentQuotes={quotes} 
          favoriteFactoryIds={favoriteFactoryIds}
          preferences={preferences}
          trendEmailData={trendData}
          autoFilterData={autoFilterData}
        />
      </div>
    </DashboardLayout>
  );
}
