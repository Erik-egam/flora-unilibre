import { Test } from '@nestjs/testing';
import { PlantaController } from './planta.controller.js';
import { PlantaService } from './planta.service.js';

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

function createService() {
  return {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

describe('PlantaController', () => {
  let controller: PlantaController;
  let service: ReturnType<typeof createService>;

  beforeEach(async () => {
    service = createService();
    const moduleRef = await Test.createTestingModule({
      controllers: [PlantaController],
      providers: [{ provide: PlantaService, useValue: service }],
    }).compile();

    controller = moduleRef.get(PlantaController);
  });

  it('delegates every route to the service', async () => {
    const page = { data: [planta], total: 1, limit: 20, offset: 0 };
    service.findAll.mockResolvedValue(page);
    service.findOne.mockResolvedValue(planta);
    service.create.mockResolvedValue(planta);
    service.update.mockResolvedValue(planta);
    service.remove.mockResolvedValue(undefined);

    await expect(controller.findAll({ limit: 20, offset: 0 })).resolves.toEqual(
      page,
    );
    await expect(controller.findOne(2)).resolves.toEqual(planta);
    await expect(
      controller.create({ especieId: 1, nombreComun: 'Eucalipto' }),
    ).resolves.toEqual(planta);
    await expect(controller.update(2, { nombreComun: 'X' })).resolves.toEqual(
      planta,
    );
    await expect(controller.remove(2)).resolves.toBeUndefined();

    expect(service.findAll).toHaveBeenCalledWith({ limit: 20, offset: 0 });
    expect(service.findOne).toHaveBeenCalledWith(2);
    expect(service.create).toHaveBeenCalledWith({
      especieId: 1,
      nombreComun: 'Eucalipto',
    });
    expect(service.remove).toHaveBeenCalledWith(2);
  });
});
