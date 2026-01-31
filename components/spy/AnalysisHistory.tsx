'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface Analysis {
  id: string;
  shopifyUrl: string;
  estimatedRevenue?: number | null;
  estimatedMonthlyRevenue?: number | null;
  createdAt: Date;
}

interface AnalysisHistoryProps {
  analyses: Analysis[];
}

export function AnalysisHistory({ analyses }: AnalysisHistoryProps) {
  const formatRevenue = (revenue: number | null) => {
    if (!revenue) return 'N/A';
    if (revenue >= 1000000) return `${(revenue / 1000000).toFixed(1)}M€`;
    if (revenue >= 1000) return `${(revenue / 1000).toFixed(0)}K€`;
    return `${revenue.toFixed(0)}€`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="border-stone-200">
      <CardHeader>
        <CardTitle className="text-xl font-light tracking-wide">
          Historique des analyses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analyses.length === 0 ? (
          <p className="text-sm text-stone-500 font-light text-center py-4">
            Aucune analyse effectuée
          </p>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-stone-900">
                      {analysis.shopifyUrl}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-stone-500 font-light">
                    <span>CA estimé : {formatRevenue(analysis.estimatedMonthlyRevenue ?? analysis.estimatedRevenue ?? null)}</span>
                    <span>•</span>
                    <span>{formatDate(analysis.createdAt)}</span>
                  </div>
                </div>
                <Link
                  href={`/spy/${analysis.id}`}
                  className="text-xs text-amber-600 hover:text-amber-700 font-light uppercase tracking-wide"
                >
                  Voir détails
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
