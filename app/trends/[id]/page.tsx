import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductDetails } from '@/components/trends/ProductDetails';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  const product = await prisma.trendProduct.findUnique({
    where: { id },
  });

  if (!product) {
    redirect('/trends');
  }

  // Vérifier si le favori existe
  let favorite = null;
  try {
    favorite = await prisma.productFavorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
    });
  } catch (error) {
    // Si le modèle n'existe pas encore, on continue sans favori
    console.warn('ProductFavorite model not available yet:', error);
  }

  return (
    <DashboardLayout>
      <div className="p-10">
        <div className="mb-6">
          <Link href="/trends">
            <Button
              variant="outline"
              className="mb-4 border-stone-300 text-stone-700 font-light text-xs"
            >
              ← Retour à Tendances & Hits
            </Button>
          </Link>
        </div>

        <ProductDetails product={product} userId={user.id} isFavorite={!!favorite} />
      </div>
    </DashboardLayout>
  );
}
