import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoFlora } from '../../generated/prisma/enums.js';

export class CreateFloraDto {
  /** Physical plate number (ej: 50). The column is not auto-incremented. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id!: number;

  /** Parent `planta.id`. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  plantaId!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  latitud!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  longitud!: number;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imgUrl?: string;

  /** Defaults to `vivo` in the database when omitted. */
  @IsOptional()
  @IsEnum(EstadoFlora)
  estado?: EstadoFlora;
}
