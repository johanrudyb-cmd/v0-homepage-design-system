import { MesTechPacksContent } from '@/components/launch-map/MesTechPacksContent';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function MesTechPacksPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');

  const brand = await prisma.brand.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (!brand) {
    redirect('/launch-map');
  }

  const brandForTechPack = {
    id: brand.id,
    name: brand.name,
    logo: brand.logo,
  };

  return (
    <MesTechPacksContent
      brandId={brand.id}
      brandName={brand.name}
      brand={brandForTechPack}
    />
  );
}
