import { auth } from './auth';
import { prisma, isDatabaseAvailable } from './prisma';

import { cache } from 'react';

// Utiliser React.cache pour mémoriser le résultat par requête (Request Memoization)
// Cela évite de refaire la même requête prisma si getCurrentUser est appelé 
// plusieurs fois dans différents composants du même arbre (ex: layout + page)
export const getCurrentUser = cache(async () => {
  try {
    const session = await auth();

    if (!session?.user?.id || !isDatabaseAvailable()) {
      return null;
    }

    // Récupérer les infos essentielles depuis la DB
    // On ne sélectionne que ce dont on a vraiment besoin pour la navigation/UI
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
});

/**
 * Vérifie si l'utilisateur actuel a les droits admin
 */
export async function getIsAdmin() {
  const user = await getCurrentUser();
  const adminEmails = ['contact@outfity.fr', 'johanrudyb@gmail.com'];
  return !!user?.email && (adminEmails.includes(user.email) || user.email.endsWith('@biangory.com'));
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Non authentifié');
  }
  return user;
}
