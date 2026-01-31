/**
 * Route API pour obtenir les statistiques des tendances
 * 
 * GET /api/trends/stats
 * Retourne les statistiques groupées par pays, style, et type de produit
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Statistiques par pays
    const countryStats = await prisma.trendSignal.groupBy({
      by: ['country'],
      where: {
        isConfirmed: true,
        country: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Statistiques par style
    const styleStats = await prisma.trendSignal.groupBy({
      by: ['style'],
      where: {
        isConfirmed: true,
        style: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Statistiques par type de produit
    const productTypeStats = await prisma.trendSignal.groupBy({
      by: ['productType'],
      where: {
        isConfirmed: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Statistiques combinées pays + style
    const countryStyleStats = await prisma.trendSignal.groupBy({
      by: ['country', 'style'],
      where: {
        isConfirmed: true,
        country: { not: null },
        style: { not: null },
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      byCountry: countryStats.map(s => ({
        country: s.country,
        count: s._count.id,
      })),
      byStyle: styleStats.map(s => ({
        style: s.style,
        count: s._count.id,
      })),
      byProductType: productTypeStats.map(s => ({
        productType: s.productType,
        count: s._count.id,
      })),
      byCountryAndStyle: countryStyleStats.map(s => ({
        country: s.country,
        style: s.style,
        count: s._count.id,
      })),
    });
  } catch (error: any) {
    console.error('[Trends Stats] Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
