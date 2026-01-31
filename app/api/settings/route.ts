import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Récupérer les paramètres de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        plan: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les paramètres de l'utilisateur
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { name, image, email, currentPassword, newPassword } = body;

    const updateData: any = {};

    // Mettre à jour le nom (permettre les chaînes vides qui deviennent null)
    if (name !== undefined) {
      updateData.name = name.trim() || null;
    }

    // Mettre à jour l'image (permettre les chaînes vides qui deviennent null)
    if (image !== undefined) {
      updateData.image = image.trim() || null;
    }

    // Mettre à jour l'email (nécessite vérification)
    if (email !== undefined && email !== user.email) {
      // Vérifier si l'email n'est pas déjà utilisé
      const existingUser = await prisma.user.findUnique({
        where: { email: email.trim() },
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé par un autre compte' },
          { status: 400 }
        );
      }

      updateData.email = email.trim();
      updateData.emailVerified = null; // Nécessite re-vérification
    }

    // Mettre à jour le mot de passe
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Mot de passe actuel requis' },
          { status: 400 }
        );
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      });

      if (!currentUser?.password) {
        return NextResponse.json(
          { error: 'Aucun mot de passe défini pour ce compte' },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(
        currentPassword,
        currentUser.password
      );

      if (!isValid) {
        return NextResponse.json(
          { error: 'Mot de passe actuel incorrect' },
          { status: 401 }
        );
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        plan: true,
        emailVerified: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
}
