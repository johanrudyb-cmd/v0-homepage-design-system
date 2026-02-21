'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Factory, ShoppingCart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessInsightsProps {
    averagePrice: number;
    estimatedCogsPercent: number | null;
    style?: string | null;
}

export function BusinessInsights({ averagePrice, estimatedCogsPercent, style }: BusinessInsightsProps) {
    const s = (style || '').toLowerCase();

    // Logique de multiplicateur basée sur le style
    // Luxe/Premium: x5 à x8 | Street/Y2K: x3.5 à x5.5 | Basique: x3 à x4.5
    let multiplierMin = 3;
    let multiplierMax = 4.5;
    let cogsAdjustment = 1;

    if (s.includes('luxe') || s.includes('premium') || s.includes('old money')) {
        multiplierMin = 5;
        multiplierMax = 8;
        cogsAdjustment = 1.25; // Benchmark qualité matières supérieures
    } else if (s.includes('street') || s.includes('y2k') || s.includes('gorpcore')) {
        multiplierMin = 3.5;
        multiplierMax = 5.5;
    } else if (s.includes('basique') || s.includes('minimaliste') || s.includes('clean girl')) {
        multiplierMin = 3;
        multiplierMax = 4.5;
    }

    const cogsPercent = estimatedCogsPercent || 25;
    const productionCost = (averagePrice * cogsPercent * cogsAdjustment) / 100;

    // Le MSRP suggéré est basé sur un multiple du coût de production appliqué au standard DTC luxe/premium
    const msrpMin = productionCost * multiplierMin;
    const msrpMax = productionCost * multiplierMax;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <Card className="border-black/[0.03] bg-white shadow-apple rounded-[24px] overflow-hidden group hover:scale-[1.01] transition-all">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                            <Factory className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#6e6e73]">Estimation Production</p>
                            <h4 className="text-xl font-black text-black tracking-tight">{productionCost.toFixed(2)}€</h4>
                        </div>
                    </div>
                    <p className="text-xs text-[#6e6e73] font-medium leading-relaxed">
                        Coût estimé pour une production moyenne (Tissu + Main d&apos;œuvre).
                        Basé sur un benchmark de <span className="text-black font-bold">{cogsPercent}%</span> du prix retail actuel.
                    </p>
                </CardContent>
            </Card>

            <Card className="border-black/[0.03] bg-white shadow-apple rounded-[24px] overflow-hidden group hover:scale-[1.01] transition-all">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#6e6e73]">Prix de vente cible</p>
                            <h4 className="text-xl font-black text-black tracking-tight">{msrpMin.toFixed(0)}€ — {msrpMax.toFixed(0)}€</h4>
                        </div>
                    </div>
                    <p className="text-xs text-[#6e6e73] font-medium leading-relaxed">
                        Fourchette de prix suggérée pour un positionnement DTC (Direct-to-Consumer) premium,
                        permettant d&apos;optimiser votre marge brute.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
