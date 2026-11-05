import { Test } from '@nestjs/testing';
import { EstadoFlora } from '../generated/prisma/client.js';
import { FloraController } from './flora.controller.js';
import { FloraService } from './flora.service.js';

const floraResponse = {
  id: 50,
  plantaId: 2,
  latitud: 4.60971,
  longitud: -74.08175,
  imgUrl: null,
  estado: EstadoFlora.vivo,
  createdAt: new Date('2026-11-05T10:00:00.000Z'),
  planta: {
    id: 2,
    nombreComun: 'Eucalipto',
    especie: {
      id: 1,
      nombreCientifico: 'Eucalyptus grandis W.Hill ex Maiden',
      familia: { id: 1, nombre: 'Myrtaceae' },
    },
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

describe('FloraController', () => {
  let controller: FloraController;
  let service: ReturnType<typeof createService>;

  beforeEach(async () => {
    service = createService();
    const moduleRef = await Test.createTestingModule({
      controllers: [FloraController],
      providers: [{ provide: FloraService, useValue: service }],
    }).compile();

    controller = moduleRef.get(FloraController);
  });

  it('delegates every route to the service', async () => {
    const page = { data: [floraResponse], total: 1, limit: 20, offset: 0 };
    service.findAll.mockResolvedValue(page);
    service.findOne.mockResolvedValue(floraResponse);
    service.create.mockResolvedValue(floraResponse);
    service.update.mockResolvedValue(floraResponse);
    service.remove.mockResolvedValue(undefined);

    await expect(
      controller.findAll({ limit: 20, offset: 0, estado: EstadoFlora.vivo }),
    ).resolves.toEqual(page);
    await expect(controller.findOne(50)).resolves.toEqual(floraResponse);
    await expect(
      controller.create({
        id: 50,
        plantaId: 2,
        latitud: 4.60971,
        longitud: -74.08175,
      }),
    ).resolves.toEqual(floraResponse);
    await expect(controller.update(50, { estado: EstadoFlora.muerto })).resolves.toEqual(
      floraResponse,
    );
    await expect(controller.remove(50)).resolves.toBeUndefined();

    expect(service.findOne).toHaveBeenCalledWith(50);
    expect(service.update).toHaveBeenCalledWith(50, {
      estado: EstadoFlora.muerto,
    });
    expect(service.remove).toHaveBeenCalledWith(50);
  });
});
