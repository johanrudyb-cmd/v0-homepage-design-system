import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Returns true if DATABASE_URL is configured and Prisma can be used.
 */
export function isDatabaseAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    const error = new Error(
      'DATABASE_URL environment variable is not set. Please configure it to connect to your PostgreSQL database.'
    );
    console.error('[PRISMA]', error.message);
    throw error;
  }
  
  try {
    // Pass the datasource URL programmatically to bypass schema-level env() validation
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url,
        },
      },
    });
    
    // Vérifier que le client est bien créé (test simple)
    if (!client || typeof client.user === 'undefined') {
      throw new Error('Prisma Client créé mais modèle User non disponible. Vérifiez que prisma generate a été exécuté.');
    }
    
    return client;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[PRISMA] Erreur lors de la création du client:', errorMessage);
    
    // Si c'est une erreur de génération Prisma, donner un message plus clair
    if (errorMessage.includes('Cannot find module') || errorMessage.includes('@prisma/client')) {
      throw new Error(
        'Prisma Client non généré. Exécutez "prisma generate" ou "npm run db:generate". ' +
        'En production, vérifiez que "postinstall" script est configuré dans package.json.'
      );
    }
    
    throw error;
  }
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Use a Proxy so the PrismaClient is only created on first actual use,
// not at import time. This prevents the schema-level env("DATABASE_URL")
// validation from running when the module is first imported.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    // Special properties that should not trigger client creation
    if (prop === Symbol.toPrimitive || prop === Symbol.toStringTag || prop === 'then') {
      return undefined;
    }
    
    try {
      return Reflect.get(getPrismaClient(), prop, receiver);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[PRISMA] Erreur lors de l\'accès à Prisma Client:', {
        property: String(prop),
        error: errorMessage,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      });
      throw error;
    }
  },
});
