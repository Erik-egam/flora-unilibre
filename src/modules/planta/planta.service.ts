import { ApiError } from '@/lib/errors';
import type { PageDto } from '@/lib/pagination';
import {
  PlantaRepository,
  type PlantaWithRelations,
} from './planta.repository';
import type {
  CreatePlantaInput,
  ListPlantasQuery,
  UpdatePlantaInput,
} from './planta.schemas';

export class PlantaService {
  constructor(private readonly repository: PlantaRepository) {}

  async findAll(
    query: ListPlantasQuery,
  ): Promise<PageDto<PlantaWithRelations>> {
    const [data, total] = await this.repository.findPage(query);

    return { data, total, limit: query.limit, offset: query.offset };
  }

  async findOne(id: number): Promise<PlantaWithRelations> {
    const planta = await this.repository.findById(id);
    if (!planta) {
      throw new ApiError(404, `Planta ${id} no encontrada`);
    }

    return planta;
  }

  create(dto: CreatePlantaInput): Promise<PlantaWithRelations> {
    return this.repository.create({
      especieId: dto.especieId,
      nombreComun: dto.nombreComun,
      descripcion: dto.descripcion ?? null,
      imgUrl: dto.imgUrl ?? null,
    });
  }

  async update(
    id: number,
    dto: UpdatePlantaInput,
  ): Promise<PlantaWithRelations> {
    await this.findOne(id);

    return this.repository.update(id, {
      especieId: dto.especieId,
      nombreComun: dto.nombreComun,
      descripcion: dto.descripcion,
      imgUrl: dto.imgUrl,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.remove(id);
  }
}
