import type { FloraWithRelations } from '../flora.repository.js';

/**
 * Prisma exposes `Decimal(9,6)` columns as `Prisma.Decimal`, which serializes
 * to a JSON string. Coordinates are safe as JS numbers at this precision, so
 * the API returns them as numbers (the map client expects numbers).
 */
export type FloraResponse = Omit<FloraWithRelations, 'latitud' | 'longitud'> & {
  latitud: number;
  longitud: number;
};

export function toFloraResponse(row: FloraWithRelations): FloraResponse {
  return {
    ...row,
    latitud: row.latitud.toNumber(),
    longitud: row.longitud.toNumber(),
  };
}
