import { Injectable, NotFoundException } from '@nestjs/common';
import type { PageDto } from '../common/dto/page.dto.js';
import type { CreatePlantaDto } from './dto/create-planta.dto.js';
import type { ListPlantasQueryDto } from './dto/list-plantas-query.dto.js';
import type { UpdatePlantaDto } from './dto/update-planta.dto.js';
import {
  PlantaRepository,
  type PlantaWithRelations,
} from './planta.repository.js';

@Injectable()
export class PlantaService {
  constructor(private readonly repository: PlantaRepository) {}

  async findAll(
    query: ListPlantasQueryDto,
  ): Promise<PageDto<PlantaWithRelations>> {
    const [data, total] = await this.repository.findPage(query);

    return { data, total, limit: query.limit, offset: query.offset };
  }

  async findOne(id: number): Promise<PlantaWithRelations> {
    const planta = await this.repository.findById(id);
    if (!planta) {
      throw new NotFoundException(`Planta ${id} no encontrada`);
    }

    return planta;
  }

  create(dto: CreatePlantaDto): Promise<PlantaWithRelations> {
    return this.repository.create({
      especieId: dto.especieId,
      nombreComun: dto.nombreComun,
      descripcion: dto.descripcion ?? null,
      imgUrl: dto.imgUrl ?? null,
    });
  }

  async update(id: number, dto: UpdatePlantaDto): Promise<PlantaWithRelations> {
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
