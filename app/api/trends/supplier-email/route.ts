/**
 * Route API pour générer un email fournisseur depuis une tendance
 * 
 * POST /api/trends/supplier-email
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { generateSupplierEmail } from '@/lib/supplier-email-generator';

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
      confirmationScore,
      quantity,
      targetPrice,
      customMessage,
    } = body;

    // Créer un objet TrendSignal-like
    const trendSignal = {
      productName: productName || productType,
      productType,
      cut: cut || null,
      material: material || null,
      color: color || null,
      brands: brands || [],
      averagePrice: averagePrice || 0,
      confirmationScore: confirmationScore || 0,
      isConfirmed: true,
      firstSeenAt: new Date(),
      confirmedAt: new Date(),
      country: null,
      style: style || null,
    };

    // Générer l'email (sans contexte marché, juste les infos essentielles)
    const emailData = generateSupplierEmail(trendSignal, {
      quantity,
      targetPrice,
      customMessage,
    });

    return NextResponse.json({
      success: true,
      emailData,
      productType: productType,
      material: material || null,
    });
  } catch (error: any) {
    console.error('[Supplier Email] Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
