import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TrendingUp, Search, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductAnalyzeButton } from '@/components/trends/ProductAnalyzeButton';

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

  // Récupérer le produit
  const product = await prisma.trendProduct.findUnique({
    where: { id },
  });

  if (!product) {
    redirect('/trends');
  }

  // Vérifier si le produit est en favoris
  const isFavorite = await prisma.productFavorite.findFirst({
    where: {
      userId: user.id,
      productId: product.id,
    },
  });

  const getSaturabilityColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-50 border-green-200';
    if (score < 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTrendBadge = (score: number) => {
    if (score >= 80) return { label: '🔥 Hot', color: 'bg-red-100 text-red-700 border-red-200' };
    if (score >= 60) return { label: '📈 Trending', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: '📊 Stable', color: 'bg-stone-100 text-stone-700 border-stone-200' };
  };

  const trendBadge = getTrendBadge(product.trendScore);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/trends">
            <Button variant="outline" className="border-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {product.name}
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Détails du produit et analyse de marque
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Image et infos principales */}
          <Card className="border-2">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 ${trendBadge.color}`}>
                    {trendBadge.label}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {product.averagePrice.toFixed(0)}€
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">Prix moyen</p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold ${getSaturabilityColor(product.saturability)}`}>
                    {product.saturability.toFixed(0)}% saturé
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-border">
                  <p className="text-sm text-muted-foreground font-medium mb-2">Score tendance</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-accent rounded-full transition-all"
                        style={{ width: `${product.trendScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-foreground min-w-[3rem]">
                      {product.trendScore.toFixed(0)}/100
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détails et analyse */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Informations produit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Catégorie</p>
                  <p className="text-foreground font-semibold capitalize">{product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Style</p>
                  <p className="text-foreground font-semibold capitalize">{product.style}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Matière</p>
                  <p className="text-foreground font-semibold capitalize">{product.material}</p>
                </div>
                {product.description && (
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Description</p>
                    <p className="text-foreground font-medium leading-relaxed">{product.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bouton Analyser */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Analyser une marque</h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        Analysez les marques qui vendent ce produit pour comprendre leur stratégie
                      </p>
                    </div>
                  </div>
                  <ProductAnalyzeButton productName={product.name} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
