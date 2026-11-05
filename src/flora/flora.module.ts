import { Module } from '@nestjs/common';
import { FloraController } from './flora.controller.js';
import { FloraRepository } from './flora.repository.js';
import { FloraService } from './flora.service.js';

@Module({
  controllers: [FloraController],
  providers: [FloraService, FloraRepository],
})
export class FloraModule {}
