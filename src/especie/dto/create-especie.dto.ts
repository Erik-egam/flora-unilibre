import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEspecieDto {
  /** Parent `familia.id`. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  familiaId!: number;

  /** Ej: Eucalyptus grandis W.Hill ex Maiden. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombreCientifico!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  descripcion?: string;
}
