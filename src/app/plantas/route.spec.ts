import { beforeEach, describe, expect, it, vi } from 'vitest';

const { service } = vi.hoisted(() => ({
  service: { findAll: vi.fn(), create: vi.fn() },
}));

vi.mock('@/modules/planta', () => ({
  getPlantaService: () => service,
}));

import { GET, POST } from './route';

const planta = {
  id: 2,
  especieId: 1,
  nombreComun: 'Eucalipto',
  descripcion: null,
  imgUrl: null,
  especie: {
    id: 1,
    nombreCientifico: 'Eucalyptus grandis',
    familia: { id: 1, nombre: 'Myrtaceae' },
  },
};

function post(body: unknown): Request {
  return new Request('http://localhost/plantas', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('GET /plantas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the page and forwards the filters', async () => {
    const page = { data: [planta], total: 1, limit: 20, offset: 0 };
    service.findAll.mockResolvedValue(page);

    const response = await GET(
      new Request('http://localhost/plantas?especieId=1'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(page);
    expect(service.findAll).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      especieId: 1,
    });
  });
});

describe('POST /plantas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a planta and returns 201', async () => {
    service.create.mockResolvedValue(planta);

    const response = await POST(
      post({ especieId: 1, nombreComun: 'Eucalipto' }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual(planta);
    expect(service.create).toHaveBeenCalledWith({
      especieId: 1,
      nombreComun: 'Eucalipto',
    });
  });

  it('rejects an invalid image URL with 400', async () => {
    const response = await POST(
      post({ especieId: 1, nombreComun: 'Eucalipto', imgUrl: 'not-a-url' }),
    );

    expect(response.status).toBe(400);
    expect(service.create).not.toHaveBeenCalled();
  });
});
