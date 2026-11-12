import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { getEnv } from './env';

/**
 * Prisma client shared by every request in this process. The connection is
 * opened lazily on the first query, so booting the app (and running tests)
 * does not require a reachable database.
 *
 * Cached on `globalThis` so Next's dev server reuses the same `pg` pool across
 * hot reloads instead of leaking a new one per module reload.
 */
const globalForPrisma = globalThis as unknown as {
  floraPrisma?: PrismaClient;
};

export function getPrisma(): PrismaClient {
  if (globalForPrisma.floraPrisma) {
    return globalForPrisma.floraPrisma;
  }

  const { DATABASE_URL } = getEnv();

  // Prisma 7 requires a driver adapter. `DATABASE_URL` should be Supabase's
  // pooled connection (port 6543); migrations use `DIRECT_URL` instead.
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: DATABASE_URL }),
  });

  globalForPrisma.floraPrisma = client;

  return client;
}

/** Closes the pool. Useful for scripts and test teardown. */
export async function disconnectPrisma(): Promise<void> {
  if (!globalForPrisma.floraPrisma) {
    return;
  }

  await globalForPrisma.floraPrisma.$disconnect();
  delete globalForPrisma.floraPrisma;
}
