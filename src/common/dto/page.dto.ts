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
