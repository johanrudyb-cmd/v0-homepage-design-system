import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

        const { brandId, designId, price } = await request.json();

        if (!brandId) return NextResponse.json({ error: 'brandId requis' }, { status: 400 });

        const launchMap = await prisma.launchMap.findUnique({
            where: { brandId },
            include: {
                brand: {
                    include: {
                        strategyGenerations: { orderBy: { createdAt: 'desc' }, take: 1 }
                    }
                }
            }
        });

        if (!launchMap || !launchMap.shopifyShopDomain || !launchMap.shopifyAccessToken) {
            return NextResponse.json({ error: 'Shopify non configuré (Domaine + Token requis)' }, { status: 400 });
        }

        const design = designId
            ? await prisma.design.findUnique({ where: { id: designId } })
            : await prisma.design.findFirst({ where: { brandId, status: 'completed' }, orderBy: { createdAt: 'desc' } });

        if (!design) return NextResponse.json({ error: 'Aucun design trouvé pour cette marque' }, { status: 404 });

        const strategy = launchMap.brand.strategyGenerations[0]?.strategyText;

        // Pour une version MVP, on simule l'extraction si elle n'est pas déjà faite par l'IA
        // En production, on utiliserait generateSiteTextsFromStrategy
        const productTitle = design.type + " " + launchMap.brand.name;
        const productDescription = design.productDescription || "Nouveau produit de la marque " + launchMap.brand.name;

        const shop = launchMap.shopifyShopDomain;
        const token = launchMap.shopifyAccessToken;

        // --- LOGIQUE SIMULATEUR (MOCK) ---
        if (token === 'MOCK_STORE') {
            const mockProduct = await prisma.mockShopifyProduct.upsert({
                where: { shopifyId: `mock_${design.id}` },
                update: {
                    title: productTitle,
                    description: productDescription,
                    price: price || 49.90,
                    imageUrl: design.productImageUrl || null,
                    status: 'draft',
                },
                create: {
                    brandId: launchMap.brandId,
                    shopifyId: `mock_${design.id}`,
                    title: productTitle,
                    description: productDescription,
                    vendor: launchMap.brand.name,
                    type: design.type,
                    price: price || 49.90,
                    imageUrl: design.productImageUrl || null,
                    status: 'draft',
                },
            });

            return NextResponse.json({
                success: true,
                isMock: true,
                productId: mockProduct.id,
                productUrl: `/admin/shopify-simulator/${mockProduct.id}`
            });
        }

        const payload = {
            product: {
                title: productTitle,
                body_html: `<strong>${productDescription}</strong>`,
                vendor: launchMap.brand.name,
                product_type: design.type,
                status: 'draft',
                images: design.productImageUrl ? [{ src: design.productImageUrl }] : [],
                variants: [
                    {
                        price: price || 49.90,
                        sku: `${launchMap.brand.name.slice(0, 3).toUpperCase()}-${design.type.slice(0, 3).toUpperCase()}`,
                        inventory_policy: 'deny',
                        fulfillment_service: 'manual',
                        inventory_management: 'shopify'
                    }
                ]
            }
        };

        const response = await fetch(`https://${shop}/admin/api/2024-01/products.json`, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[Shopify Push Error]', data);
            return NextResponse.json({ error: data.errors || 'Erreur Shopify' }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            productId: data.product.id,
            productUrl: `https://${shop}/admin/products/${data.product.id}`
        });

    } catch (e) {
        console.error('[push-to-shopify] POST', e);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
