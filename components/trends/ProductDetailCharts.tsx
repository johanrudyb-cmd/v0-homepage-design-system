'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ProductDetailChartsProps {
  saturability: number;
  sustainabilityScore: number | null;
  visualAttractivenessScore: number | null;
  /** Complexité fabrication : fournie par l'IA (Facile | Moyen | Complexe) */
  complexityScore?: string | null;
}

export function ProductDetailCharts({
  saturability,
  sustainabilityScore,
  visualAttractivenessScore,
  complexityScore,
}: ProductDetailChartsProps) {
  // Bar chart : scores principaux (opportunité = 100 - saturabilité pour "plus c'est haut, mieux c'est")
  const barData = [
    {
      name: 'Opportunité',
      value: Math.round(100 - saturability),
      label: `${saturability}% saturé`,
    },
    ...(sustainabilityScore != null
      ? [{ name: 'Durabilité (ESG)', value: Math.round(sustainabilityScore), label: `${sustainabilityScore}/100` }]
      : []),
    ...(visualAttractivenessScore != null
      ? [{ name: 'Attractivité visuelle', value: Math.round(visualAttractivenessScore), label: `${visualAttractivenessScore}/100` }]
      : []),
  ].filter((d) => d.value >= 0);

  // Complexité : fournie par l'IA. Jauge : Facile ≈ 33 %, Moyen ≈ 66 %, Complexe = 100 %
  const c = complexityScore?.trim();
  const hasComplexity = Boolean(c);
  const cLower = c?.toLowerCase();
  const isComplex = cLower === 'complexe' || cLower === 'différent' || cLower === 'different';
  const complexityGaugePercent =
    cLower === 'facile' ? 33 : cLower === 'moyen' ? 66 : isComplex ? 100 : hasComplexity ? 50 : 0;
  const complexityValue = c ? (cLower === 'facile' ? 'Facile' : cLower === 'moyen' ? 'Moyen' : isComplex ? 'Complexe' : c) : null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Graphique barres : KPIs principaux */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Scores KPIs
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Opportunité (inverse saturabilité), durabilité, attractivité visuelle.
          </p>
        </CardHeader>
        <CardContent>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                <YAxis type="category" dataKey="name" width={75} stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number | undefined) => [`${value ?? ''}`, '']}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucune donnée à afficher.</p>
          )}
        </CardContent>
      </Card>

      {/* Graphique croissance + complexité */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Tendance & complexité
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Croissance tendance, complexité de fabrication.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 w-full min-w-[140px]">
            <p className="text-xs text-muted-foreground mb-2 text-center">Complexité fabrication</p>
            {hasComplexity ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${complexityGaugePercent}%`,
                      backgroundColor:
                        complexityGaugePercent <= 33
                          ? '#22c55e'  /* Facile = vert */
                          : complexityGaugePercent <= 66
                            ? '#eab308'  /* Moyen = ambre */
                            : '#ef4444', /* Complexe = rouge */
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground">{complexityValue}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">—</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
