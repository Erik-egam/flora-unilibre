import { Injectable } from '@nestjs/common';
import type { Familia, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ListFamiliasQueryDto } from './dto/list-familias-query.dto.js';

export interface FamiliaData {
  nombre: string;
  descripcion?: string | null;
}

/** Every Prisma query for `familia` lives here; the service never sees Prisma. */
@Injectable()
export class FamiliaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPage(query: ListFamiliasQueryDto): Promise<[Familia[], number]> {
    const where: Prisma.FamiliaWhereInput = query.q
      ? { nombre: { contains: query.q, mode: 'insensitive' } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.familia.findMany({
        where,
        orderBy: { nombre: 'asc' },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.familia.count({ where }),
    ]);

    return [data, total];
  }

  findById(id: number): Promise<Familia | null> {
    return this.prisma.familia.findUnique({ where: { id } });
  }

  create(data: FamiliaData): Promise<Familia> {
    return this.prisma.familia.create({ data });
  }

  update(id: number, data: Partial<FamiliaData>): Promise<Familia> {
    return this.prisma.familia.update({ where: { id }, data });
  }

  remove(id: number): Promise<Familia> {
    return this.prisma.familia.delete({ where: { id } });
  }
}
