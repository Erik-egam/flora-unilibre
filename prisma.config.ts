// Prisma CLI configuration. Runtime credentials live in `.env`; Prisma 7 no
// longer loads it automatically, hence the `dotenv/config` import.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Migrations and introspection must use Supabase's direct connection
    // (port 5432). The app talks to the pooled one through DATABASE_URL.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
