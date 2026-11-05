import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * `limit`/`offset` query parameters shared by every list endpoint. Concrete
 * features extend this class and add their own filters.
 *
 * Query strings arrive as strings, so each numeric field is converted
 * explicitly with `@Type`; the global pipe does not enable implicit conversion.
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;
}
