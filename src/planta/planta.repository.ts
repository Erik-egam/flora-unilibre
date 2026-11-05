import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ListPlantasQueryDto } from './dto/list-plantas-query.dto.js';

/** Reads embed the species and its family, one call away from the catalog UI. */
export const plantaInclude = {
  especie: {
    select: {
      id: true,
      nombreCientifico: true,
      familia: { select: { id: true, nombre: true } },
    },
  },
} satisfies Prisma.PlantaInclude;

export type PlantaWithRelations = Prisma.PlantaGetPayload<{
  include: typeof plantaInclude;
}>;

export interface PlantaData {
  especieId: number;
  nombreComun: string;
  descripcion?: string | null;
  imgUrl?: string | null;
}

/** Every Prisma query for `planta` lives here. */
@Injectable()
export class PlantaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPage(
    query: ListPlantasQueryDto,
  ): Promise<[PlantaWithRelations[], number]> {
    const where: Prisma.PlantaWhereInput = {
      ...(query.especieId !== undefined && { especieId: query.especieId }),
      ...(query.q && {
        nombreComun: { contains: query.q, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.planta.findMany({
        where,
        include: plantaInclude,
        orderBy: { nombreComun: 'asc' },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.planta.count({ where }),
    ]);

    return [data, total];
  }

  findById(id: number): Promise<PlantaWithRelations | null> {
    return this.prisma.planta.findUnique({
      where: { id },
      include: plantaInclude,
    });
  }

  create(data: PlantaData): Promise<PlantaWithRelations> {
    return this.prisma.planta.create({ data, include: plantaInclude });
  }

  update(id: number, data: Partial<PlantaData>): Promise<PlantaWithRelations> {
    return this.prisma.planta.update({
      where: { id },
      data,
      include: plantaInclude,
    });
  }

  remove(id: number): Promise<PlantaWithRelations> {
    return this.prisma.planta.delete({ where: { id }, include: plantaInclude });
  }
}
