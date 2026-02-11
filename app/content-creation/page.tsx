import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Phase4Marketing } from '@/components/launch-map/Phase4Marketing';
import Link from 'next/link';

export default async function ContentCreationPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/auth/signin');

    if (user.plan === 'free') {
        return (
            <DashboardLayout>
                <div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16 max-w-4xl mx-auto flex flex-col justify-center min-h-[calc(100vh-8rem)]">
                    <div className="bg-white rounded-3xl shadow-apple overflow-hidden border-2 border-primary/20 p-12 text-center space-y-8">
                        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                            <span className="text-4xl text-primary">✨</span>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight">Création de contenu IA</h1>
                            <p className="text-[#1D1D1F]/60 text-lg leading-relaxed">
                                La génération de posts structurés et de scripts marketing est réservée aux membres <strong>Créateur</strong>.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Link
                                href="/auth/choose-plan"
                                className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] bg-black text-white hover:opacity-90 active:scale-[0.98] h-14 px-10 text-lg gap-3"
                            >
                                🚀 Passer au plan Créateur
                            </Link>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const brand = await prisma.brand.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { launchMap: true },
    });

    if (!brand) {
        redirect('/launch-map');
    }

    const brandData = {
        id: brand.id,
        name: brand.name,
        logo: brand.logo,
        colorPalette: brand.colorPalette as any,
        typography: brand.typography as any,
        styleGuide: brand.styleGuide as any
    };

    return (
        <DashboardLayout>
            <div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight mb-2">Création de contenu</h1>
                    <p className="text-[#1D1D1F]/60">Générez vos posts structurés par IA basés sur votre stratégie de marque.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-apple overflow-hidden">
                    <Phase4Marketing
                        brandId={brand.id}
                        brandName={brand.name}
                        brand={brandData}
                        isCompleted={brand.launchMap?.phase6 ?? false}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
