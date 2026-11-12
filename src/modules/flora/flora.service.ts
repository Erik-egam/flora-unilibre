import { ApiError } from '@/lib/errors';
import type { PageDto } from '@/lib/pagination';
import type { FloraResponse } from './flora-response';
import { toFloraResponse } from './flora-response';
import { FloraRepository } from './flora.repository';
import type {
  CreateFloraInput,
  ListFloraQuery,
  UpdateFloraInput,
} from './flora.schemas';

export class FloraService {
  constructor(private readonly repository: FloraRepository) {}

  async findAll(query: ListFloraQuery): Promise<PageDto<FloraResponse>> {
    const [rows, total] = await this.repository.findPage(query);

    return {
      data: rows.map(toFloraResponse),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  async findOne(id: number): Promise<FloraResponse> {
    const flora = await this.repository.findById(id);
    if (!flora) {
      throw new ApiError(404, `Flora ${id} no encontrada`);
    }

    return toFloraResponse(flora);
  }

  async create(dto: CreateFloraInput): Promise<FloraResponse> {
    const flora = await this.repository.create({
      id: dto.id,
      plantaId: dto.plantaId,
      latitud: dto.latitud,
      longitud: dto.longitud,
      imgUrl: dto.imgUrl ?? null,
      estado: dto.estado,
    });

    return toFloraResponse(flora);
  }

  async update(id: number, dto: UpdateFloraInput): Promise<FloraResponse> {
    await this.findOne(id);

    const flora = await this.repository.update(id, {
      plantaId: dto.plantaId,
      latitud: dto.latitud,
      longitud: dto.longitud,
      imgUrl: dto.imgUrl,
      estado: dto.estado,
    });

    return toFloraResponse(flora);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.remove(id);
  }
}
