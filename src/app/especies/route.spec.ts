import { beforeEach, describe, expect, it, vi } from 'vitest';

const { service } = vi.hoisted(() => ({
  service: { findAll: vi.fn(), create: vi.fn() },
}));

vi.mock('@/modules/especie', () => ({
  getEspecieService: () => service,
}));

import { GET, POST } from './route';

const especie = {
  id: 1,
  familiaId: 1,
  nombreCientifico: 'Eucalyptus grandis',
  descripcion: null,
  familia: { id: 1, nombre: 'Myrtaceae' },
};

function post(body: unknown): Request {
  return new Request('http://localhost/especies', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('GET /especies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the page and forwards the filters', async () => {
    const page = { data: [especie], total: 1, limit: 20, offset: 0 };
    service.findAll.mockResolvedValue(page);

    const response = await GET(
      new Request('http://localhost/especies?familiaId=1&q=euc'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(page);
    expect(service.findAll).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      familiaId: 1,
      q: 'euc',
    });
  });
});

describe('POST /especies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an especie and returns 201', async () => {
    service.create.mockResolvedValue(especie);

    const response = await POST(
      post({ familiaId: 1, nombreCientifico: 'Eucalyptus grandis' }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual(especie);
    expect(service.create).toHaveBeenCalledWith({
      familiaId: 1,
      nombreCientifico: 'Eucalyptus grandis',
    });
  });

  it('rejects a missing parent with 400', async () => {
    const response = await POST(post({ nombreCientifico: 'X' }));

    expect(response.status).toBe(400);
    expect(service.create).not.toHaveBeenCalled();
  });
});
