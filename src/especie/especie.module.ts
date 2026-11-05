import { Module } from '@nestjs/common';
import { EspecieController } from './especie.controller.js';
import { EspecieRepository } from './especie.repository.js';
import { EspecieService } from './especie.service.js';

@Module({
  controllers: [EspecieController],
  providers: [EspecieService, EspecieRepository],
})
export class EspecieModule {}
