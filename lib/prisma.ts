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
    throw new Error(
      'DATABASE_URL environment variable is not set. Please configure it to connect to your PostgreSQL database.'
    );
  }
  // Pass the datasource URL programmatically to bypass schema-level env() validation
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url,
      },
    },
  });
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
    return Reflect.get(getPrismaClient(), prop, receiver);
  },
});
