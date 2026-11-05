import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlantaDto {
  /** Parent `especie.id`. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  especieId!: number;

  /** Ej: Eucalipto. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombreComun!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  descripcion?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imgUrl?: string;
}
