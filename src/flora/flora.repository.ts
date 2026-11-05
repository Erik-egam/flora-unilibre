import { Injectable } from '@nestjs/common';
import type { EstadoFlora, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ListFloraQueryDto } from './dto/list-flora-query.dto.js';

/** Reads embed the plant, its species and its family. */
export const floraInclude = {
  planta: {
    select: {
      id: true,
      nombreComun: true,
      especie: {
        select: {
          id: true,
          nombreCientifico: true,
          familia: { select: { id: true, nombre: true } },
        },
      },
    },
  },
} satisfies Prisma.FloraInclude;

export type FloraWithRelations = Prisma.FloraGetPayload<{
  include: typeof floraInclude;
}>;

export interface FloraData {
  plantaId: number;
  latitud: number;
  longitud: number;
  imgUrl?: string | null;
  estado?: EstadoFlora;
}

/** Every Prisma query for `flora` lives here. */
@Injectable()
export class FloraRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPage(
    query: ListFloraQueryDto,
  ): Promise<[FloraWithRelations[], number]> {
    const where: Prisma.FloraWhereInput = {
      ...(query.plantaId !== undefined && { plantaId: query.plantaId }),
      ...(query.estado !== undefined && { estado: query.estado }),
    };

    const [data, total] = await Promise.all([
      this.prisma.flora.findMany({
        where,
        include: floraInclude,
        orderBy: { id: 'asc' },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.flora.count({ where }),
    ]);

    return [data, total];
  }

  findById(id: number): Promise<FloraWithRelations | null> {
    return this.prisma.flora.findUnique({
      where: { id },
      include: floraInclude,
    });
  }

  create(data: FloraData & { id: number }): Promise<FloraWithRelations> {
    return this.prisma.flora.create({ data, include: floraInclude });
  }

  update(id: number, data: Partial<FloraData>): Promise<FloraWithRelations> {
    return this.prisma.flora.update({
      where: { id },
      data,
      include: floraInclude,
    });
  }

  remove(id: number): Promise<FloraWithRelations> {
    return this.prisma.flora.delete({ where: { id }, include: floraInclude });
  }
}
