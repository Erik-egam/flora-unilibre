import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/errors';
import type { PlantaRepository } from './planta.repository';
import { PlantaService } from './planta.service';

const planta = {
  id: 2,
  especieId: 1,
  nombreComun: 'Eucalipto',
  descripcion: null,
  imgUrl: null,
  especie: {
    id: 1,
    nombreCientifico: 'Eucalyptus grandis W.Hill ex Maiden',
    familia: { id: 1, nombre: 'Myrtaceae' },
  },
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

describe('PlantaService', () => {
  let service: PlantaService;
  let repository: ReturnType<typeof createRepository>;

  beforeEach(() => {
    repository = createRepository();
    service = new PlantaService(repository as unknown as PlantaRepository);
  });

  it('returns a page of plantas with especie and familia', async () => {
    repository.findPage.mockResolvedValue([[planta], 1]);

    await expect(
      service.findAll({ limit: 20, offset: 0, especieId: 1 }),
    ).resolves.toEqual({
      data: [planta],
      total: 1,
      limit: 20,
      offset: 0,
    });
  });

  it('throws a 404 ApiError when the planta does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Planta 99 no encontrada',
    });
  });

  it('creates a planta with explicit nulls for optional fields', async () => {
    repository.create.mockResolvedValue(planta);

    await service.create({ especieId: 1, nombreComun: 'Eucalipto' });

    expect(repository.create).toHaveBeenCalledWith({
      especieId: 1,
      nombreComun: 'Eucalipto',
      descripcion: null,
      imgUrl: null,
    });
  });

  it('checks existence before updating and deleting', async () => {
    repository.findById.mockResolvedValue(planta);
    repository.update.mockResolvedValue(planta);
    repository.remove.mockResolvedValue(planta);

    await service.update(2, { nombreComun: 'Eucalipto rojo' });
    await service.remove(2);

    expect(repository.update).toHaveBeenCalledWith(2, {
      nombreComun: 'Eucalipto rojo',
    });
    expect(repository.remove).toHaveBeenCalledWith(2);
  });

  it('does not write when the planta is missing', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.update(99, { nombreComun: 'X' }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
