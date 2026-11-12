import { z } from 'zod';

/** `limit`/`offset` query parameters shared by every list endpoint. */
export const paginationSchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

/**
 * Envelope returned by every list endpoint. `total` counts the rows matching
 * the filters, ignoring `limit`/`offset`, so clients can paginate without
 * guessing.
 */
export interface PageDto<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
