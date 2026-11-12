import { beforeEach, describe, expect, it, vi } from 'vitest';

const { healthy } = vi.hoisted(() => ({ healthy: vi.fn() }));

vi.mock('@/lib/supabase', () => ({
  isSupabaseHealthy: healthy,
}));

import { GET } from './route';

describe('GET /health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 when Supabase is reachable', async () => {
    healthy.mockResolvedValue(true);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: 'ok',
      supabase: 'up',
    });
  });

  it('returns 503 when Supabase is unreachable', async () => {
    healthy.mockResolvedValue(false);

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      status: 'degraded',
      supabase: 'down',
    });
  });
});
