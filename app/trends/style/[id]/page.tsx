
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { StyleLightDashboard, StyleDetailProps } from '@/components/trends/StyleLightDashboard';

// --- Server Component ---
export default async function StyleDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ segment?: string }>;
}) {
    const { id } = await params;
    const { segment } = await searchParams;

    const decodedId = decodeURIComponent(id);

    console.log(`🔍 [StylePage Server] Fetching style data for ID: "${decodedId}", Segment: "${segment}"`);

    // Logic de parsing ID
    const parts = decodedId.split('_');
    const catCode = parts[0];
    const styleNameRaw = parts.length > 1 ? parts.slice(1).join('_') : parts[0];
    const styleName = styleNameRaw;

    // Requete DB : On cherche LARGE pour pouvoir filtrer proprement ensuite
    const allProductsInCat = await prisma.trendProduct.findMany({
        where: {
            segment: segment || 'homme',
            category: catCode
        },
        orderBy: { trendScore: 'desc' },
        take: 300
    });

    // Filtrage Strict : On ne garde que ceux qui ont le bon Style
    // Note: styleName peut être "Oversize", "Vintage", etc.
    let finalProducts = allProductsInCat.filter(p =>
        (p.style && p.style.toLowerCase() === styleName.toLowerCase())
    );

    // Fallback : Si vraiment le style est vide ou introuvable, on prend le top de la catégorie
    if (finalProducts.length === 0) {
        console.log(`⚠️ [StylePage] No strict style match for "${styleName}", using category top.`);
        finalProducts = allProductsInCat.slice(0, 20);
    }

    if (finalProducts.length === 0) {
        return notFound();
    }


    // Calcul Moyennes
    const avgScore = Math.round(finalProducts.reduce((acc, p) => acc + (p.trendScore || 50), 0) / finalProducts.length);
    const avgPrice = Math.round(finalProducts.reduce((acc, p) => acc + p.averagePrice, 0) / finalProducts.length);
    const topProduct = finalProducts[0];

    // Nettoyage du Nom pour éviter "PULL Pull"
    let displayName = styleName;
    const catLabel = catCode === 'TSHIRT' ? 'T-Shirt' : catCode;

    // Si le nom du style est presque identique à la catégorie, on n'affiche que le style
    // Ex: "Pull" et "PULL" -> On garde juste "Pull"
    if (!styleName.toLowerCase().includes(catLabel.toLowerCase()) && styleName.toLowerCase() !== catLabel.toLowerCase()) {
        displayName = `${styleName} ${catLabel}`;
    }

    // Capitalize properly
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();

    const data: StyleDetailProps = {
        id: decodedId,
        name: displayName,
        avgScore,
        avgPrice,
        products: finalProducts.map(p => ({
            id: p.id,
            name: p.name,
            averagePrice: p.averagePrice,
            trendScore: p.trendScore || 50,
            imageUrl: p.imageUrl,
            sourceBrand: p.sourceBrand || p.productBrand || 'Unknown',
            productBrand: p.productBrand || null
        })),
        heroImage: topProduct.imageUrl,
        segment: segment || 'homme'
    };

    return (
        <DashboardLayout>
            {/* Dashboard Light Original (Outfity) */}
            <StyleLightDashboard data={data} />
        </DashboardLayout>
    );
}
