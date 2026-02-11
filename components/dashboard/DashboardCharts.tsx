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
      <div className="border border-[#E5E5E1] bg-white rounded-3xl shadow-apple p-6 sm:p-12">
        <div className="mb-6 sm:mb-8">
          <h3 className="font-semibold text-xl text-[#1A1A1A] mb-2 tracking-tight">Évolution Designs</h3>
          <p className="text-sm text-[#1A1A1A]/60">
            Designs créés au fil du temps
          </p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E1" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#1A1A1A"
              style={{ fontSize: '10px', fontFamily: 'var(--font-sans)', fontWeight: 400 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              stroke="#1A1A1A"
              style={{ fontSize: '10px', fontFamily: 'var(--font-sans)', fontWeight: 400 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #E5E5E1',
                borderRadius: '12px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            />
            <Line
              type="monotone"
              dataKey="designs"
              stroke="#007AFF"
              strokeWidth={3}
              dot={{ fill: '#007AFF', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Designs"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique activité globale */}
      <div className="border border-[#E5E5E1] bg-white rounded-3xl shadow-apple p-6 sm:p-12">
        <div className="mb-6 sm:mb-8">
          <h3 className="font-semibold text-xl text-[#1A1A1A] mb-2 tracking-tight">Activité Globale</h3>
          <p className="text-sm text-[#1A1A1A]/60">
            Designs, devis et contenus UGC
          </p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E1" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#1A1A1A"
              style={{ fontSize: '10px', fontFamily: 'var(--font-sans)', fontWeight: 400 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              stroke="#1A1A1A"
              style={{ fontSize: '10px', fontFamily: 'var(--font-sans)', fontWeight: 400 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #E5E5E1',
                borderRadius: '12px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            />
            <Legend
              wrapperStyle={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '10px', paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar
              dataKey="designs"
              fill="#007AFF"
              name="Designs"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="quotes"
              fill="#5E8E3E"
              name="Devis"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="ugc"
              fill="#FF9500"
              name="UGC"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
