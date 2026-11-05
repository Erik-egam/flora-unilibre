import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EstadoFlora, Prisma } from '../generated/prisma/client.js';
import { FloraRepository } from './flora.repository.js';
import { FloraService } from './flora.service.js';

const floraRow = {
  id: 50,
  plantaId: 2,
  latitud: new Prisma.Decimal('4.609710'),
  longitud: new Prisma.Decimal('-74.081750'),
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

function createRepository() {
  return {
    findPage: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

describe('FloraService', () => {
  let service: FloraService;
  let repository: ReturnType<typeof createRepository>;

  beforeEach(async () => {
    repository = createRepository();
    const moduleRef = await Test.createTestingModule({
      providers: [
        FloraService,
        { provide: FloraRepository, useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(FloraService);
  });

  it('returns coordinates as numbers instead of Decimal strings', async () => {
    repository.findPage.mockResolvedValue([[floraRow], 1]);

    const page = await service.findAll({ limit: 20, offset: 0 });

    expect(page.total).toBe(1);
    expect(page.data[0].latitud).toBe(4.60971);
    expect(page.data[0].longitud).toBe(-74.08175);
    expect(typeof page.data[0].latitud).toBe('number');
  });

  it('throws NotFoundException when the plate does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates flora with the plate number as id', async () => {
    repository.create.mockResolvedValue(floraRow);

    const created = await service.create({
      id: 50,
      plantaId: 2,
      latitud: 4.60971,
      longitud: -74.08175,
    });

    expect(repository.create).toHaveBeenCalledWith({
      id: 50,
      plantaId: 2,
      latitud: 4.60971,
      longitud: -74.08175,
      imgUrl: null,
      estado: undefined,
    });
    expect(created.latitud).toBe(4.60971);
  });

  it('updates without sending the immutable plate number', async () => {
    repository.findById.mockResolvedValue(floraRow);
    repository.update.mockResolvedValue(floraRow);

    await service.update(50, { estado: EstadoFlora.talado });

    expect(repository.update).toHaveBeenCalledWith(50, {
      estado: EstadoFlora.talado,
    });
  });

  it('checks existence before removing', async () => {
    repository.findById.mockResolvedValue(floraRow);
    repository.remove.mockResolvedValue(floraRow);

    await service.remove(50);

    expect(repository.remove).toHaveBeenCalledWith(50);
  });
});
