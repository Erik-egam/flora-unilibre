import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/errors';
import type { EspecieRepository } from './especie.repository';
import { EspecieService } from './especie.service';

const especie = {
  id: 1,
  familiaId: 1,
  nombreCientifico: 'Eucalyptus grandis W.Hill ex Maiden',
  descripcion: null,
  familia: { id: 1, nombre: 'Myrtaceae' },
};

function createRepository() {
  return {
    findPage: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

describe('EspecieService', () => {
  let service: EspecieService;
  let repository: ReturnType<typeof createRepository>;

  beforeEach(() => {
    repository = createRepository();
    service = new EspecieService(repository as unknown as EspecieRepository);
  });

  it('returns a page of especies with their familia', async () => {
    repository.findPage.mockResolvedValue([[especie], 1]);

    await expect(
      service.findAll({ limit: 20, offset: 0, familiaId: 1 }),
    ).resolves.toEqual({
      data: [especie],
      total: 1,
      limit: 20,
      offset: 0,
    });
    expect(repository.findPage).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      familiaId: 1,
    });
  });

  it('throws a 404 ApiError when the especie does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Especie 99 no encontrada',
    });
  });

  it('creates an especie with an explicit null description', async () => {
    repository.create.mockResolvedValue(especie);

    await service.create({ familiaId: 1, nombreCientifico: 'Eucalyptus' });

    expect(repository.create).toHaveBeenCalledWith({
      familiaId: 1,
      nombreCientifico: 'Eucalyptus',
      descripcion: null,
    });
  });

  it('checks existence before updating and deleting', async () => {
    repository.findById.mockResolvedValue(especie);
    repository.update.mockResolvedValue(especie);
    repository.remove.mockResolvedValue(especie);

    await service.update(1, { familiaId: 2 });
    await service.remove(1);

    expect(repository.update).toHaveBeenCalledWith(1, { familiaId: 2 });
    expect(repository.remove).toHaveBeenCalledWith(1);
  });

  it('does not write when the especie is missing', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.update(99, { familiaId: 2 })).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });
});
