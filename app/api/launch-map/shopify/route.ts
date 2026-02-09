import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** PATCH : enregistre le domaine Shopify et valide la phase 6 */
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const brandId = typeof body.brandId === 'string' ? body.brandId : null;
    const shopifyShopDomain = typeof body.shopifyShopDomain === 'string' ? body.shopifyShopDomain.trim() : null;

    if (!brandId || !shopifyShopDomain) {
      return NextResponse.json(
        { error: 'brandId et shopifyShopDomain requis' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: { launchMap: true },
    });
    if (!brand) {
      return NextResponse.json({ error: 'Marque introuvable' }, { status: 404 });
    }

    const data: { shopifyShopDomain: string; phase6: boolean } = {
      shopifyShopDomain,
      phase6: true,
    };

    if (brand.launchMap) {
      await prisma.launchMap.update({
        where: { id: brand.launchMap.id },
        data,
      });
    } else {
      await prisma.launchMap.create({
        data: {
          brandId: brand.id,
          phase1: false,
          phase2: false,
          phase3: false,
          phase4: false,
          phase5: false,
          phase6: true,
          shopifyShopDomain,
        },
      });
    }

    return NextResponse.json({ shopifyShopDomain, phase6: true });
  } catch (e) {
    console.error('PATCH /api/launch-map/shopify', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
