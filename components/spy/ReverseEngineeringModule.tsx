'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReverseEngineeringModuleProps {
  estimatedMonthlyRevenue: number | null;
  estimatedDailyRevenue: number | null;
  productCount: number | null;
}

/**
 * Module de Reverse Engineering financier
 * Calcule automatiquement la marge nette estimée
 * Formule: PV - TVA - Production - Marketing - Logistique
 */
export function ReverseEngineeringModule({
  estimatedMonthlyRevenue,
  estimatedDailyRevenue,
  productCount,
}: ReverseEngineeringModuleProps) {
  // Constantes d'estimation (basées sur des moyennes du marché)
  const TVA_RATE = 0.20; // 20% TVA (France)
  const PRODUCTION_COST_RATE = 0.30; // 30% du CA en coûts de production
  const MARKETING_COST_RATE = 0.15; // 15% du CA en marketing
  const LOGISTICS_COST_RATE = 0.10; // 10% du CA en logistique
  const PLATFORM_FEES_RATE = 0.03; // 3% de frais Shopify

  const monthlyRevenue = estimatedMonthlyRevenue || 0;
  const dailyRevenue = estimatedDailyRevenue || 0;

  // Calculs
  const monthlyTVA = monthlyRevenue * TVA_RATE;
  const monthlyProduction = monthlyRevenue * PRODUCTION_COST_RATE;
  const monthlyMarketing = monthlyRevenue * MARKETING_COST_RATE;
  const monthlyLogistics = monthlyRevenue * LOGISTICS_COST_RATE;
  const monthlyPlatformFees = monthlyRevenue * PLATFORM_FEES_RATE;

  const monthlyNetMargin = monthlyRevenue - monthlyTVA - monthlyProduction - monthlyMarketing - monthlyLogistics - monthlyPlatformFees;
  const netMarginRate = monthlyRevenue > 0 ? (monthlyNetMargin / monthlyRevenue) * 100 : 0;

  const dailyNetMargin = dailyRevenue - (dailyRevenue * TVA_RATE) - (dailyRevenue * PRODUCTION_COST_RATE) - (dailyRevenue * MARKETING_COST_RATE) - (dailyRevenue * LOGISTICS_COST_RATE) - (dailyRevenue * PLATFORM_FEES_RATE);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M€`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K€`;
    return `${amount.toFixed(0)}€`;
  };

  const getMarginColor = (rate: number) => {
    if (rate >= 20) return 'text-green-600 dark:text-green-400';
    if (rate >= 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getMarginBadgeVariant = (rate: number): 'default' | 'secondary' | 'destructive' => {
    if (rate >= 20) return 'default';
    if (rate >= 10) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              Reverse Engineering Financier
            </CardTitle>
          </div>
          <Badge variant={getMarginBadgeVariant(netMarginRate)} className="text-sm font-semibold">
            {netMarginRate >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            Marge: {netMarginRate.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Revenu brut */}
        <div className="p-4 bg-background/80 backdrop-blur rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Revenu Brut (PV)</span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(monthlyRevenue)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Chiffre d'affaires mensuel estimé</p>
        </div>

        {/* Détail des coûts */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4" />
            Détail des coûts (mensuel)
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
              <span className="text-sm text-muted-foreground">TVA (20%)</span>
              <span className="text-sm font-semibold text-foreground">
                -{formatCurrency(monthlyTVA)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
              <span className="text-sm text-muted-foreground">Production (30%)</span>
              <span className="text-sm font-semibold text-foreground">
                -{formatCurrency(monthlyProduction)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
              <span className="text-sm text-muted-foreground">Marketing (15%)</span>
              <span className="text-sm font-semibold text-foreground">
                -{formatCurrency(monthlyMarketing)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
              <span className="text-sm text-muted-foreground">Logistique (10%)</span>
              <span className="text-sm font-semibold text-foreground">
                -{formatCurrency(monthlyLogistics)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
              <span className="text-sm text-muted-foreground">Frais Shopify (3%)</span>
              <span className="text-sm font-semibold text-foreground">
                -{formatCurrency(monthlyPlatformFees)}
              </span>
            </div>
          </div>
        </div>

        {/* Marge nette */}
        <div className="p-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-xl border-2 border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Marge Nette Estimée</span>
            <span className={`text-2xl font-bold ${getMarginColor(netMarginRate)}`}>
              {formatCurrency(monthlyNetMargin)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quotidien</span>
            <span className={`text-sm font-semibold ${getMarginColor(netMarginRate)}`}>
              {formatCurrency(dailyNetMargin)}
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Ces estimations sont basées sur des moyennes du marché.
            Les taux réels peuvent varier selon la stratégie de la marque.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
