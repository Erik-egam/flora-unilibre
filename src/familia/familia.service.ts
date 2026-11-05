import { Injectable, NotFoundException } from '@nestjs/common';
import type { PageDto } from '../common/dto/page.dto.js';
import type { Familia } from '../generated/prisma/client.js';
import type { CreateFamiliaDto } from './dto/create-familia.dto.js';
import type { ListFamiliasQueryDto } from './dto/list-familias-query.dto.js';
import type { UpdateFamiliaDto } from './dto/update-familia.dto.js';
import { FamiliaRepository } from './familia.repository.js';

@Injectable()
export class FamiliaService {
  constructor(private readonly repository: FamiliaRepository) {}

  async findAll(query: ListFamiliasQueryDto): Promise<PageDto<Familia>> {
    const [data, total] = await this.repository.findPage(query);

    return { data, total, limit: query.limit, offset: query.offset };
  }

  async findOne(id: number): Promise<Familia> {
    const familia = await this.repository.findById(id);
    if (!familia) {
      throw new NotFoundException(`Familia ${id} no encontrada`);
    }

    return familia;
  }

  create(dto: CreateFamiliaDto): Promise<Familia> {
    return this.repository.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
    });
  }

  async update(id: number, dto: UpdateFamiliaDto): Promise<Familia> {
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
