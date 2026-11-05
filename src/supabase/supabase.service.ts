import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Access point for Supabase. The module is global, so any provider can inject
 * this service without importing `SupabaseModule`.
 *
 * - `client` uses the anon key, so every query is subject to Row Level Security.
 * - `admin` uses the service role key and bypasses RLS. Keep it server-side.
 */
@Injectable()
export class SupabaseService {
  /** Anon client: safe for requests made on behalf of a signed-in user. */
  readonly client: SupabaseClient;
  /** Service role client: bypasses RLS, server-side use only. */
  private readonly adminClient?: SupabaseClient;
  private readonly url: string;
  private readonly anonKey: string;

  constructor(config: ConfigService) {
    this.url = required(config, 'SUPABASE_URL');
    this.anonKey = required(config, 'SUPABASE_ANON_KEY');
    const serviceRoleKey = config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    // This is a backend: there is no browser session to persist.
    const options = {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    };

    this.client = createClient(this.url, this.anonKey, options);
    this.adminClient = serviceRoleKey
      ? createClient(this.url, serviceRoleKey, options)
      : undefined;
  }

  /** Whether a service role key was configured. */
  get hasAdminClient(): boolean {
    return this.adminClient !== undefined;
  }

  /** Service role client. Throws when `SUPABASE_SERVICE_ROLE_KEY` is not set. */
  get admin(): SupabaseClient {
    if (!this.adminClient) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY is not configured, so the admin Supabase client is unavailable',
      );
    }
    return this.adminClient;
  }

  /**
   * Checks that the project answers on its REST endpoint. Used by the health
   * endpoint; it does not require any table to exist.
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(new URL('/rest/v1/', this.url), {
        headers: { apikey: this.anonKey },
        signal: AbortSignal.timeout(5_000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

function required(config: ConfigService, name: string): string {
  const value = config.get<string>(name);
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}
