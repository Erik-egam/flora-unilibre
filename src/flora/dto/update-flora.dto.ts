import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateFloraDto } from './create-flora.dto.js';

/** `id` is the plate number: it identifies the row and cannot be patched. */
export class UpdateFloraDto extends PartialType(
  OmitType(CreateFloraDto, ['id'] as const),
) {}
