import { ApiError } from '@/lib/errors';
import type { PageDto } from '@/lib/pagination';
import { EspecieRepository, type EspecieWithFamilia } from './especie.repository';
import type {
  CreateEspecieInput,
  ListEspeciesQuery,
  UpdateEspecieInput,
} from './especie.schemas';

export class EspecieService {
  constructor(private readonly repository: EspecieRepository) {}

  async findAll(
    query: ListEspeciesQuery,
  ): Promise<PageDto<EspecieWithFamilia>> {
    const [data, total] = await this.repository.findPage(query);

    return { data, total, limit: query.limit, offset: query.offset };
  }

  async findOne(id: number): Promise<EspecieWithFamilia> {
    const especie = await this.repository.findById(id);
    if (!especie) {
      throw new ApiError(404, `Especie ${id} no encontrada`);
    }

    return especie;
  }

  create(dto: CreateEspecieInput): Promise<EspecieWithFamilia> {
    return this.repository.create({
      familiaId: dto.familiaId,
      nombreCientifico: dto.nombreCientifico,
      descripcion: dto.descripcion ?? null,
    });
  }

  async update(
    id: number,
    dto: UpdateEspecieInput,
  ): Promise<EspecieWithFamilia> {
    await this.findOne(id);

    return this.repository.update(id, {
      familiaId: dto.familiaId,
      nombreCientifico: dto.nombreCientifico,
      descripcion: dto.descripcion,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.remove(id);
  }
}
