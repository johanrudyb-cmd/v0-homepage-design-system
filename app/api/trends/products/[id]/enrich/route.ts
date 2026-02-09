/**
 * POST /api/trends/products/[id]/enrich
 * Complète les champs manquants du produit tendance via IA.
 * Ne modifie pas segment ni marketZone.
 */

import { NextResponse } from 'next/server';
import { sanitizeErrorMessage } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { enrichProductDetails, isChatGptConfigured } from '@/lib/api/chatgpt';
import { isRetailerBrand } from '@/lib/constants/retailer-exclusion';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!isChatGptConfigured()) {
      return NextResponse.json(
        { error: 'Clé API requise pour l\'enrichissement.' },
        { status: 503 }
      );
    }

    const { id } = await params;
    const product = await prisma.trendProduct.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    const enriched = await enrichProductDetails({
      name: product.name,
      category: product.category,
      material: product.material,
      productBrand: product.productBrand,
      style: product.style,
      color: product.color,
      careInstructions: product.careInstructions,
      description: product.description,
      cut: product.cut,
      averagePrice: product.averagePrice,
      imageUrl: product.imageUrl,
      estimatedCogsPercent: product.estimatedCogsPercent,
      complexityScore: product.complexityScore,
      sustainabilityScore: product.sustainabilityScore,
      visualAttractivenessScore: product.visualAttractivenessScore,
      dominantAttribute: product.dominantAttribute,
    });

    const updates: Record<string, unknown> = {};
    if (enriched.category != null && (product.category === 'Autre' || !product.category?.trim())) updates.category = enriched.category;
    if (enriched.style != null && (!product.style || product.style.trim() === '')) updates.style = enriched.style;
    if (enriched.material != null && (!product.material || product.material === 'Non spécifié')) updates.material = enriched.material;
    if (enriched.color != null && (!product.color || product.color.trim() === '')) updates.color = enriched.color;
    if (enriched.careInstructions != null && (!product.careInstructions || product.careInstructions.trim() === '')) updates.careInstructions = enriched.careInstructions;
    if (enriched.description != null && (!product.description || product.description.trim() === '')) updates.description = enriched.description;
    if (enriched.cut != null && (!product.cut || product.cut.trim() === '')) updates.cut = enriched.cut;
    const needsProductBrand = !product.productBrand || product.productBrand.trim() === '' || /^\._\.$/i.test(product.productBrand.trim());
if (enriched.productBrand != null && needsProductBrand && !isRetailerBrand(enriched.productBrand)) updates.productBrand = enriched.productBrand;
    if (enriched.estimatedCogsPercent != null && product.estimatedCogsPercent == null) updates.estimatedCogsPercent = enriched.estimatedCogsPercent;
    if (enriched.complexityScore != null && (!product.complexityScore || product.complexityScore.trim() === '')) updates.complexityScore = enriched.complexityScore;
    if (enriched.sustainabilityScore != null && product.sustainabilityScore == null) updates.sustainabilityScore = enriched.sustainabilityScore;
    if (enriched.visualAttractivenessScore != null && product.visualAttractivenessScore == null) updates.visualAttractivenessScore = enriched.visualAttractivenessScore;
    if (enriched.dominantAttribute != null && (!product.dominantAttribute || product.dominantAttribute.trim() === '')) updates.dominantAttribute = enriched.dominantAttribute;

    if (Object.keys(updates).length > 0) {
      await prisma.trendProduct.update({
        where: { id },
        data: updates,
      });
    }

    return NextResponse.json({
      enriched: Object.keys(updates).length > 0,
      fieldsUpdated: Object.keys(updates),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur';
    console.error('[Enrich Product]', e);
    return NextResponse.json({ error: sanitizeErrorMessage(message) }, { status: 500 });
  }
}
