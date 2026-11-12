import type { Prisma, PrismaClient } from '@/generated/prisma/client';
import type { ListEspeciesQuery } from './especie.schemas';

/**
 * Reads embed the parent family (id + name): listing species is almost always
 * rendered next to the family they belong to.
 */
export const especieInclude = {
  familia: { select: { id: true, nombre: true } },
} satisfies Prisma.EspecieInclude;

export type EspecieWithFamilia = Prisma.EspecieGetPayload<{
  include: typeof especieInclude;
}>;

export interface EspecieData {
  familiaId: number;
  nombreCientifico: string;
  descripcion?: string | null;
}

/** Every Prisma query for `especie` lives here. */
export class EspecieRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPage(
    query: ListEspeciesQuery,
  ): Promise<[EspecieWithFamilia[], number]> {
    const where: Prisma.EspecieWhereInput = {
      ...(query.familiaId !== undefined && { familiaId: query.familiaId }),
      ...(query.q && {
        nombreCientifico: { contains: query.q, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.especie.findMany({
        where,
        include: especieInclude,
        orderBy: { nombreCientifico: 'asc' },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.especie.count({ where }),
    ]);

    return [data, total];
  }

  findById(id: number): Promise<EspecieWithFamilia | null> {
    return this.prisma.especie.findUnique({
      where: { id },
      include: especieInclude,
    });
  }

  create(data: EspecieData): Promise<EspecieWithFamilia> {
    return this.prisma.especie.create({ data, include: especieInclude });
  }

  update(
    id: number,
    data: Partial<EspecieData>,
  ): Promise<EspecieWithFamilia> {
    return this.prisma.especie.update({
      where: { id },
      data,
      include: especieInclude,
    });
  }

  remove(id: number): Promise<EspecieWithFamilia> {
    return this.prisma.especie.delete({ where: { id }, include: especieInclude });
  }
}
