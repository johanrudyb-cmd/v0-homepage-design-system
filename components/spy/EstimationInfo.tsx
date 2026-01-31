'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, AlertCircle } from 'lucide-react';

interface EstimationInfoProps {
  dataSource: 'scraped' | 'estimated';
  estimatedMonthlyRevenue: number | null;
  averageOrdersPerMonth: number | null;
}

/**
 * Composant pour expliquer comment les estimations sont calculées
 */
export function EstimationInfo({ 
  dataSource, 
  estimatedMonthlyRevenue, 
  averageOrdersPerMonth 
}: EstimationInfoProps) {
  return (
    <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <CardTitle className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
            Comment sont calculées ces estimations ?
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-yellow-800 dark:text-yellow-200">
        {dataSource === 'scraped' ? (
          <>
            <p className="font-semibold">✅ Données utilisées pour l'estimation :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Prix réels</strong> : Moyenne des prix des produits scrapés</li>
              <li><strong>Nombre de produits</strong> : Estimé depuis les produits visibles (×15)</li>
              <li><strong>Apps installées</strong> : Utilisées pour estimer le taux de conversion</li>
              <li><strong>Qualité du design</strong> : Utilisée pour estimer le trafic</li>
            </ul>
            <p className="mt-2">
              <strong>Formule CA :</strong> Trafic estimé × Taux de conversion × Panier moyen
            </p>
            <p className="mt-2 text-xs">
              💡 <strong>Pour des données réelles :</strong> Activez le tracking Live ci-dessous. 
              Le système analysera les stocks toutes les heures et calculera les ventes réelles.
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">⚠️ Estimations basées sur des moyennes du marché :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Le scraping n'a pas pu être effectué</li>
              <li>Les données sont basées sur des moyennes de boutiques similaires</li>
              <li>Les résultats peuvent être très imprécis</li>
            </ul>
            <p className="mt-2 text-xs">
              💡 <strong>Solution :</strong> Réessayez l'analyse ou activez le tracking pour obtenir des données réelles.
            </p>
          </>
        )}
        
        <div className="mt-4 pt-3 border-t border-yellow-300 dark:border-yellow-700">
          <p className="text-xs font-semibold mb-2">📊 Métriques actuelles :</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-yellow-700 dark:text-yellow-300">CA mensuel estimé :</span>
              <span className="font-semibold ml-2">
                {estimatedMonthlyRevenue 
                  ? estimatedMonthlyRevenue >= 1000 
                    ? `${(estimatedMonthlyRevenue / 1000).toFixed(1)}K€`
                    : `${estimatedMonthlyRevenue.toFixed(0)}€`
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-yellow-700 dark:text-yellow-300">Commandes/mois estimées :</span>
              <span className="font-semibold ml-2">
                {averageOrdersPerMonth || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
