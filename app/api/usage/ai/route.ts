/**
 * GET /api/usage/ai — Consommation IA de l'utilisateur (quota + jetons restants).
 */
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getMonthlyUsage, getTokensRemaining } from '@/lib/ai-usage';
import { getBudgetForPlan, getTokensForPlan, getTokensForFeature, AI_FEATURE_COSTS } from '@/lib/ai-usage-config';
import type { AIFeatureKey } from '@/lib/ai-usage-config';

/** Toutes les features avec coût > 0 pour afficher le coût dans le badge */
const FEATURES_WITH_COST = Object.keys(AI_FEATURE_COSTS) as AIFeatureKey[];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    // Retourner des données par défaut au lieu de 401 pour éviter les erreurs côté client
    const fallbackBudget = -1; // Illimité pour plan free
    return NextResponse.json({
      used: 0,
      budget: null,
      remaining: null,
      tokens: fallbackBudget,
      tokensBudget: null,
      generationsRemaining: fallbackBudget,
      generationsBudget: null,
      plan: 'free',
      costs: {},
    });
  }

  try {
    const used = await getMonthlyUsage(user.id);
    const budget = getBudgetForPlan(user.plan);
    const remainingEur = budget < 0 ? null : Math.max(0, budget - used);
    const tokensBudget = getTokensForPlan(user.plan);
    const tokensRemaining = await getTokensRemaining(user.id, user.plan ?? 'free');

    // Forfait 34€/mois = 100 générations. 1 génération ≈ 34 tokens.
    const GENERATIONS_FOR_BASE = 100;
    const TOKENS_PER_GENERATION = 34;
    const generationsBudget =
      tokensBudget < 0 ? null : Math.round(tokensBudget / TOKENS_PER_GENERATION);
    const generationsRemaining =
      tokensRemaining < 0 ? -1 : Math.max(0, Math.floor(tokensRemaining / TOKENS_PER_GENERATION));

    const costs: Record<string, number> = {};
    for (const f of FEATURES_WITH_COST) {
      costs[f] = getTokensForFeature(f);
    }

    return NextResponse.json({
      used: Math.round(used * 100) / 100,
      budget: budget < 0 ? null : budget,
      remaining: remainingEur,
      tokens: tokensRemaining,
      tokensBudget: tokensBudget < 0 ? null : tokensBudget,
      generationsRemaining,
      generationsBudget,
      plan: user.plan,
      costs,
    });
  } catch (error) {
    console.error('[usage/ai]', error);
    const budget = getBudgetForPlan(user.plan);
    const tokensBudget = getTokensForPlan(user.plan);
    const fallback = tokensBudget < 0 ? -1 : Math.round(tokensBudget / 34);
    return NextResponse.json({
      used: 0,
      budget: budget < 0 ? null : budget,
      remaining: budget < 0 ? null : budget,
      tokens: fallback,
      tokensBudget: tokensBudget < 0 ? null : tokensBudget,
      generationsRemaining: fallback,
      generationsBudget: tokensBudget < 0 ? null : Math.round(tokensBudget / 34),
      plan: user.plan,
      costs: {},
    });
  }
}
