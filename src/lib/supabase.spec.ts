import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  checkSupabaseHealth,
  createSupabaseClients,
} from './supabase';

/** `supabaseUrl`/`supabaseKey` are protected in the type but present at runtime. */
function clientConfig(client: SupabaseClient): {
  supabaseUrl: string;
  supabaseKey: string;
} {
  return client as unknown as { supabaseUrl: string; supabaseKey: string };
}

const url = 'https://project-ref.supabase.co';
const anonKey = 'anon-key';

describe('createSupabaseClients', () => {
  it('creates the anon client from explicit values', () => {
    const { client } = createSupabaseClients(url, anonKey);

    expect(clientConfig(client)).toMatchObject({
      supabaseUrl: url,
      supabaseKey: anonKey,
    });
  });

  it('does not expose an admin client without a service role key', () => {
    expect(createSupabaseClients(url, anonKey).admin).toBeUndefined();
  });

  it('creates the admin client when a service role key is present', () => {
    const { admin } = createSupabaseClients(url, anonKey, 'service-role-key');

    expect(admin).toBeDefined();
    expect(clientConfig(admin!).supabaseKey).toBe('service-role-key');
  });
});

describe('checkSupabaseHealth', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports healthy when the REST endpoint answers', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(checkSupabaseHealth(url, anonKey)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL(`${url}/rest/v1/`),
      expect.objectContaining({ headers: { apikey: anonKey } }),
    );
  });

  it('reports unhealthy when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(checkSupabaseHealth(url, anonKey)).resolves.toBe(false);
  });

  it('reports unhealthy when the endpoint answers with an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );

    await expect(checkSupabaseHealth(url, anonKey)).resolves.toBe(false);
  });
});
