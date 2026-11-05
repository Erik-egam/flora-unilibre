import { Injectable, NotFoundException } from '@nestjs/common';
import type { PageDto } from '../common/dto/page.dto.js';
import type { CreateEspecieDto } from './dto/create-especie.dto.js';
import type { ListEspeciesQueryDto } from './dto/list-especies-query.dto.js';
import type { UpdateEspecieDto } from './dto/update-especie.dto.js';
import {
  EspecieRepository,
  type EspecieWithFamilia,
} from './especie.repository.js';

@Injectable()
export class EspecieService {
  constructor(private readonly repository: EspecieRepository) {}

  async findAll(
    query: ListEspeciesQueryDto,
  ): Promise<PageDto<EspecieWithFamilia>> {
    const [data, total] = await this.repository.findPage(query);

    return { data, total, limit: query.limit, offset: query.offset };
  }

  async findOne(id: number): Promise<EspecieWithFamilia> {
    const especie = await this.repository.findById(id);
    if (!especie) {
      throw new NotFoundException(`Especie ${id} no encontrada`);
    }

    return especie;
  }

  create(dto: CreateEspecieDto): Promise<EspecieWithFamilia> {
    return this.repository.create({
      familiaId: dto.familiaId,
      nombreCientifico: dto.nombreCientifico,
      descripcion: dto.descripcion ?? null,
    });
  }

  async update(
    id: number,
    dto: UpdateEspecieDto,
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
