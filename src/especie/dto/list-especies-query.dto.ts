import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class ListEspeciesQueryDto extends PaginationQueryDto {
  /** Only species of this family. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  familiaId?: number;

  /** Case-insensitive search over `nombreCientifico`. */
  @IsOptional()
  @IsString()
  @MaxLength(150)
  q?: string;
}
