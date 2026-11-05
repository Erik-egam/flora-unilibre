import { Module } from '@nestjs/common';
import { PlantaController } from './planta.controller.js';
import { PlantaRepository } from './planta.repository.js';
import { PlantaService } from './planta.service.js';

@Module({
  controllers: [PlantaController],
  providers: [PlantaService, PlantaRepository],
})
export class PlantaModule {}
