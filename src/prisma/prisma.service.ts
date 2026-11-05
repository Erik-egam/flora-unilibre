import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

/**
 * Prisma client managed by Nest's lifecycle. The connection is opened lazily on
 * the first query, so booting the app (and running tests) does not require a
 * reachable database.
 *
 * The generated client lives in `src/generated/prisma`, which is git-ignored and
 * rebuilt on install; run `pnpm db:generate` after editing the schema.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }

    // Prisma 7 requires a driver adapter. `DATABASE_URL` should be Supabase's
    // pooled connection (port 6543); migrations use the direct one instead.
    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
