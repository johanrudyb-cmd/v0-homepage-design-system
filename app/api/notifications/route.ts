import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les notifications de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Retourner des données vides au lieu de 401 pour éviter les erreurs côté client
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const read = searchParams.get('read'); // 'true', 'false', ou null pour toutes
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { userId: user.id };
    if (read !== null) {
      where.read = read === 'true';
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}

// POST - Créer une notification (pour tests ou système)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, type = 'info', link } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Titre et message requis' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        title,
        message,
        type,
        link,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la notification' },
      { status: 500 }
    );
  }
}
