import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class ListPlantasQueryDto extends PaginationQueryDto {
  /** Only plants of this species. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  especieId?: number;

  /** Case-insensitive search over `nombreComun`. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}
