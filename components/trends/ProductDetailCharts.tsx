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
import { BarChart3, Factory } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="grid gap-6 md:grid-cols-2">
      {/* Graphique barres : KPIs principaux */}
      <Card className="border-black/[0.03] bg-white shadow-apple rounded-[24px] overflow-hidden">
        <CardHeader className="pb-4 border-b border-black/[0.03]">
          <CardTitle className="text-[15px] font-bold flex items-center gap-2.5 text-black text-left w-full">
            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-black" />
            </div>
            Performance & Insights
          </CardTitle>
          <p className="text-[11px] text-[#6e6e73] mt-2 leading-relaxed text-left w-full">
            Scores d&apos;opportunité, durabilité ESG et attractivité visuelle calculés par Outfity Intelligence.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                barSize={12}
              >
                <CartesianGrid strokeDasharray="0 0" stroke="rgba(0,0,0,0.03)" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6e6e73', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#1D1D1F', fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    padding: '12px'
                  }}
                  itemStyle={{ fontWeight: 800, color: '#000' }}
                  labelStyle={{ fontWeight: 600, color: '#6e6e73', marginBottom: '4px' }}
                />
                <Bar
                  dataKey="value"
                  fill="#000"
                  radius={[0, 10, 10, 0]}
                  name="Index"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-black/[0.02] rounded-2xl border border-dashed border-black/10">
              <p className="text-sm font-bold text-[#6e6e73]">Données IA en cours de traitement</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graphique croissance + complexité */}
      <Card className="border-black/[0.03] bg-white shadow-apple rounded-[24px] overflow-hidden">
        <CardHeader className="pb-4 border-b border-black/[0.03]">
          <CardTitle className="text-[15px] font-bold flex items-center gap-2.5 text-black text-left w-full">
            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0">
              <Factory className="w-4 h-4 text-black" />
            </div>
            Ingénierie Produit
          </CardTitle>
          <p className="text-[11px] text-[#6e6e73] mt-2 leading-relaxed text-left w-full">
            Estimation de la complexité technique et du temps de développement nécessaire.
          </p>
        </CardHeader>
        <CardContent className="pt-8 flex flex-col items-center">
          <div className="w-full max-w-xs space-y-8">
            <div className="relative pt-4">
              {/* Complexity Meter */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-full h-3 bg-black/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-apple shadow-sm"
                    style={{
                      width: `${complexityGaugePercent}%`,
                      backgroundColor:
                        complexityGaugePercent <= 33
                          ? '#22c55e'
                          : complexityGaugePercent <= 66
                            ? '#eab308'
                            : '#ef4444',
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 w-full gap-2">
                  {['Facile', 'Moyen', 'Complexe'].map((level) => (
                    <div key={level} className="flex flex-col items-center">
                      <div className={cn(
                        "text-[10px] font-bold uppercase tracking-widest transition-colors",
                        complexityValue === level ? 'text-black opacity-100' : 'text-black/20'
                      )}>
                        {level}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 text-center">
                  <div className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-widest mb-1.5 text-center">Estimation Finale</div>
                  <div className="px-6 py-3 rounded-2xl bg-black text-white text-lg font-black tracking-tight shadow-apple">
                    {complexityValue || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
