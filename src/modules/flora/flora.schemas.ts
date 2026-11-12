import { z } from 'zod';
import { EstadoFlora } from '@/generated/prisma/enums';
import { paginationSchema } from '@/lib/pagination';

/** `Decimal(9,6)` columns accept at most six decimal places. */
function coordinate(min: number, max: number) {
  return z.coerce
    .number()
    .min(min)
    .max(max)
    .refine(
      (value) =>
        Math.abs(value * 1_000_000 - Math.round(value * 1_000_000)) < 1e-6,
      'must have at most 6 decimal places',
    );
}

export const createFloraSchema = z.strictObject({
  /** Physical plate number (ej: 50). The column is not auto-incremented. */
  id: z.coerce.number().int().min(1),
  /** Parent `planta.id`. */
  plantaId: z.coerce.number().int().min(1),
  latitud: coordinate(-90, 90),
  longitud: coordinate(-180, 180),
  imgUrl: z.string().url().max(500).nullish(),
  /** Defaults to `vivo` in the database when omitted. */
  estado: z.enum(EstadoFlora).optional(),
});

/** `id` is the plate number: it identifies the row and cannot be patched. */
export const updateFloraSchema = createFloraSchema.omit({ id: true }).partial();

export const listFloraQuerySchema = paginationSchema.extend({
  /** Only specimens of this plant. */
  plantaId: z.coerce.number().int().min(1).optional(),
  estado: z.enum(EstadoFlora).optional(),
});

export type CreateFloraInput = z.infer<typeof createFloraSchema>;
export type UpdateFloraInput = z.infer<typeof updateFloraSchema>;
export type ListFloraQuery = z.infer<typeof listFloraQuerySchema>;
