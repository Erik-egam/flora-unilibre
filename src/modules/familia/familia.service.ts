import type { Familia } from '@/generated/prisma/client';
import { ApiError } from '@/lib/errors';
import type { PageDto } from '@/lib/pagination';
import { FamiliaRepository } from './familia.repository';
import type {
  CreateFamiliaInput,
  ListFamiliasQuery,
  UpdateFamiliaInput,
} from './familia.schemas';

export class FamiliaService {
  constructor(private readonly repository: FamiliaRepository) {}

  async findAll(query: ListFamiliasQuery): Promise<PageDto<Familia>> {
    const [data, total] = await this.repository.findPage(query);

    return { data, total, limit: query.limit, offset: query.offset };
  }

  async findOne(id: number): Promise<Familia> {
    const familia = await this.repository.findById(id);
    if (!familia) {
      throw new ApiError(404, `Familia ${id} no encontrada`);
    }

    return familia;
  }

  create(dto: CreateFamiliaInput): Promise<Familia> {
    return this.repository.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
    });
  }

  async update(id: number, dto: UpdateFamiliaInput): Promise<Familia> {
    await this.findOne(id);

    return this.repository.update(id, {
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.remove(id);
  }
}
