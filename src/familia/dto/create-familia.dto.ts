import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFamiliaDto {
  /** Ej: Myrtaceae. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  descripcion?: string;
}
