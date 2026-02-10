import { auth } from './auth';
import { prisma, isDatabaseAvailable } from './prisma';

export async function getCurrentUser() {
  try {
    const session = await auth();

    if (!session?.user?.id || !isDatabaseAvailable()) {
      return null;
    }

    // Récupérer le plan depuis la base de données pour avoir la valeur à jour
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        subscribedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || session.user.name,
      plan: user.plan,
      subscribedAt: user.subscribedAt ?? null,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error('[getCurrentUser] Erreur:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Non authentifié');
  }
  return user;
}
