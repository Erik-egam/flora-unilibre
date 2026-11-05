import { ConfigService } from '@nestjs/config';
import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from './supabase.service.js';

function config(values: Record<string, string | undefined>): ConfigService {
  return { get: (key: string) => values[key] } as unknown as ConfigService;
}

/** `supabaseUrl`/`supabaseKey` are protected in the type but present at runtime. */
function clientConfig(client: SupabaseClient): {
  supabaseUrl: string;
  supabaseKey: string;
} {
  return client as unknown as { supabaseUrl: string; supabaseKey: string };
}

describe('SupabaseService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates the anon client from the environment', () => {
    const service = new SupabaseService(
      config({
        SUPABASE_URL: 'https://project-ref.supabase.co',
        SUPABASE_ANON_KEY: 'anon-key',
      }),
    );

    expect(clientConfig(service.client)).toMatchObject({
      supabaseUrl: 'https://project-ref.supabase.co',
      supabaseKey: 'anon-key',
    });
  });

  it('does not expose an admin client without a service role key', () => {
    const service = new SupabaseService(
      config({
        SUPABASE_URL: 'https://project-ref.supabase.co',
        SUPABASE_ANON_KEY: 'anon-key',
      }),
    );

    expect(service.hasAdminClient).toBe(false);
    expect(() => service.admin).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it('creates the admin client when a service role key is present', () => {
    const service = new SupabaseService(
      config({
        SUPABASE_URL: 'https://project-ref.supabase.co',
        SUPABASE_ANON_KEY: 'anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      }),
    );

    expect(service.hasAdminClient).toBe(true);
    expect(clientConfig(service.admin).supabaseKey).toBe('service-role-key');
  });

  it('fails when the URL is missing', () => {
    expect(
      () => new SupabaseService(config({ SUPABASE_ANON_KEY: 'anon-key' })),
    ).toThrow(/SUPABASE_URL is not configured/);
  });

  it('reports healthy when the REST endpoint answers', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const service = new SupabaseService(
      config({
        SUPABASE_URL: 'https://project-ref.supabase.co',
        SUPABASE_ANON_KEY: 'anon-key',
      }),
    );

    await expect(service.isHealthy()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('https://project-ref.supabase.co/rest/v1/'),
      expect.objectContaining({ headers: { apikey: 'anon-key' } }),
    );
  });

  it('reports unhealthy when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const service = new SupabaseService(
      config({
        SUPABASE_URL: 'https://project-ref.supabase.co',
        SUPABASE_ANON_KEY: 'anon-key',
      }),
    );

    await expect(service.isHealthy()).resolves.toBe(false);
  });
});
