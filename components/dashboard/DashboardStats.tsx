import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';

interface StatsData {
    designCount: number;
    quoteCount: number;
    ugcCount: number;
    completedSteps: number;
    totalSteps: number;
}

async function getStats(brandId: string): Promise<StatsData> {
    const [designCount, quoteCount, ugcCount, launchMap] = await Promise.all([
        prisma.design.count({ where: { brandId, status: 'completed' } }),
        prisma.quote.count({ where: { brandId } }),
        prisma.uGCContent.count({ where: { brandId } }),
        prisma.launchMap.findUnique({ where: { brandId } })
    ]);

    // Calcul simplifié de la progression pour l'exemple
    // (Vous pouvez réintégrer la logique complète ici si besoin)
    const steps = [
        launchMap?.phase1, launchMap?.phase2, launchMap?.phase3,
        launchMap?.phase4, launchMap?.phase5, launchMap?.phase6, launchMap?.phase7
    ];
    const completedSteps = steps.filter(Boolean).length;

    return {
        designCount,
        quoteCount,
        ugcCount,
        completedSteps,
        totalSteps: steps.length,
    };
}

export async function DashboardStats({ brandId }: { brandId: string }) {
    const stats = await getStats(brandId);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-stagger">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-apple p-4 sm:p-6 lg:p-8">
                <div className="text-xs sm:text-sm text-[#1D1D1F]/60 mb-2 sm:mb-3">Designs créés</div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#1D1D1F]">{stats.designCount}</div>
            </div>
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-apple p-4 sm:p-6 lg:p-8">
                <div className="text-xs sm:text-sm text-[#1D1D1F]/60 mb-2 sm:mb-3">Devis envoyés</div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#1D1D1F]">{stats.quoteCount}</div>
            </div>
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-apple p-4 sm:p-6 lg:p-8">
                <div className="text-xs sm:text-sm text-[#1D1D1F]/60 mb-2 sm:mb-3">Contenus UGC</div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#1D1D1F]">{stats.ugcCount}</div>
            </div>
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-apple p-4 sm:p-6 lg:p-8">
                <div className="text-xs sm:text-sm text-[#1D1D1F]/60 mb-2 sm:mb-3">Progression</div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#1D1D1F]">{stats.completedSteps} / {stats.totalSteps}</div>
            </div>
        </div>
    );
}

export function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl sm:rounded-3xl shadow-apple p-4 sm:p-6 lg:p-8 animate-pulse">
                    <div className="h-4 w-20 bg-gray-100 rounded mb-4"></div>
                    <div className="h-10 w-12 bg-gray-200 rounded"></div>
                </div>
            ))}
        </div>
    );
}
