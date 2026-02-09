/**
 * GET /api/usage/quota — Usage par feature pour le pack Fashion Launch.
 * Retourne pour chaque feature : limit, used, remaining.
 * Inclut les crédits surplus achetés via Stripe.
 */
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getFeatureCountThisMonth } from '@/lib/ai-usage';
import type { AIFeatureKey } from '@/lib/ai-usage-config';
import {
  QUOTA_LIMITS,
  QUOTA_LABELS,
  QUOTA_CATEGORIES,
  CATEGORY_LABELS,
  QUOTA_TO_AI_FEATURE,
  TRYON_PREMIUM_PRICE,
  type QuotaFeatureKey,
  type QuotaCategory,
} from '@/lib/quota-config';
import { getSurplusAddedToLimit, getSurplusRemaining } from '@/lib/surplus-credits';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const features = Object.keys(QUOTA_LIMITS) as QuotaFeatureKey[];
    const usage: Record<
      QuotaFeatureKey,
      { limit: number; used: number; remaining: number; label: string; isUnlimited?: boolean }
    > = {} as Record<QuotaFeatureKey, { limit: number; used: number; remaining: number; label: string; isUnlimited?: boolean }>;

    for (const key of features) {
      const baseLimit = QUOTA_LIMITS[key];
      const aiFeature = QUOTA_TO_AI_FEATURE[key] as AIFeatureKey;
      let used = 0;
      try {
        used = baseLimit >= 0 ? await getFeatureCountThisMonth(user.id, aiFeature) : 0;
      } catch {
        used = 0;
      }

      // ugc_virtual_tryon : limit -1 = premium, surplus = crédits achetés (pay per use)
      if (key === 'ugc_virtual_tryon') {
        const surplusRemaining = await getSurplusRemaining(user.id, key);
        usage[key] = {
          limit: surplusRemaining > 0 ? surplusRemaining : 999,
          used: 0,
          remaining: surplusRemaining,
          label: QUOTA_LABELS[key],
          isUnlimited: surplusRemaining <= 0,
        };
        continue;
      }

      const surplus = await getSurplusAddedToLimit(user.id, key);
      const effectiveLimit = baseLimit >= 0 ? baseLimit + surplus : 999;
      const isUnlimited = baseLimit < 0 && surplus <= 0;
      const remaining = isUnlimited ? 999 : Math.max(0, effectiveLimit - used);

      usage[key] = {
        limit: isUnlimited ? 999 : effectiveLimit,
        used,
        remaining,
        label: QUOTA_LABELS[key],
        isUnlimited,
      };
    }

    return NextResponse.json({
      usage,
      categories: QUOTA_CATEGORIES,
      categoryLabels: CATEGORY_LABELS,
      tryonPremiumPrice: TRYON_PREMIUM_PRICE,
      packId: 'fashion_launch',
    });
  } catch (error) {
    console.error('[usage/quota]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
