'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ExternalLink, 
  RefreshCw, 
  TrendingUp, 
  Zap,
  BarChart3,
  Globe,
  Palette,
  ShoppingBag,
  Package,
  DollarSign,
  Sparkles,
  Target,
  Users,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Analysis {
  id: string;
  shopifyUrl: string;
  storeName?: string | null;
  category?: string | null;
  launchDate?: string | null;
  country?: string | null;
  estimatedDailyRevenue?: number | null;
  estimatedMonthlyRevenue?: number | null;
  productCount?: number | null;
  averageOrdersPerMonth?: number | null;
  trafficSources?: any;
  markets?: any;
  monthlyTraffic?: any;
  monthlyRevenue?: any;
  last3MonthsGrowth?: number | null;
  lastMonthGrowth?: number | null;
  stack?: any;
  theme?: any;
  adStrategy?: any;
  adsEvolution?: any;
  adTypes?: any;
  last3MonthsAdsGrowth?: number | null;
  lastMonthAdsGrowth?: number | null;
  aiAnalysis?: any;
  createdAt: Date;
}

interface AnalysisResultProps {
  analysis: Analysis;
  onBack?: () => void;
}

export function AnalysisResult({ analysis, onBack }: AnalysisResultProps) {
  const [activeTab, setActiveTab] = useState<'revenue' | 'traffic'>('revenue');

  const formatRevenue = (revenue: number | null) => {
    if (!revenue) return 'Non disponible';
    if (revenue >= 1000000) return `${(revenue / 1000000).toFixed(1)}M€`;
    if (revenue >= 1000) return `${(revenue / 1000).toFixed(0)}K€`;
    return `${revenue.toFixed(0)}€`;
  };

  const formatNumber = (num: number | null) => {
    if (!num) return '0';
    return num.toLocaleString('fr-FR');
  };

  const trafficSources = analysis.trafficSources || [];
  const markets = analysis.markets || [];
  const monthlyRevenue = analysis.monthlyRevenue || [];
  const monthlyTraffic = analysis.monthlyTraffic || [];
  const adsEvolution = analysis.adsEvolution || [];
  const adTypes = analysis.adTypes || [];
  const theme = analysis.theme || {};
  const stack = analysis.stack || {};
  const adStrategy = analysis.adStrategy || {};
  const aiAnalysis = analysis.aiAnalysis || {};

  return (
    <div className="space-y-8">
      {/* Header avec style mode/fashion */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl -z-10" />
        <div className="p-8 rounded-2xl border-2 border-border">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="mb-4 -ml-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              )}
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-modern-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground mb-1">
                    {analysis.storeName || 'Boutique'}
                  </h1>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    {analysis.category && (
                      <span className="text-sm font-medium">{analysis.category}</span>
                    )}
                    {analysis.country && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{analysis.country === 'États-Unis' ? '🇺🇸' : '🇫🇷'}</span>
                          <span className="text-sm font-medium">{analysis.country}</span>
                        </div>
                      </>
                    )}
                    {analysis.launchDate && (
                      <>
                        <span>•</span>
                        <span className="text-sm font-medium">Lancé en {analysis.launchDate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-2">
                <ExternalLink className="w-4 h-4 mr-2" />
                Site web
              </Button>
              <Button variant="ghost" size="icon" className="rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Métriques principales avec style unique */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-background/80 backdrop-blur rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quotidien
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatRevenue(analysis.estimatedDailyRevenue)}
              </div>
            </div>

            <div className="p-4 bg-background/80 backdrop-blur rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mensuel
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatRevenue(analysis.estimatedMonthlyRevenue)}
              </div>
            </div>

            <div className="p-4 bg-background/80 backdrop-blur rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Produits
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatNumber(analysis.productCount)}
              </div>
            </div>

            <div className="p-4 bg-background/80 backdrop-blur rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-4 h-4 text-secondary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Commandes
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatNumber(analysis.averageOrdersPerMonth)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques avec style unique */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique principal */}
        <Card className="lg:col-span-2 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Performance</CardTitle>
              <div className="flex gap-2 border-b-2 border-border">
                <button
                  onClick={() => setActiveTab('revenue')}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all -mb-[2px] ${
                    activeTab === 'revenue'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Revenus
                </button>
                <button
                  onClick={() => setActiveTab('traffic')}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all -mb-[2px] ${
                    activeTab === 'traffic'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Trafic
                </button>
              </div>
            </div>
            {activeTab === 'revenue' && analysis.last3MonthsGrowth !== null && analysis.lastMonthGrowth !== null && (
              <div className="flex gap-6 mt-4">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">3 mois</span>
                  <div className={`text-lg font-bold ${analysis.last3MonthsGrowth >= 0 ? 'text-success' : 'text-error'}`}>
                    {analysis.last3MonthsGrowth >= 0 ? '+' : ''}{analysis.last3MonthsGrowth}%
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Mois dernier</span>
                  <div className={`text-lg font-bold ${analysis.lastMonthGrowth >= 0 ? 'text-success' : 'text-error'}`}>
                    {analysis.lastMonthGrowth >= 0 ? '+' : ''}{analysis.lastMonthGrowth}%
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {activeTab === 'revenue' && monthlyRevenue.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '2px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: any) => formatRevenue(value)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(262 83% 58%)" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
            {activeTab === 'traffic' && monthlyTraffic.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTraffic}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '2px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: any) => formatNumber(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="hsl(188 94% 43%)" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(188 94% 43%)', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Analyse IA avec style unique */}
        <Card className="border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-bold">Analyse IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="default" className="w-full shadow-modern-lg">
              <Zap className="w-4 h-4 mr-2" />
              Analyser avec IA
            </Button>
            {aiAnalysis.badge && (
              <div className="p-4 bg-success/10 border-2 border-success/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-success" />
                  <span className="font-bold text-success text-sm">{aiAnalysis.badge}</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  Cette marque présente de bonnes performances avec une stratégie marketing solide.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Marchés et Sources de trafic - Layout unique */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marchés avec style mode */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold">Marchés ciblés</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {markets.map((market: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{market.flag}</span>
                    <span className="font-semibold text-foreground">{market.country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary rounded-full transition-all"
                        style={{ width: `${market.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-foreground min-w-[3rem] text-right">
                      {market.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sources de trafic avec style unique */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              <CardTitle className="text-lg font-bold">Sources de trafic</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="percentage"
                    >
                      {trafficSources.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || `hsl(262 83% ${60 + index * 5}%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {trafficSources.map((source: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: source.color || `hsl(262 83% ${60 + index * 5}%)` }}
                      />
                      <span className="text-xs font-semibold text-foreground">{source.name}</span>
                    </div>
                    <span className="text-xs font-bold text-foreground">{source.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thème et Apps - Layout horizontal unique */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thème avec style mode */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-secondary" />
              <CardTitle className="text-lg font-bold">Identité visuelle</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {theme.name && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Thème</span>
                <div className="mt-1">
                  <a href="#" className="text-sm font-bold text-primary hover:underline">
                    {theme.name}
                  </a>
                </div>
              </div>
            )}
            {theme.fonts && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Typographie</span>
                <div className="mt-1">
                  <span className="text-sm font-semibold text-foreground">{theme.fonts}</span>
                </div>
              </div>
            )}
            {theme.colors && theme.colors.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Palette</span>
                <div className="flex gap-2">
                  {theme.colors.map((color: string, index: number) => (
                    <div
                      key={index}
                      className="w-12 h-12 rounded-xl border-2 border-border shadow-modern"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Apps installées */}
        {stack.apps && stack.apps.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" />
                <CardTitle className="text-lg font-bold">Stack technique</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stack.apps.map((app: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-all">
                    <span className="text-sm font-semibold text-foreground">{app}</span>
                    <Button variant="ghost" size="sm" className="h-8">
                      →
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Publicités - Section unique */}
      {adStrategy.activeAds !== undefined && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bold">
                  Stratégie publicitaire ({adStrategy.activeAds} actives)
                </CardTitle>
              </div>
              <Button variant="outline" size="sm" className="border-2">
                Mettre à jour
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-success/10 rounded-xl border-2 border-success/20">
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Actives
                </div>
                <div className="text-2xl font-bold text-success">{adStrategy.activeAds}</div>
              </div>
              <div className="p-4 bg-muted rounded-xl border-2 border-border">
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Inactives
                </div>
                <div className="text-2xl font-bold text-foreground">{adStrategy.inactiveAds || 0}</div>
              </div>
            </div>

            {adsEvolution.length > 0 && (
              <div>
                <div className="flex gap-6 mb-4">
                  {analysis.last3MonthsAdsGrowth !== null && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">3 mois</span>
                      <div className={`text-lg font-bold ${analysis.last3MonthsAdsGrowth >= 0 ? 'text-success' : 'text-error'}`}>
                        {analysis.last3MonthsAdsGrowth >= 0 ? '+' : ''}{analysis.last3MonthsAdsGrowth}%
                      </div>
                    </div>
                  )}
                  {analysis.lastMonthAdsGrowth !== null && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Mois dernier</span>
                      <div className={`text-lg font-bold ${analysis.lastMonthAdsGrowth >= 0 ? 'text-success' : 'text-error'}`}>
                        {analysis.lastMonthAdsGrowth >= 0 ? '+' : ''}{analysis.lastMonthAdsGrowth}%
                      </div>
                    </div>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={adsEvolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ads" 
                      stroke="hsl(262 83% 58%)" 
                      fill="hsl(262 83% 58%)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Export PDF */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={async () => {
            try {
              const response = await fetch(`/api/spy/${analysis.id}/export-pdf`);
              if (!response.ok) {
                throw new Error('Erreur lors de la génération du PDF');
              }

              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `brand-spy-${analysis.id}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } catch (error) {
              console.error('Erreur export PDF:', error);
              alert('Erreur lors de l\'export du PDF');
            }
          }}
          className="border-2"
        >
          Exporter PDF
        </Button>
      </div>
    </div>
  );
}
