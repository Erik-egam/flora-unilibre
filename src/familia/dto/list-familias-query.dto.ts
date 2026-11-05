import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class ListFamiliasQueryDto extends PaginationQueryDto {
  /** Case-insensitive search over `nombre`. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}
