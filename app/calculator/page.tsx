import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Phase1Calculator } from '@/components/launch-map/Phase1Calculator';

export default async function CalculatorPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/auth/signin');

    const brand = await prisma.brand.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { launchMap: true },
    });

    if (!brand) {
        redirect('/launch-map');
    }

    const initialData = (brand.launchMap?.phase1Data as any) || {};

    return (
        <DashboardLayout>
            <div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight mb-2">Calculateur de marge</h1>
                    <p className="text-[#1D1D1F]/60">Évaluez la rentabilité de vos produits et fixez vos prix de vente.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-apple overflow-hidden">
                    <Phase1Calculator
                        brandId={brand.id}
                        brand={brand as any}
                        initialData={initialData}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
