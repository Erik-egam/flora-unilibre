import { Test } from '@nestjs/testing';
import { EspecieController } from './especie.controller.js';
import { EspecieService } from './especie.service.js';

const especie = {
  id: 1,
  familiaId: 1,
  nombreCientifico: 'Eucalyptus grandis W.Hill ex Maiden',
  descripcion: null,
  familia: { id: 1, nombre: 'Myrtaceae' },
};

function createService() {
  return {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

describe('EspecieController', () => {
  let controller: EspecieController;
  let service: ReturnType<typeof createService>;

  beforeEach(async () => {
    service = createService();
    const moduleRef = await Test.createTestingModule({
      controllers: [EspecieController],
      providers: [{ provide: EspecieService, useValue: service }],
    }).compile();

    controller = moduleRef.get(EspecieController);
  });

  it('delegates every route to the service', async () => {
    const page = { data: [especie], total: 1, limit: 20, offset: 0 };
    service.findAll.mockResolvedValue(page);
    service.findOne.mockResolvedValue(especie);
    service.create.mockResolvedValue(especie);
    service.update.mockResolvedValue(especie);
    service.remove.mockResolvedValue(undefined);

    await expect(controller.findAll({ limit: 20, offset: 0 })).resolves.toEqual(
      page,
    );
    await expect(controller.findOne(1)).resolves.toEqual(especie);
    await expect(
      controller.create({ familiaId: 1, nombreCientifico: 'Eucalyptus' }),
    ).resolves.toEqual(especie);
    await expect(controller.update(1, { familiaId: 2 })).resolves.toEqual(
      especie,
    );
    await expect(controller.remove(1)).resolves.toBeUndefined();

    expect(service.create).toHaveBeenCalledWith({
      familiaId: 1,
      nombreCientifico: 'Eucalyptus',
    });
    expect(service.update).toHaveBeenCalledWith(1, { familiaId: 2 });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
