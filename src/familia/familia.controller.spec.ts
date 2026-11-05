import { Test } from '@nestjs/testing';
import { FamiliaController } from './familia.controller.js';
import { FamiliaService } from './familia.service.js';

const familia = { id: 1, nombre: 'Myrtaceae', descripcion: null };

function createService() {
  return {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

describe('FamiliaController', () => {
  let controller: FamiliaController;
  let service: ReturnType<typeof createService>;

  beforeEach(async () => {
    service = createService();
    const moduleRef = await Test.createTestingModule({
      controllers: [FamiliaController],
      providers: [{ provide: FamiliaService, useValue: service }],
    }).compile();

    controller = moduleRef.get(FamiliaController);
  });

  it('delegates every route to the service', async () => {
    const page = { data: [familia], total: 1, limit: 20, offset: 0 };
    service.findAll.mockResolvedValue(page);
    service.findOne.mockResolvedValue(familia);
    service.create.mockResolvedValue(familia);
    service.update.mockResolvedValue(familia);
    service.remove.mockResolvedValue(undefined);

    await expect(controller.findAll({ limit: 20, offset: 0 })).resolves.toEqual(
      page,
    );
    await expect(controller.findOne(1)).resolves.toEqual(familia);
    await expect(controller.create({ nombre: 'Myrtaceae' })).resolves.toEqual(
      familia,
    );
    await expect(controller.update(1, { nombre: 'X' })).resolves.toEqual(
      familia,
    );
    await expect(controller.remove(1)).resolves.toBeUndefined();

    expect(service.findAll).toHaveBeenCalledWith({ limit: 20, offset: 0 });
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(service.update).toHaveBeenCalledWith(1, { nombre: 'X' });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
