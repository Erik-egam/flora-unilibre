import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EspecieRepository } from './especie.repository.js';
import { EspecieService } from './especie.service.js';

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

  beforeEach(async () => {
    repository = createRepository();
    const moduleRef = await Test.createTestingModule({
      providers: [
        EspecieService,
        { provide: EspecieRepository, useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(EspecieService);
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

  it('throws NotFoundException when the especie does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
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
});
