import { z } from 'zod';

/**
 * Validates the environment on first use, so a missing or malformed
 * Supabase/Prisma configuration fails fast with a clear message instead of
 * surfacing as a confusing runtime error on the first database call.
 *
 * Validation is lazy on purpose: `next build` imports route modules, and the
 * build must not require real credentials.
 */
function requiredString() {
  return z
    .string({ error: 'is required' })
    .trim()
    .min(1, 'is required');
}

function postgresUrl() {
  return requiredString().regex(
    /^postgres(ql)?:\/\//,
    'must be a PostgreSQL connection string (postgresql://...)',
  );
}

const envSchema = z.object({
  SUPABASE_URL: requiredString()
    .url('must be a valid URL (e.g. https://<project-ref>.supabase.co)')
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        // Malformed values are already reported by `.url()`; Zod 4 still runs
        // refinements after a failed check, so this must never throw.
        return true;
      }
    }, 'must use the http or https protocol'),
  SUPABASE_ANON_KEY: requiredString(),

  // An empty optional variable is the same as not setting it, so
  // `.env.example` can list it with an empty value.
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() === '' ? undefined : value,
    requiredString().optional(),
  ),

  DATABASE_URL: postgresUrl(),
  DIRECT_URL: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() === '' ? undefined : value,
    postgresUrl().optional(),
  ),

  PORT: z.coerce
    .number({ error: 'must be a number' })
    .int('must be an integer')
    .positive('must be positive')
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

/** Parses and validates an environment map. Exported for tests. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      const name = issue.path.join('.');
      return name ? `${name} ${issue.message}` : issue.message;
    });

    throw new Error(`Environment validation failed:\n- ${errors.join('\n- ')}`);
  }

  // An empty optional variable is treated as not set: drop the keys Zod leaves
  // behind as `undefined` so `'X' in env` is false.
  return Object.fromEntries(
    Object.entries(result.data).filter(([, value]) => value !== undefined),
  ) as Env;
}

let cached: Env | undefined;

/**
 * Returns the validated environment, parsing it once per process.
 *
 * Wired into `src/lib/prisma.ts` and `src/lib/supabase.ts`, which are only
 * imported by route handlers.
 */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
