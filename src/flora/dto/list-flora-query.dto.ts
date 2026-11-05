import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { EstadoFlora } from '../../generated/prisma/enums.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class ListFloraQueryDto extends PaginationQueryDto {
  /** Only specimens of this plant. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  plantaId?: number;

  @IsOptional()
  @IsEnum(EstadoFlora)
  estado?: EstadoFlora;
}
