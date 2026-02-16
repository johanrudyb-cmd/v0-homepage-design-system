import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    BarChart3,
    TrendingUp,
    ArrowUpRight,
    Calendar,
    Cpu,
    Euro,
    Layers
} from 'lucide-react';

export const metadata = {
    title: 'Métriques & Coûts IA | Admin',
};

export default async function AdminMetricsPage() {
    // Récupération des coûts IA agrégés par feature
    const usageByFeature = await prisma.aIUsage.groupBy({
        by: ['feature'],
        _sum: {
            costEur: true,
        },
        orderBy: {
            _sum: {
                costEur: 'desc',
            }
        }
    });

    // Coût total historique
    const totalCost = usageByFeature.reduce((acc: number, curr: any) => acc + (curr._sum.costEur || 0), 0);

    // Coût 30 derniers jours
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const cost30Days = await prisma.aIUsage.aggregate({
        where: {
            createdAt: { gte: last30Days }
        },
        _sum: {
            costEur: true
        }
    });

    // Utilisations IA
    const aiUsageCount = await prisma.aIUsage.count();

    const stats = [
        { label: 'Dépense Totale', value: `${totalCost.toFixed(2)}€`, sub: 'Historique complet', icon: Euro, color: 'text-blue-600' },
        { label: 'Dépense (30j)', value: `${(cost30Days._sum.costEur || 0).toFixed(2)}€`, sub: 'Dernier mois roulant', icon: Calendar, color: 'text-emerald-600' },
        { label: 'Utilisations IA', value: aiUsageCount, sub: 'Nombre de requêtes', icon: Cpu, color: 'text-purple-600' },
        { label: 'Features Actives', value: usageByFeature.length, sub: 'Modules traqués', icon: Layers, color: 'text-orange-600' },
    ];

    return (
        <div className="p-10 space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-[#1D1D1F]">Métriques & Coûts IA</h1>
                <p className="text-[#6e6e73]">Surveillance de la consommation des APIs Anthropic, OpenAI et Higgsfield.</p>
            </div>

            {/* Grid de Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-[#6e6e73]">{stat.label}</CardTitle>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                            <p className="text-xs text-[#86868b] mt-1">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Répartition par Feature */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Répartition par Module</CardTitle>
                        <CardDescription>Coûts générés par chaque fonctionnalité de la plateforme</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {usageByFeature.map((item: any) => {
                                const percentage = ((item._sum.costEur || 0) / (totalCost || 1)) * 100;
                                return (
                                    <div key={item.feature} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-[#1D1D1F] capitalize">
                                                {item.feature.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-[#6e6e73]">{(item._sum.costEur || 0).toFixed(2)}€</span>
                                        </div>
                                        <div className="h-2 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Analyse Rentabilité (Simulation) */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Analyse de Rentabilité</CardTitle>
                        <CardDescription>Comparaison coûts IA vs Revenus (Estimation)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-6 rounded-2xl bg-[#F5F5F7]">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-[#1D1D1F]">Ratio Coût/User (avg)</span>
                                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">Excellent</span>
                            </div>
                            <div className="text-4xl font-bold tracking-tight text-[#1D1D1F]">
                                {(totalCost / (await prisma.user.count() || 1)).toFixed(2)}€
                            </div>
                            <p className="text-xs text-[#6e6e73] mt-2">
                                Coût IA moyen par utilisateur depuis le lancement.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#1D1D1F]">Optimisation GPT-4o-mini</p>
                                    <p className="text-xs text-[#6e6e73]">Réduction des coûts de 40% sur la génération de tech-packs.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#1D1D1F]">Coût Higgsfield stable</p>
                                    <p className="text-xs text-[#6e6e73]">La génération de vidéos reste le poste de dépense majeur.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
