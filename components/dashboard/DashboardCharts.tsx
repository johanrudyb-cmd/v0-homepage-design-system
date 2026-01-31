'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

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
    <div className="grid gap-5 md:grid-cols-2">
      {/* Graphique évolution designs */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-bold">Évolution Designs</CardTitle>
          </div>
          <CardDescription className="font-medium">
            Designs créés au fil du temps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '2px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="designs" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                name="Designs"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique activité globale */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            <CardTitle className="text-lg font-bold">Activité Globale</CardTitle>
          </div>
          <CardDescription className="font-medium">
            Designs, devis et contenus UGC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '2px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar 
                dataKey="designs" 
                fill="hsl(var(--primary))" 
                name="Designs"
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="quotes" 
                fill="hsl(var(--accent))" 
                name="Devis"
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="ugc" 
                fill="hsl(var(--secondary))" 
                name="UGC"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
