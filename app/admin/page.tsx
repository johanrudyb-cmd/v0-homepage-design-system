import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Users,
    TrendingUp,
    CreditCard,
    Activity,
    ArrowUpRight,
    Zap,
    Clock,
    Globe
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Admin Dashboard | OUTFITY',
};

export default async function AdminDashboardPage() {
    // Récupération des stats réelles
    const totalUsers = await prisma.user.count();
    const totalBrands = await prisma.brand.count();
    const totalDesigns = await prisma.design.count();

    // Stats récentes (24h)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newUsers24h = await prisma.user.count({ where: { createdAt: { gte: last24h } } });
    const activeUsers24h = await prisma.user.count({ where: { updatedAt: { gte: last24h } } });

    const stats = [
        { label: 'Utilisateurs', value: totalUsers, sub: `+${newUsers24h} ces dernières 24h`, icon: Users, color: 'text-blue-600' },
        { label: 'Marques Créées', value: totalBrands, sub: 'Total historiques', icon: Zap, color: 'text-purple-600' },
        { label: 'Designs Générés', value: totalDesigns, sub: 'IA Studio', icon: TrendingUp, color: 'text-green-600' },
        { label: 'Actifs (24h)', value: activeUsers24h, sub: 'Utilisateurs uniques', icon: Activity, color: 'text-orange-600' },
    ];

    // Récupération des logs réels
    const logs = await prisma.adminLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
    }).catch(() => []);

    return (
        <div className="p-10 space-y-10">
            <div>
                <h1 className="text-4xl font-bold text-[#1D1D1F] tracking-tight">OUTFITY Command Center</h1>
                <p className="text-[#6e6e73] text-lg mt-2">Vue d'ensemble de la plateforme et gestion des ressources.</p>
            </div>

            {/* Grid de Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-[#6e6e73]">{stat.label}</CardTitle>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                            <p className="text-xs text-[#86868b] mt-1">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gestion Rapide */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Actions Rapides</CardTitle>
                        <CardDescription>Outils d'administration prioritaires</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/admin/blog" className="group">
                            <div className="p-4 rounded-2xl border border-[#F2F2F2] hover:border-[#007AFF] hover:bg-[#007AFF]/5 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="font-bold text-[#1D1D1F]">Gérer le Blog</h3>
                                <p className="text-xs text-[#86868b] mt-1">SEO & Mises à jour IA automatique.</p>
                            </div>
                        </Link>

                        <Link href="/admin/shopify-simulator" className="group">
                            <div className="p-4 rounded-2xl border border-[#F2F2F2] hover:border-purple-500 hover:bg-purple-50 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="font-bold text-[#1D1D1F]">Simulateur Shopify</h3>
                                <p className="text-xs text-[#86868b] mt-1">Tests d'apps et intégrations.</p>
                            </div>
                        </Link>

                        <Link href="/admin/users" className="group">
                            <div className="p-4 rounded-2xl border border-[#F2F2F2] hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="font-bold text-[#1D1D1F]">Liste Utilisateurs</h3>
                                <p className="text-xs text-[#86868b] mt-1">Gérer les accès et supports.</p>
                            </div>
                        </Link>

                        <Link href="/usage" className="group">
                            <div className="p-4 rounded-2xl border border-[#F2F2F2] hover:border-orange-500 hover:bg-orange-50 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="font-bold text-[#1D1D1F]">Facturation & Quotas</h3>
                                <p className="text-xs text-[#86868b] mt-1">Surveiller les coûts Anthropic/OpenAI.</p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                {/* Derniers Événements */}
                <Card className="border-none shadow-sm h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#86868b]">Système Logs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {logs.length === 0 ? (
                            <p className="text-xs text-[#86868b] italic">Aucun log récent en base de données.</p>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="flex gap-4">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${(log.status && (log.status.includes('error') || log.status.includes('failed'))) ? 'bg-red-500' :
                                        (log.status && log.status.includes('warning')) ? 'bg-orange-500' :
                                            'bg-[#007AFF]'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-semibold text-[#1D1D1F] line-clamp-1">{log.action}</p>
                                        <p className="text-xs text-[#6e6e73] line-clamp-2 mt-0.5">
                                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[10px] text-[#86868b] flex items-center gap-1 uppercase tracking-tight font-bold">
                                                <Clock className="w-3 h-3" />
                                                {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium uppercase">
                                                {log.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <Button variant="ghost" size="sm" className="w-full mt-4 text-xs font-bold text-[#007AFF] opacity-50 cursor-not-allowed">
                            VOIR TOUS LES LOGS
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
