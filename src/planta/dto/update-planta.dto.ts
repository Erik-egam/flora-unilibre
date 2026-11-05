import { PartialType } from '@nestjs/mapped-types';
import { CreatePlantaDto } from './create-planta.dto.js';

export class UpdatePlantaDto extends PartialType(CreatePlantaDto) {}
