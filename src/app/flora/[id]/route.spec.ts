import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/errors';

const { service } = vi.hoisted(() => ({
  service: { findOne: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

vi.mock('@/modules/flora', () => ({
  getFloraService: () => service,
}));

import { DELETE, GET, PATCH } from './route';

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

function context(id: string) {
  return { params: Promise.resolve({ id }) };
}

function patch(body: unknown): Request {
  return new Request('http://localhost/flora/50', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('GET /flora/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns one plate', async () => {
    service.findOne.mockResolvedValue(flora);

    const response = await GET(
      new Request('http://localhost/flora/50'),
      context('50'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(flora);
    expect(service.findOne).toHaveBeenCalledWith(50);
  });

  it('maps a missing plate to 404', async () => {
    service.findOne.mockRejectedValue(new ApiError(404, 'Flora 999 no encontrada'));

    const response = await GET(
      new Request('http://localhost/flora/999'),
      context('999'),
    );

    expect(response.status).toBe(404);
  });
});

describe('PATCH /flora/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates the mutable fields', async () => {
    service.update.mockResolvedValue(flora);

    const response = await PATCH(patch({ estado: 'talado' }), context('50'));

    expect(response.status).toBe(200);
    expect(service.update).toHaveBeenCalledWith(50, { estado: 'talado' });
  });

  it('rejects patching the immutable plate number with 400', async () => {
    const response = await PATCH(patch({ id: 51 }), context('50'));

    expect(response.status).toBe(400);
    expect(service.update).not.toHaveBeenCalled();
  });
});

describe('DELETE /flora/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a plate and returns 204', async () => {
    service.remove.mockResolvedValue(undefined);

    const response = await DELETE(
      new Request('http://localhost/flora/50', { method: 'DELETE' }),
      context('50'),
    );

    expect(response.status).toBe(204);
    expect(service.remove).toHaveBeenCalledWith(50);
  });
});
