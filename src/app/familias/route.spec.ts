import { beforeEach, describe, expect, it, vi } from 'vitest';

const { service } = vi.hoisted(() => ({
  service: { findAll: vi.fn(), create: vi.fn() },
}));

vi.mock('@/modules/familia', () => ({
  getFamiliaService: () => service,
}));

import { GET, POST } from './route';

const familia = { id: 1, nombre: 'Myrtaceae', descripcion: null };

function post(body: unknown): Request {
  return new Request('http://localhost/familias', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('GET /familias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the page and forwards the parsed query', async () => {
    const page = { data: [familia], total: 1, limit: 5, offset: 0 };
    service.findAll.mockResolvedValue(page);

    const response = await GET(
      new Request('http://localhost/familias?limit=5&q=myr'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(page);
    expect(service.findAll).toHaveBeenCalledWith({
      limit: 5,
      offset: 0,
      q: 'myr',
    });
  });

  it('rejects an invalid query with 400', async () => {
    const response = await GET(
      new Request('http://localhost/familias?limit=0'),
    );

    expect(response.status).toBe(400);
    expect(service.findAll).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ statusCode: 400 });
  });
});

describe('POST /familias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a familia and returns 201', async () => {
    service.create.mockResolvedValue(familia);

    const response = await POST(post({ nombre: 'Myrtaceae' }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual(familia);
    expect(service.create).toHaveBeenCalledWith({ nombre: 'Myrtaceae' });
  });

  it('rejects unknown fields with 400', async () => {
    const response = await POST(post({ nombre: 'Myrtaceae', id: 1 }));

    expect(response.status).toBe(400);
    expect(service.create).not.toHaveBeenCalled();
  });
});
