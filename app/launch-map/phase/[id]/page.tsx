import { notFound } from 'next/navigation';
import { PhasePageView } from '@/components/launch-map/PhasePageView';
import type { BrandIdentity, LaunchMapData } from '@/components/launch-map/LaunchMapStepper';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
export default async function LaunchMapPhasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');

  const { id } = await params;
  const phaseId = parseInt(id, 10);
  // Phases 0-7 : Identité, Stratégie, Calculatrice, Création mockup, Tech Pack, Sourcing, Création contenu, Création site
  if (Number.isNaN(phaseId) || phaseId < 0 || phaseId > 7) notFound();

  let brand = await prisma.brand.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { launchMap: true },
  });

  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        userId: user.id,
        name: 'Ma Première Marque',
        launchMap: {
          create: {
            phase1: false,
            phase2: false,
            phase3: false,
            phase4: false,
            phase5: false,
            phase6: false,
          },
        },
      },
      include: { launchMap: true },
    });
  }

  const hasIdentity = Boolean(brand.name && brand.name.trim().length >= 2);

  const [quotesWithFactory, favoriteFactories] = await Promise.all([
    prisma.quote.findMany({
      where: { brandId: brand.id },
      include: { factory: true },
    }),
    prisma.brandFavoriteFactory.findMany({
      where: { brandId: brand.id },
      include: { factory: true },
    }),
  ]);

  const suppliersMap = new Map<string, { id: string; name: string; country: string; moq?: number; leadTime?: number; quoteCount: number }>();

  // D'abord ajouter les fournisseurs qui ont reçu des devis
  for (const q of quotesWithFactory) {
    const f = q.factory;
    const existing = suppliersMap.get(f.id);
    if (existing) {
      existing.quoteCount += 1;
    } else {
      suppliersMap.set(f.id, {
        id: f.id,
        name: f.name,
        country: f.country,
        moq: f.moq,
        leadTime: f.leadTime,
        quoteCount: 1,
      });
    }
  }

  // Ensuite ajouter les favoris (s'ils ne sont pas déjà dans la map)
  for (const fav of favoriteFactories) {
    const f = fav.factory;
    const existing = suppliersMap.get(f.id);
    if (!existing) {
      // Ajouter le favori comme fournisseur avec qui on travaille
      suppliersMap.set(f.id, {
        id: f.id,
        name: f.name,
        country: f.country,
        moq: f.moq,
        leadTime: f.leadTime,
        quoteCount: 0,
      });
    }
  }

  const suppliers = Array.from(suppliersMap.values());

  const lm = brand.launchMap;
  const launchMapForClient = lm
    ? ({
      id: lm.id,
      phase1: lm.phase1,
      phase2: lm.phase2,
      phase3: lm.phase3,
      phase4: lm.phase4,
      phase5: lm.phase5,
      phase6: lm.phase6,
      phase7: lm.phase7,
      shopifyShopDomain: lm.shopifyShopDomain,
      phase1Data: lm.phase1Data,
      baseMockupByProductType: lm.baseMockupByProductType,
      phaseSummaries: lm.phaseSummaries,
      siteCreationTodo: lm.siteCreationTodo,
    } as LaunchMapData)
    : null;

  const [designCount, quoteCount, ugcCount] = await Promise.all([
    prisma.design.count({ where: { brandId: brand.id, status: 'completed' } }),
    prisma.quote.count({ where: { brandId: brand.id } }),
    prisma.uGCContent.count({ where: { brandId: brand.id } }),
  ]);

  return (
    <PhasePageView
      phaseId={phaseId}
      brand={{ id: brand.id, name: brand.name, logo: brand.logo }}
      launchMap={launchMapForClient as LaunchMapData | null}
      brandFull={brand as unknown as BrandIdentity}
      hasIdentity={hasIdentity}
      designCount={designCount}
      quoteCount={quoteCount}
      ugcCount={ugcCount}
      suppliers={suppliers}
      userPlan={user.plan}
    />
  );
}
