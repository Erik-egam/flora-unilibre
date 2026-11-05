const REQUIRED_VARIABLES = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'DATABASE_URL',
] as const;
const OPTIONAL_VARIABLES = ['SUPABASE_SERVICE_ROLE_KEY', 'DIRECT_URL'] as const;

/**
 * Validates the environment before the application boots, so a missing or
 * malformed Supabase/Prisma configuration fails fast instead of surfacing as a
 * confusing runtime error on the first database call.
 *
 * Wired into `ConfigModule.forRoot()` in `app.module.ts`.
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const errors: string[] = [];
  const env = { ...config };

  for (const name of [...REQUIRED_VARIABLES, ...OPTIONAL_VARIABLES]) {
    const value = env[name];
    const isRequired = (REQUIRED_VARIABLES as readonly string[]).includes(name);
    const isBlank = typeof value === 'string' && value.trim() === '';

    if (value === undefined || isBlank) {
      if (isRequired) {
        errors.push(`${name} is required`);
      } else {
        // An empty optional variable is the same as not setting it, so
        // `.env.example` can list it with an empty value.
        delete env[name];
      }
      continue;
    }
    if (typeof value !== 'string') {
      errors.push(`${name} must be a string`);
      continue;
    }
    env[name] = value.trim();
  }

  if (typeof env.SUPABASE_URL === 'string') {
    try {
      const url = new URL(env.SUPABASE_URL);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        errors.push('SUPABASE_URL must use the http or https protocol');
      }
    } catch {
      errors.push(
        'SUPABASE_URL must be a valid URL (e.g. https://<project-ref>.supabase.co)',
      );
    }
  }

  for (const name of ['DATABASE_URL', 'DIRECT_URL'] as const) {
    const value = env[name];
    if (typeof value !== 'string') {
      continue;
    }
    if (!/^postgres(ql)?:\/\//.test(value)) {
      errors.push(
        `${name} must be a PostgreSQL connection string (postgresql://...)`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n- ${errors.join('\n- ')}`);
  }

  return env;
}
