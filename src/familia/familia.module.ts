import { Module } from '@nestjs/common';
import { FamiliaController } from './familia.controller.js';
import { FamiliaRepository } from './familia.repository.js';
import { FamiliaService } from './familia.service.js';

@Module({
  controllers: [FamiliaController],
  providers: [FamiliaService, FamiliaRepository],
})
export class FamiliaModule {}
