'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <Card className="border-black/[0.03] bg-white shadow-apple rounded-[24px] overflow-hidden">
      <CardHeader className="pb-3 border-b border-black/[0.03]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-bold flex items-center gap-2.5 text-black">
            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-black" />
            </div>
            Données tendance
          </CardTitle>
          <div className="px-2 py-1 rounded-md bg-[#007AFF]/10 text-[#007AFF] text-[10px] font-bold uppercase tracking-wider">
            Live Radar
          </div>
        </div>
        <p className="text-[11px] text-[#6e6e73] mt-2 leading-relaxed">
          {isInternalPercent
            ? 'Données calculées à partir du radar (récurrence, ancienneté, alerte multi-zones).'
            : 'Données tendance issues du radar.'}
        </p>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-widest">Croissance</p>
            <p className="text-2xl font-black text-black tracking-tight">{percentDisplay}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-widest">Statut</p>
            <p className="text-2xl font-black text-black tracking-tight capitalize">{labelDisplay}</p>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-widest">Niveau de Saturation</p>
            <span className="text-[10px] font-black text-black">{displaySaturability.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden mb-3">
            <div
              className={cn("h-full rounded-full transition-all duration-1000",
                displaySaturability < 30 ? 'bg-green-500' :
                  displaySaturability < 60 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${displaySaturability}%` }}
            />
          </div>
          <div className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold border shadow-sm transition-all animate-fade-in",
            saturabilityStyle.class
          )}>
            {saturabilityStyle.label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
