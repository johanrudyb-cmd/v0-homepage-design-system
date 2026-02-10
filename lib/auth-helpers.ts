import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma, isDatabaseAvailable } from './prisma';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-key-change-in-production'
);

export async function getCurrentUser() {
  try {
    if (!isDatabaseAvailable()) {
      return null;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);

    // Récupérer le plan depuis la base de données pour avoir la valeur à jour
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: payload.id as string },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          subscribedAt: true,
          createdAt: true,
        },
      });
    } catch (dbError: unknown) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      
      // Si erreur Prisma/DATABASE_URL, retourner null silencieusement
      if (
        errorMessage.includes('Environment variable not found: DATABASE_URL') ||
        errorMessage.includes('PrismaClientInitializationError') ||
        errorMessage.includes('DATABASE_URL')
      ) {
        console.warn('[getCurrentUser] DATABASE_URL non configuré ou erreur Prisma');
        return null;
      }
      
      // Autre erreur DB, logger et retourner null
      console.error('[getCurrentUser] Erreur DB:', errorMessage);
      return null;
    }

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || (payload.name as string),
      plan: user.plan, // Plan depuis la base de données (toujours à jour)
      subscribedAt: user.subscribedAt ?? null,
      createdAt: user.createdAt,
    };
  } catch (error) {
    // Erreur JWT ou autre, retourner null silencieusement
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
