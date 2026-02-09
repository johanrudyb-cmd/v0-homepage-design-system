/**
 * Gestion des crédits surplus achetés via Stripe.
 * Mapping packId → features avec crédits ajoutés.
 */

import { prisma } from './prisma';
import type { QuotaFeatureKey } from './quota-config';

/** Mapping pack Stripe → features avec nombre de crédits */
export const PACK_TO_FEATURES: Record<
  string,
  { feature: QuotaFeatureKey; amount: number }[]
> = {
  'logos-plus': [{ feature: 'brand_logo', amount: 10 }],
  'photos-plus': [
    { feature: 'ugc_shooting_photo', amount: 5 },
    { feature: 'ugc_shooting_product', amount: 2 },
  ],
  'scripts-plus': [{ feature: 'ugc_scripts', amount: 10 }],
  'tryon-premium': [{ feature: 'ugc_virtual_tryon', amount: 1 }],
};

/** Surplus ajouté à la limite (amount) — pour features avec limit >= 0 */
export async function getSurplusAddedToLimit(
  userId: string,
  feature: string
): Promise<number> {
  const rows = await prisma.surplusCredits.findMany({
    where: { userId, feature },
    select: { amount: true },
  });
  return rows.reduce((sum, r) => sum + r.amount, 0);
}

/** Surplus restant (amount - consumed) — pour try-on (limit -1) */
export async function getSurplusRemaining(
  userId: string,
  feature: string
): Promise<number> {
  const rows = await prisma.surplusCredits.findMany({
    where: { userId, feature },
    select: { amount: true, consumed: true },
  });
  return rows.reduce((sum, r) => sum + (r.amount - r.consumed), 0);
}

/** Consomme 1 crédit surplus (pour try-on). Retourne true si consommé. */
export async function consumeSurplus(
  userId: string,
  feature: string
): Promise<boolean> {
  const row = await prisma.surplusCredits.findFirst({
    where: { userId, feature },
    orderBy: { createdAt: 'asc' },
  });
  if (!row || row.consumed >= row.amount) return false;
  await prisma.surplusCredits.update({
    where: { id: row.id },
    data: { consumed: row.consumed + 1 },
  });
  return true;
}
