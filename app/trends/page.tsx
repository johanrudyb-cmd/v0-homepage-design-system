import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TrendsGallery } from '@/components/trends/TrendsGallery';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TrendingUp } from 'lucide-react';

export default async function TrendsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  // Récupérer les produits favoris de l'utilisateur
  let favoriteIds: string[] = [];
  try {
    const favorites = await prisma.productFavorite.findMany({
      where: { userId: user.id },
      select: { productId: true },
    });
    favoriteIds = favorites.map((f) => f.productId);
  } catch (error) {
    // Si le modèle n'existe pas encore, on continue sans favoris
    console.warn('ProductFavorite model not available yet:', error);
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-modern">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Tendances & Hits
              </h1>
              <p className="text-muted-foreground font-medium text-lg mt-1">
                Découvrez les produits "winners" du moment et identifiez les opportunités
              </p>
            </div>
          </div>
        </div>

        <TrendsGallery userId={user.id} favoriteIds={favoriteIds} />
      </div>
    </DashboardLayout>
  );
}
