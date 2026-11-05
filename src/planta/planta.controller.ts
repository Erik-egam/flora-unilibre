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
import { CreatePlantaDto } from './dto/create-planta.dto.js';
import { ListPlantasQueryDto } from './dto/list-plantas-query.dto.js';
import { UpdatePlantaDto } from './dto/update-planta.dto.js';
import { PlantaService } from './planta.service.js';
import type { PlantaWithRelations } from './planta.repository.js';

@Controller('plantas')
export class PlantaController {
  constructor(private readonly plantaService: PlantaService) {}

  @Get()
  findAll(
    @Query() query: ListPlantasQueryDto,
  ): Promise<PageDto<PlantaWithRelations>> {
    return this.plantaService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PlantaWithRelations> {
    return this.plantaService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePlantaDto): Promise<PlantaWithRelations> {
    return this.plantaService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlantaDto,
  ): Promise<PlantaWithRelations> {
    return this.plantaService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.plantaService.remove(id);
  }
}
