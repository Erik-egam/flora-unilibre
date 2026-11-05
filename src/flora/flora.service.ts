import { Injectable, NotFoundException } from '@nestjs/common';
import type { PageDto } from '../common/dto/page.dto.js';
import type { CreateFloraDto } from './dto/create-flora.dto.js';
import { toFloraResponse, type FloraResponse } from './dto/flora-response.dto.js';
import type { ListFloraQueryDto } from './dto/list-flora-query.dto.js';
import type { UpdateFloraDto } from './dto/update-flora.dto.js';
import { FloraRepository } from './flora.repository.js';

@Injectable()
export class FloraService {
  constructor(private readonly repository: FloraRepository) {}

  async findAll(query: ListFloraQueryDto): Promise<PageDto<FloraResponse>> {
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
      throw new NotFoundException(`Flora ${id} no encontrada`);
    }

    return toFloraResponse(flora);
  }

  async create(dto: CreateFloraDto): Promise<FloraResponse> {
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

  async update(id: number, dto: UpdateFloraDto): Promise<FloraResponse> {
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
