import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/errors';
import type { FamiliaRepository } from './familia.repository';
import { FamiliaService } from './familia.service';

const familia = { id: 1, nombre: 'Myrtaceae', descripcion: null };

function createRepository() {
  return {
    findPage: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

describe('FamiliaService', () => {
  let service: FamiliaService;
  let repository: ReturnType<typeof createRepository>;

  beforeEach(() => {
    repository = createRepository();
    service = new FamiliaService(repository as unknown as FamiliaRepository);
  });

  it('returns a page with total, limit and offset', async () => {
    repository.findPage.mockResolvedValue([[familia], 1]);

    await expect(service.findAll({ limit: 20, offset: 0 })).resolves.toEqual({
      data: [familia],
      total: 1,
      limit: 20,
      offset: 0,
    });
  });

  it('throws a 404 ApiError when the familia does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Familia 99 no encontrada',
    });
    await expect(service.findOne(99)).rejects.toBeInstanceOf(ApiError);
  });

  it('creates a familia with an explicit null description', async () => {
    repository.create.mockResolvedValue(familia);

    await expect(service.create({ nombre: 'Myrtaceae' })).resolves.toEqual(
      familia,
    );
    expect(repository.create).toHaveBeenCalledWith({
      nombre: 'Myrtaceae',
      descripcion: null,
    });
  });

  it('checks existence before updating and deleting', async () => {
    repository.findById.mockResolvedValue(familia);
    repository.update.mockResolvedValue(familia);
    repository.remove.mockResolvedValue(familia);

    await service.update(1, { nombre: 'Myrtaceae' });
    await service.remove(1);

    expect(repository.update).toHaveBeenCalledWith(1, { nombre: 'Myrtaceae' });
    expect(repository.remove).toHaveBeenCalledWith(1);
  });

  it('does not write when the familia is missing', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.update(99, { nombre: 'X' })).rejects.toBeInstanceOf(
      ApiError,
    );
    await expect(service.remove(99)).rejects.toBeInstanceOf(ApiError);
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.remove).not.toHaveBeenCalled();
  });
});
