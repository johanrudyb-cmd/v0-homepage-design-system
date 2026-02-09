'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  date: string;
  designs: number;
  quotes: number;
  ugc: number;
}

interface DashboardChartsProps {
  chartData: ChartData[];
}

export function DashboardCharts({ chartData }: DashboardChartsProps) {
  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Graphique évolution designs */}
      <div className="border border-[#E5E5E1] border-[1px] p-12">
        <div className="mb-8">
          <h3 className="font-serif text-xl font-normal text-[#1A1A1A] mb-2">Évolution Designs</h3>
          <p className="font-light text-sm text-[#1A1A1A] opacity-70">
            Designs créés au fil du temps
          </p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E1" />
            <XAxis 
              dataKey="date" 
              stroke="#1A1A1A"
              style={{ fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: 300 }}
            />
            <YAxis 
              stroke="#1A1A1A"
              style={{ fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: 300 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FBFBF9',
                border: '1px solid #E5E5E1',
                borderRadius: '0',
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
              }}
            />
            <Line 
              type="monotone" 
              dataKey="designs" 
              stroke="#1A1A1A" 
              strokeWidth={1}
              dot={{ fill: '#1A1A1A', r: 2 }}
              name="Designs"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique activité globale */}
      <div className="border border-[#E5E5E1] border-[1px] p-12">
        <div className="mb-8">
          <h3 className="font-serif text-xl font-normal text-[#1A1A1A] mb-2">Activité Globale</h3>
          <p className="font-light text-sm text-[#1A1A1A] opacity-70">
            Designs, devis et contenus UGC
          </p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E1" />
            <XAxis 
              dataKey="date" 
              stroke="#1A1A1A"
              style={{ fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: 300 }}
            />
            <YAxis 
              stroke="#1A1A1A"
              style={{ fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: 300 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FBFBF9',
                border: '1px solid #E5E5E1',
                borderRadius: '0',
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
              }}
            />
            <Legend 
              wrapperStyle={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: '11px' }}
            />
            <Bar 
              dataKey="designs" 
              fill="#1A1A1A" 
              name="Designs"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="quotes" 
              fill="#1A1A1A" 
              name="Devis"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="ugc" 
              fill="#1A1A1A" 
              name="UGC"
              radius={[0, 0, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
