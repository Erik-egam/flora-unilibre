import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/errors';

const { service } = vi.hoisted(() => ({
  service: { findOne: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

vi.mock('@/modules/familia', () => ({
  getFamiliaService: () => service,
}));

import { DELETE, GET, PATCH } from './route';

const familia = { id: 1, nombre: 'Myrtaceae', descripcion: null };

function context(id: string) {
  return { params: Promise.resolve({ id }) };
}

function patch(body: unknown): Request {
  return new Request('http://localhost/familias/1', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('GET /familias/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns one familia', async () => {
    service.findOne.mockResolvedValue(familia);

    const response = await GET(new Request('http://localhost/familias/1'), context('1'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(familia);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('rejects a non-numeric id with 400', async () => {
    const response = await GET(
      new Request('http://localhost/familias/abc'),
      context('abc'),
    );

    expect(response.status).toBe(400);
    expect(service.findOne).not.toHaveBeenCalled();
  });

  it('maps a missing familia to 404', async () => {
    service.findOne.mockRejectedValue(new ApiError(404, 'Familia 99 no encontrada'));

    const response = await GET(
      new Request('http://localhost/familias/99'),
      context('99'),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Familia 99 no encontrada',
    });
  });
});

describe('PATCH /familias/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a familia', async () => {
    service.update.mockResolvedValue(familia);

    const response = await PATCH(patch({ nombre: 'X' }), context('1'));

    expect(response.status).toBe(200);
    expect(service.update).toHaveBeenCalledWith(1, { nombre: 'X' });
  });

  it('rejects unknown fields with 400', async () => {
    const response = await PATCH(patch({ id: 2 }), context('1'));

    expect(response.status).toBe(400);
    expect(service.update).not.toHaveBeenCalled();
  });
});

describe('DELETE /familias/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a familia and returns 204', async () => {
    service.remove.mockResolvedValue(undefined);

    const response = await DELETE(
      new Request('http://localhost/familias/1', { method: 'DELETE' }),
      context('1'),
    );

    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe('');
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
