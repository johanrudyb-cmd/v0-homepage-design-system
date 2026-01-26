'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Phase1CalculatorProps {
  brandId: string;
  initialData?: any;
  onComplete: () => void;
}

export function Phase1Calculator({ brandId, initialData, onComplete }: Phase1CalculatorProps) {
  const [sellingPrice, setSellingPrice] = useState(initialData?.sellingPrice || '');
  const [productionCost, setProductionCost] = useState(initialData?.productionCost || '');
  const [marketingCost, setMarketingCost] = useState(initialData?.marketingCost || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialData?.completed || false);

  const sellingPriceNum = parseFloat(sellingPrice) || 0;
  const productionCostNum = parseFloat(productionCost) || 0;
  const marketingCostNum = parseFloat(marketingCost) || 0;

  const grossMargin = sellingPriceNum - productionCostNum;
  const grossMarginPercent = sellingPriceNum > 0 
    ? ((grossMargin / sellingPriceNum) * 100).toFixed(1)
    : '0';

  const netMargin = grossMargin - marketingCostNum;
  const netMarginPercent = sellingPriceNum > 0
    ? ((netMargin / sellingPriceNum) * 100).toFixed(1)
    : '0';

  const isViable = netMargin > 0 && parseFloat(netMarginPercent) >= 20;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/launch-map/phase1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          data: {
            sellingPrice: sellingPriceNum,
            productionCost: productionCostNum,
            marketingCost: marketingCostNum,
            grossMargin,
            grossMarginPercent: parseFloat(grossMarginPercent),
            netMargin,
            netMarginPercent: parseFloat(netMarginPercent),
            isViable,
            completed: true,
          },
        }),
      });

      if (response.ok) {
        setIsCompleted(true);
        onComplete();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Prix de vente visé (€)
          </label>
          <Input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="80"
            disabled={isCompleted}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Coût de production (€)
          </label>
          <Input
            type="number"
            value={productionCost}
            onChange={(e) => setProductionCost(e.target.value)}
            placeholder="25"
            disabled={isCompleted}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Frais marketing (€)
          </label>
          <Input
            type="number"
            value={marketingCost}
            onChange={(e) => setMarketingCost(e.target.value)}
            placeholder="15"
            disabled={isCompleted}
          />
        </div>
      </div>

      {/* Résultats */}
      {sellingPriceNum > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-stone-200">
            <CardContent className="pt-6">
              <div className="text-sm text-stone-600 mb-1">Marge brute</div>
              <div className="text-2xl font-light text-stone-900">
                {grossMargin.toFixed(2)} €
              </div>
              <div className="text-sm text-stone-500 mt-1">
                ({grossMarginPercent}%)
              </div>
            </CardContent>
          </Card>

          <Card className={`border-2 ${isViable ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="pt-6">
              <div className="text-sm text-stone-600 mb-1">Marge nette</div>
              <div className={`text-2xl font-light ${isViable ? 'text-amber-900' : 'text-red-900'}`}>
                {netMargin.toFixed(2)} €
              </div>
              <div className={`text-sm mt-1 ${isViable ? 'text-amber-700' : 'text-red-700'}`}>
                ({netMarginPercent}%)
              </div>
              {isViable ? (
                <div className="text-xs text-amber-700 mt-2 font-medium">
                  ✓ Projet viable
                </div>
              ) : (
                <div className="text-xs text-red-700 mt-2 font-medium">
                  ⚠ Marge insuffisante (minimum 20% recommandé)
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bouton de sauvegarde */}
      {!isCompleted && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || sellingPriceNum === 0}
            className="bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs py-3 px-6"
          >
            {isSaving ? 'Sauvegarde...' : 'Valider cette étape'}
          </Button>
        </div>
      )}

      {isCompleted && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm text-amber-800 font-medium">
            ✓ Phase 1 complétée
          </div>
          <div className="text-xs text-amber-700 mt-1">
            Vous pouvez maintenant passer à la Phase 2 : Design
          </div>
        </div>
      )}
    </div>
  );
}
