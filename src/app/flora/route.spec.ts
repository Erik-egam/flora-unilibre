import { beforeEach, describe, expect, it, vi } from 'vitest';

const { service } = vi.hoisted(() => ({
  service: { findAll: vi.fn(), create: vi.fn() },
}));

vi.mock('@/modules/flora', () => ({
  getFloraService: () => service,
}));

import { GET, POST } from './route';

const flora = {
  id: 50,
  plantaId: 2,
  latitud: 4.60971,
  longitud: -74.08175,
  imgUrl: null,
  estado: 'vivo',
  createdAt: '2026-11-05T10:00:00.000Z',
  planta: {
    id: 2,
    nombreComun: 'Eucalipto',
    especie: {
      id: 1,
      nombreCientifico: 'Eucalyptus grandis',
      familia: { id: 1, nombre: 'Myrtaceae' },
    },
  },
};

function post(body: unknown): Request {
  return new Request('http://localhost/flora', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('GET /flora', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the page with coordinates as numbers', async () => {
    const page = { data: [flora], total: 1, limit: 20, offset: 0 };
    service.findAll.mockResolvedValue(page);

    const response = await GET(
      new Request('http://localhost/flora?estado=vivo'),
    );
    const body = (await response.json()) as typeof page;

    expect(response.status).toBe(200);
    expect(body).toEqual(page);
    expect(typeof body.data[0].latitud).toBe('number');
    expect(service.findAll).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      estado: 'vivo',
    });
  });

  it('rejects an unknown estado with 400', async () => {
    const response = await GET(
      new Request('http://localhost/flora?estado=desconocido'),
    );

    expect(response.status).toBe(400);
    expect(service.findAll).not.toHaveBeenCalled();
  });
});

describe('POST /flora', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a plate and returns 201', async () => {
    service.create.mockResolvedValue(flora);

    const response = await POST(
      post({
        id: 50,
        plantaId: 2,
        latitud: 4.60971,
        longitud: -74.08175,
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual(flora);
    expect(service.create).toHaveBeenCalledWith({
      id: 50,
      plantaId: 2,
      latitud: 4.60971,
      longitud: -74.08175,
    });
  });

  it('rejects coordinates outside the valid range with 400', async () => {
    const response = await POST(
      post({ id: 50, plantaId: 2, latitud: 91, longitud: -74.08175 }),
    );

    expect(response.status).toBe(400);
    expect(service.create).not.toHaveBeenCalled();
  });
});
