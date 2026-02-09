'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function EditTrendKpis({
  trendGrowthPercent,
  trendLabel,
  displaySaturability,
  saturabilityStyle,
  isInternalPercent = false,
}: {
  productId?: string;
  trendGrowthPercent: number | null;
  trendLabel: string | null;
  displaySaturability: number;
  saturabilityStyle: { label: string; class: string };
  /** true si le % affiché est calculé en interne (récurrence, ancienneté, multi-zones) */
  isInternalPercent?: boolean;
}) {
  const percentDisplay = trendGrowthPercent != null ? `+${trendGrowthPercent}%` : '—';
  const labelDisplay = trendLabel && trendLabel.trim() ? trendLabel : '—';

  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Données tendance
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {isInternalPercent
            ? 'Données calculées à partir du radar (récurrence, ancienneté, alerte multi-zones).'
            : 'Données tendance issues du radar.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Croissance</p>
            <p className="font-semibold">{percentDisplay}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Libellé</p>
            <p className="font-semibold capitalize">{labelDisplay}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold border ${saturabilityStyle.class}`}
          >
            {displaySaturability.toFixed(0)}% saturé · {saturabilityStyle.label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
