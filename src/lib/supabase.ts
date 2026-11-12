import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from './env';

/** This is a backend: there is no browser session to persist. */
const CLIENT_OPTIONS = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

export interface SupabaseClients {
  /** Anon client: every query goes through Row Level Security. */
  client: SupabaseClient;
  /** Service role client: bypasses RLS, server-side only. */
  admin?: SupabaseClient;
}

/** Builds the clients from explicit values. Exported for tests. */
export function createSupabaseClients(
  url: string,
  anonKey: string,
  serviceRoleKey?: string,
): SupabaseClients {
  return {
    client: createClient(url, anonKey, CLIENT_OPTIONS),
    admin: serviceRoleKey
      ? createClient(url, serviceRoleKey, CLIENT_OPTIONS)
      : undefined,
  };
}

let cached: SupabaseClients | undefined;

function getClients(): SupabaseClients {
  if (!cached) {
    const env = getEnv();
    cached = createSupabaseClients(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
      env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  return cached;
}

/** Anon client: safe for requests made on behalf of a signed-in user. */
export function getSupabaseClient(): SupabaseClient {
  return getClients().client;
}

/** Whether a service role key was configured. */
export function hasSupabaseAdmin(): boolean {
  return getEnv().SUPABASE_SERVICE_ROLE_KEY !== undefined;
}

/** Service role client. Throws when `SUPABASE_SERVICE_ROLE_KEY` is not set. */
export function getSupabaseAdmin(): SupabaseClient {
  const admin = getClients().admin;
  if (!admin) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured, so the admin Supabase client is unavailable',
    );
  }

  return admin;
}

/**
 * Checks that the project answers on its REST endpoint. Used by `/health`; it
 * does not require any table to exist. Exported for tests.
 */
export async function checkSupabaseHealth(
  url: string,
  anonKey: string,
): Promise<boolean> {
  try {
    const response = await fetch(new URL('/rest/v1/', url), {
      headers: { apikey: anonKey },
      signal: AbortSignal.timeout(5_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function isSupabaseHealthy(): Promise<boolean> {
  const env = getEnv();
  return checkSupabaseHealth(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}
