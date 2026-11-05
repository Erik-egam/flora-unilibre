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
import type { Familia } from '../generated/prisma/client.js';
import { CreateFamiliaDto } from './dto/create-familia.dto.js';
import { ListFamiliasQueryDto } from './dto/list-familias-query.dto.js';
import { UpdateFamiliaDto } from './dto/update-familia.dto.js';
import { FamiliaService } from './familia.service.js';

@Controller('familias')
export class FamiliaController {
  constructor(private readonly familiaService: FamiliaService) {}

  @Get()
  findAll(@Query() query: ListFamiliasQueryDto): Promise<PageDto<Familia>> {
    return this.familiaService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Familia> {
    return this.familiaService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFamiliaDto): Promise<Familia> {
    return this.familiaService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFamiliaDto,
  ): Promise<Familia> {
    return this.familiaService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.familiaService.remove(id);
  }
}
