/**
 * Route API pour convertir une tendance en données Design Studio
 * 
 * POST /api/trends/to-design
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { trendToDesign } from '@/lib/trend-to-design';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const {
      productType,
      cut,
      material,
      color,
      style,
      productName,
      averagePrice,
      brands,
    } = body;

    // Créer un objet TrendSignal-like pour la conversion
    const trendSignal = {
      productName: productName || productType,
      productType,
      cut: cut || null,
      material: material || null,
      color: color || null,
      brands: brands || [],
      averagePrice: averagePrice || 0,
      confirmationScore: brands?.length || 0,
      isConfirmed: true,
      firstSeenAt: new Date(),
      confirmedAt: new Date(),
      country: null,
      style: style || null,
    };

    // Convertir en données Design Studio
    const designData = trendToDesign(trendSignal);

    return NextResponse.json({
      success: true,
      designData,
    });
  } catch (error: any) {
    console.error('[Trend to Design] Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
