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
import { CreateFloraDto } from './dto/create-flora.dto.js';
import type { FloraResponse } from './dto/flora-response.dto.js';
import { ListFloraQueryDto } from './dto/list-flora-query.dto.js';
import { UpdateFloraDto } from './dto/update-flora.dto.js';
import { FloraService } from './flora.service.js';

@Controller('flora')
export class FloraController {
  constructor(private readonly floraService: FloraService) {}

  @Get()
  findAll(@Query() query: ListFloraQueryDto): Promise<PageDto<FloraResponse>> {
    return this.floraService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FloraResponse> {
    return this.floraService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFloraDto): Promise<FloraResponse> {
    return this.floraService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFloraDto,
  ): Promise<FloraResponse> {
    return this.floraService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.floraService.remove(id);
  }
}
