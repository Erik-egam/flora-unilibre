import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { PageDto } from '../common/dto/page.dto.js';
import { CreateEspecieDto } from './dto/create-especie.dto.js';
import { ListEspeciesQueryDto } from './dto/list-especies-query.dto.js';
import { UpdateEspecieDto } from './dto/update-especie.dto.js';
import { EspecieService } from './especie.service.js';
import type { EspecieWithFamilia } from './especie.repository.js';

@Controller('especies')
export class EspecieController {
  constructor(private readonly especieService: EspecieService) {}

  @Get()
  findAll(
    @Query() query: ListEspeciesQueryDto,
  ): Promise<PageDto<EspecieWithFamilia>> {
    return this.especieService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EspecieWithFamilia> {
    return this.especieService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateEspecieDto): Promise<EspecieWithFamilia> {
    return this.especieService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEspecieDto,
  ): Promise<EspecieWithFamilia> {
    return this.especieService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.especieService.remove(id);
  }
}
