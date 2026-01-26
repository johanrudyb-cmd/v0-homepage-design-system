import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const brands = await prisma.brand.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ brands });
  } catch (error: any) {
    console.error('Erreur dans /api/brands GET:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le nom de la marque est requis' },
        { status: 400 }
      );
    }

    // Créer la marque
    const brand = await prisma.brand.create({
      data: {
        userId: user.id,
        name: name.trim(),
      },
    });

    // Créer le Launch Map associé
    await prisma.launchMap.create({
      data: {
        brandId: brand.id,
      },
    });

    return NextResponse.json({ success: true, brand }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur dans /api/brands POST:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
