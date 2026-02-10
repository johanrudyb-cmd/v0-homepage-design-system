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
    // Configuration optimisée pour production avec connection pooling
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          url,
        },
      },
      // Configuration pour éviter les connexions inutiles
      errorFormat: 'minimal',
    });
    
    // Vérifier que le client est bien créé
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

// Helper pour gérer les erreurs de connexion avec retry simple
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 1,
  delay = 100
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Si c'est une erreur de connexion, réessayer une fois
      if (
        attempt < maxRetries &&
        (errorMessage.includes('P1001') || // Prisma connection error
         errorMessage.includes('connection') ||
         errorMessage.includes('ECONNREFUSED') ||
         errorMessage.includes('ETIMEDOUT'))
      ) {
        console.warn(`[PRISMA] Tentative ${attempt + 1}/${maxRetries + 1} échouée, réessai...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Sinon, propager l'erreur
      throw error;
    }
  }
  
  throw lastError;
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
    
    const client = getPrismaClient();
    const originalValue = Reflect.get(client, prop, receiver);
    
    // Si c'est une méthode (findUnique, findMany, etc.), wrapper avec retry
    if (typeof originalValue === 'function' && prop !== 'constructor') {
      return function (this: unknown, ...args: unknown[]) {
        return withRetry(() => originalValue.apply(this, args));
      };
    }
    
    return originalValue;
  },
});
